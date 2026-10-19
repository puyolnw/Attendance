import React, { useEffect, useState } from 'react';
import { AlertCircle, CalendarRange } from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import ClassList from '../components/teacher/ClassList';
import { classApi } from '../services/endpoints';

const normalize = (c) => ({
  id: c.id,
  name: c.course_name || c.name,
  code: c.course_code || c.code,
  room: c.room_number || '—',
  schedule: c.schedule || '',
  termLabel: c.term_label || (c.semester && c.academic_year ? `${c.semester}/${c.academic_year}` : ''),
  enrollmentCount: c.enrollment_count ?? c.enrollmentCount ?? 0,
});

const chipCls = (active) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'bg-accent-dim text-accent border-accent'
      : 'bg-elevated text-ink-dim border-border hover:border-border-strong'
  }`;

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [activeTerm, setActiveTerm] = useState(null); // null = all
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (term = null) => {
    setIsLoading(true);
    setError('');
    try {
      const params = term ? { semester: term.semester, academic_year: term.academic_year } : {};
      const data = await classApi.listMine(params);
      setClasses((Array.isArray(data) ? data : []).map(normalize));
    } catch (err) {
      console.error('Error loading classes:', err);
      setError(err.response?.data?.error || 'ไม่สามารถโหลดคลาสเรียนได้');
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTerms = async () => {
    try {
      const data = await classApi.myTerms();
      setTerms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading terms:', err);
      setTerms([]);
    }
  };

  useEffect(() => {
    loadTerms();
    load(null);
  }, []);

  const selectTerm = (term) => {
    setActiveTerm(term);
    load(term);
  };

  const handleDelete = async (id) => {
    try {
      await classApi.remove(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting class:', err);
      setError(err.response?.data?.error || 'ไม่สามารถลบคลาสเรียนได้');
    }
  };

  return (
    <ProtectedLayout requiredRole="teacher">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">คลาสของฉัน</h1>
          <p className="text-muted text-sm mt-1">จัดการคลาสเรียนทั้งหมดของคุณ</p>
        </div>

        {terms.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-muted text-sm mr-1">
              <CalendarRange size={16} />
              ภาคเรียน
            </span>
            <button
              type="button"
              onClick={() => selectTerm(null)}
              className={chipCls(activeTerm === null)}
            >
              ทั้งหมด
            </button>
            {terms.map((t) => {
              const active =
                activeTerm &&
                activeTerm.semester === t.semester &&
                activeTerm.academic_year === t.academic_year;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => selectTerm(t)}
                  className={chipCls(!!active)}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <ClassList classes={classes} isLoading={isLoading} onDelete={handleDelete} />
      </div>
    </ProtectedLayout>
  );
};

export default TeacherClasses;
