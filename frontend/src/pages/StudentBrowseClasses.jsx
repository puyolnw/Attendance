import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Spinner from '../components/common/Spinner';
import { enrollmentApi } from '../services/endpoints';
import { AlertCircle, User, MapPin, Calendar, BookOpen, PlusCircle, CalendarRange } from 'lucide-react';

const chipCls = (active) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'bg-accent-dim text-accent border-accent'
      : 'bg-elevated text-ink-dim border-border hover:border-border-strong'
  }`;

const StudentMyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [activeTerm, setActiveTerm] = useState(null); // null = all; else `${semester}/${academic_year}`
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const rows = await enrollmentApi.myClasses();
      const list = Array.isArray(rows) ? rows : rows?.data ?? [];
      setClasses(list);
    } catch (err) {
      console.error('Failed to load my classes', err);
      setError(err?.response?.data?.error || 'ไม่สามารถโหลดวิชาที่ลงทะเบียนได้');
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Distinct terms, newest-first (academic_year desc, then semester desc)
  const terms = React.useMemo(() => {
    const map = new Map();
    classes.forEach((c) => {
      if (c.semester == null || c.academic_year == null) return;
      const key = `${c.semester}/${c.academic_year}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          semester: c.semester,
          academic_year: c.academic_year,
          label: c.term_label || key,
        });
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => b.academic_year - a.academic_year || b.semester - a.semester
    );
  }, [classes]);

  const visibleClasses = activeTerm
    ? classes.filter((c) => `${c.semester}/${c.academic_year}` === activeTerm)
    : classes;

  return (
    <ProtectedLayout requiredRole="student">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">คลาสเรียนของฉัน</h1>
            <p className="text-muted text-sm mt-1">วิชาที่คุณลงทะเบียนเรียน</p>
          </div>
          <Link to="/student/enroll">
            <Button variant="secondary" icon={PlusCircle}>ลงทะเบียนเรียน</Button>
          </Link>
        </div>

        {terms.length > 0 && (
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
            {terms.map((t) => (
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
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <Spinner fullscreen />
        ) : classes.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen size={32} className="text-muted mb-3" />
              <p className="text-muted text-sm mb-4">ยังไม่ได้ลงทะเบียนวิชาใด</p>
              <Link to="/student/enroll">
                <Button variant="primary" icon={PlusCircle}>ลงทะเบียนเรียน</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleClasses.map((c) => {
              const total = c.total_sessions ?? 0;
              const present = c.present_count ?? 0;
              const pct = total > 0 ? Math.round((present / total) * 100) : 0;
              return (
                <Link
                  key={c.enrollment_id}
                  to={`/student/classes/${c.class_id}/history`}
                  className="block"
                >
                <Card title={c.course_name} subtitle={c.course_code} hoverable>
                  <div className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-ink-dim">
                        <User size={15} className="text-muted shrink-0" /> {c.teacher_name || '—'}
                      </p>
                      {c.schedule && (
                        <p className="flex items-center gap-2 text-ink-dim">
                          <Calendar size={15} className="text-muted shrink-0" /> {c.schedule}
                        </p>
                      )}
                      {c.room_number && (
                        <p className="flex items-center gap-2 text-ink-dim">
                          <MapPin size={15} className="text-muted shrink-0" /> {c.room_number}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">เข้าเรียน {present}/{total} ครั้ง</span>
                        <span className="text-ink-dim font-medium">{pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-elevated overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-gradient transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default StudentMyClasses;
