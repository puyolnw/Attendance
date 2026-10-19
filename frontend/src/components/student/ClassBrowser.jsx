import React, { useEffect, useMemo, useState } from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Search, User, Calendar, MapPin, Users, BookOpen, CheckCircle2, AlertCircle, CalendarRange } from 'lucide-react';

const chipCls = (active) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'bg-accent-dim text-accent border-accent'
      : 'bg-elevated text-ink-dim border-border hover:border-border-strong'
  }`;

const ClassBrowser = ({ classes = [], isLoading = false, enrolledClassIds = [], onEnroll, defaultTerm = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTerm, setActiveTerm] = useState(null); // null = all, else "s/y" key
  // Per-card enroll state: { [classId]: { loading, result } }
  const [enrollState, setEnrollState] = useState({});

  // Unique terms derived from loaded classes, newest first
  const terms = useMemo(() => {
    const map = new Map();
    classes.forEach((c) => {
      if (c.semester && c.academicYear) {
        const key = `${c.semester}/${c.academicYear}`;
        if (!map.has(key)) {
          map.set(key, { key, label: c.termLabel || key, semester: c.semester, academicYear: c.academicYear });
        }
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => b.academicYear - a.academicYear || b.semester - a.semester
    );
  }, [classes]);

  // When a defaultTerm is provided and matches an available term chip,
  // initialize the active filter to it (once, until the term list changes).
  // If it isn't among the derived terms, fall back to "all" (null).
  useEffect(() => {
    if (!defaultTerm || defaultTerm.semester == null || defaultTerm.academic_year == null) {
      setActiveTerm(null);
      return;
    }
    const key = `${defaultTerm.semester}/${defaultTerm.academic_year}`;
    setActiveTerm(terms.some((t) => t.key === key) ? key : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terms, defaultTerm?.semester, defaultTerm?.academic_year]);

  const handleEnrollClick = async (classId) => {
    if (!onEnroll) return;
    setEnrollState((prev) => ({ ...prev, [classId]: { loading: true, result: null } }));
    const result = await onEnroll(classId);
    setEnrollState((prev) => ({ ...prev, [classId]: { loading: false, result } }));
  };

  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTerm = !activeTerm || `${cls.semester}/${cls.academicYear}` === activeTerm;

    return matchesSearch && matchesTerm;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <div className="space-y-4">
          <Input
            label="ค้นหาคลาสเรียน"
            placeholder="ค้นหาด้วยชื่อ รหัสวิชา หรือรายละเอียด..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
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
        </div>
      </Card>

      {/* Classes Grid */}
      {isLoading ? (
        <Card className="text-center py-12">
          <p className="text-muted text-sm">กำลังโหลดคลาสเรียน...</p>
        </Card>
      ) : filteredClasses.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen size={32} className="text-muted mb-3" />
            <p className="text-muted text-sm">ไม่พบคลาสเรียน</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const isEnrolled = enrolledClassIds.includes(String(cls.id));
            const cardState = enrollState[cls.id] || {};
            const justEnrolled = cardState.result?.success;
            return (
              <Card
                key={cls.id}
                title={cls.name}
                subtitle={cls.code}
                hoverable
              >
                <div className="space-y-4">
                  <p className="text-sm text-ink-dim">{cls.description}</p>

                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-ink-dim">
                      <User size={15} className="text-muted shrink-0" /> {cls.teacherName}
                    </p>
                    {cls.schedule && (
                      <p className="flex items-center gap-2 text-ink-dim">
                        <Calendar size={15} className="text-muted shrink-0" /> {cls.schedule}
                      </p>
                    )}
                    {cls.room && cls.room !== '—' && (
                      <p className="flex items-center gap-2 text-ink-dim">
                        <MapPin size={15} className="text-muted shrink-0" /> {cls.room}
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-ink-dim">
                      <Users size={15} className="text-muted shrink-0" /> ลงทะเบียนแล้ว {cls.enrollmentCount || 0} คน
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    {isEnrolled || justEnrolled ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-ok" />
                        <Badge status="active" label="ลงทะเบียนแล้ว" />
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          fullWidth
                          loading={cardState.loading}
                          onClick={() => handleEnrollClick(cls.id)}
                        >
                          ลงทะเบียนเลย
                        </Button>
                        {cardState.result && !cardState.result.success && (
                          <p className="flex items-center gap-1.5 text-bad text-xs">
                            <AlertCircle size={13} /> {cardState.result.message}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassBrowser;
