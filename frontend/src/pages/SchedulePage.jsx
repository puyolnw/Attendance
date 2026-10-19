import React, { useEffect, useState } from 'react';
import { CalendarRange, AlertCircle } from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import TimetableGrid from '../components/common/TimetableGrid';
import { useAuth } from '../hooks/useAuth';
import { scheduleApi, classApi } from '../services/endpoints';

const chipCls = (active) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'bg-accent-dim text-accent border-accent'
      : 'bg-elevated text-ink-dim border-border hover:border-border-strong'
  }`;

const termsEqual = (a, b) =>
  !!a && !!b && a.semester === b.semester && a.academic_year === b.academic_year;

const SchedulePage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [termsReady, setTermsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = user?.role === 'teacher';
  const title = isTeacher ? 'ตารางสอน' : 'ตารางเรียน';
  const subtitle = isTeacher
    ? 'ตารางการสอนรายสัปดาห์ของคุณ'
    : 'ตารางเรียนรายสัปดาห์ของคุณ';

  // Resolve terms + default selection on mount. Only teachers get a selector.
  useEffect(() => {
    (async () => {
      const [termList, current] = await Promise.all([
        isTeacher ? classApi.myTerms().catch(() => []) : Promise.resolve([]),
        classApi.currentTerm().catch(() => null),
      ]);
      const list = Array.isArray(termList) ? termList : [];
      setTerms(list);
      const currentInList = current && list.find((t) => termsEqual(t, current));
      const def = currentInList || list[0] || current || null;
      setSelectedTerm(def);
      setTermsReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTeacher]);

  // Load schedule for the selected term (students → no params, backend uses CURRENT_TERM).
  useEffect(() => {
    if (!termsReady) return;
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = isTeacher && selectedTerm
          ? { semester: selectedTerm.semester, academic_year: selectedTerm.academic_year }
          : {};
        const rows = await scheduleApi.my(params);
        setItems(Array.isArray(rows) ? rows : []);
      } catch (err) {
        console.error('Failed to load schedule', err);
        setError(err?.response?.data?.error || 'ไม่สามารถโหลดตารางได้');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termsReady, isTeacher, selectedTerm?.semester, selectedTerm?.academic_year]);

  return (
    <ProtectedLayout requiredRole={user?.role}>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow-sm shrink-0">
            <CalendarRange size={22} className="text-base" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">{title}</h1>
            <p className="text-muted text-sm mt-1">{subtitle}</p>
          </div>
          {selectedTerm && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent-dim px-3.5 py-1.5 text-sm font-medium text-accent self-start">
              ภาคเรียน {selectedTerm.label}
            </span>
          )}
        </div>

        {/* Term selector — teachers only */}
        {isTeacher && terms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-muted text-sm mr-1">
              <CalendarRange size={16} />
              ภาคเรียน
            </span>
            {terms.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setSelectedTerm(t)}
                className={chipCls(termsEqual(selectedTerm, t))}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card padding>
          {isLoading ? (
            <Spinner message="กำลังโหลดตาราง..." />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarRange size={30} className="text-muted mb-3" />
              <p className="text-muted text-sm">
                {isTeacher ? 'ยังไม่มีตารางสอน' : 'ยังไม่มีตารางเรียน'}
              </p>
            </div>
          ) : (
            <TimetableGrid items={items} />
          )}
        </Card>
      </div>
    </ProtectedLayout>
  );
};

export default SchedulePage;
