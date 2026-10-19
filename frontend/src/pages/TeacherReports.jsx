import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, FileBarChart, ChevronRight, GraduationCap, CalendarRange } from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import { classApi } from '../services/endpoints';

const chipCls = (active) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'bg-accent-dim text-accent border-accent'
      : 'bg-elevated text-ink-dim border-border hover:border-border-strong'
  }`;

const TeacherReports = () => {
  const [classes, setClasses] = useState([]);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [activeTerm, setActiveTerm] = useState(null); // null = all, else "s/y" key
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTerms = async () => {
      try {
        const terms = await classApi.myTerms();
        const mapped = (Array.isArray(terms) ? terms : []).map((t) => ({
          key: `${t.semester}/${t.academic_year}`,
          label: t.term_label || `${t.semester}/${t.academic_year}`,
          semester: t.semester,
          academicYear: t.academic_year,
        }));
        setAvailableTerms(mapped.sort((a, b) => b.academicYear - a.academicYear || b.semester - a.semester));
      } catch (err) {
        console.error('Error loading terms:', err);
      }
    };
    loadTerms();
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = activeTerm
          ? (() => {
              const term = availableTerms.find((t) => t.key === activeTerm);
              return term ? { semester: term.semester, academic_year: term.academicYear } : {};
            })()
          : {};
        const data = await classApi.listMine(params);
        setClasses(
          (Array.isArray(data) ? data : []).map((c) => ({
            id: c.id,
            name: c.course_name || c.name,
            code: c.course_code || c.code,
          }))
        );
      } catch (err) {
        console.error('Error loading classes:', err);
        setError(err.response?.data?.error || 'ไม่สามารถโหลดคลาสเรียนได้');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeTerm, availableTerms]);

  return (
    <ProtectedLayout requiredRole="teacher">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">รายงาน</h1>
          <p className="text-muted text-sm mt-1">เลือกคลาสเรียนเพื่อดูรายงานการเช็คชื่อ</p>
        </div>

        {availableTerms.length > 0 && (
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-muted text-sm mr-1">
                <CalendarRange size={16} />
                ภาคเรียน
              </span>
              <button
                type="button"
                onClick={() => setActiveTerm(null)}
                className={chipCls(activeTerm === null)}
              >
                ทั้งหมด
              </button>
              {availableTerms.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTerm(t.key)}
                  className={chipCls(activeTerm === t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Card>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <Spinner />
        ) : classes.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap size={30} className="text-muted mb-3" />
              <p className="text-muted text-sm">ยังไม่มีคลาสเรียน</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <Link key={cls.id} to={`/teacher/classes/${cls.id}/reports`}>
                <div className="group surface-card p-5 hover:border-border-strong hover:shadow-elevated transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-accent-gradient flex items-center justify-center shrink-0 shadow-glow-sm">
                      <FileBarChart size={20} className="text-base" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-ink truncate group-hover:text-accent transition-colors">
                        {cls.name}
                      </h3>
                      <span className="font-mono text-xs text-muted">{cls.code}</span>
                    </div>
                    <ChevronRight size={18} className="text-muted group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default TeacherReports;
