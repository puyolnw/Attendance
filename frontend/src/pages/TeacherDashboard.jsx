import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Users, Activity, ClipboardCheck, AlertCircle, Radio, Play, Square, ArrowRight, CheckCircle2, CalendarRange } from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ClassList from '../components/teacher/ClassList';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { classApi, sessionApi } from '../services/endpoints';
import { formatDate, formatTime } from '../utils/helpers';

const chipCls = (active) =>
  `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'bg-accent-dim text-accent border-accent'
      : 'bg-elevated text-ink-dim border-border hover:border-border-strong'
  }`;

const termsEqual = (a, b) =>
  !!a && !!b && a.semester === b.semester && a.academic_year === b.academic_year;

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [flash, setFlash] = useState(location.state?.flash || '');
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeMap, setActiveMap] = useState({}); // classId -> active session (or null)
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState(null); // the term being viewed
  const [currentTerm, setCurrentTerm] = useState(null); // the active (current) term
  const [termsReady, setTermsReady] = useState(false);
  const [busyClassId, setBusyClassId] = useState(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    activeSessions: 0,
    totalAttendanceRecords: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async (term = selectedTerm) => {
    setIsLoading(true);
    setError('');
    try {
      const termParams = term
        ? { semester: term.semester, academic_year: term.academic_year }
        : {};
      const [data, sessionData] = await Promise.all([
        classApi.listMine(termParams),
        sessionApi.listMine(termParams).catch(() => []),
      ]);
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map((c) => ({
        id: c.id,
        name: c.course_name || c.name,
        code: c.course_code || c.code,
        room: c.room_number || '—',
        schedule: c.schedule || '',
        enrollmentCount: c.enrollment_count ?? c.enrollmentCount ?? 0,
      }));
      setClasses(normalized);

      // Load active session per class → build classId -> activeSession map
      const activeResults = await Promise.all(
        normalized.map((c) =>
          classApi
            .getActiveSession(c.id)
            .then((s) => [c.id, s || null])
            .catch(() => [c.id, null])
        )
      );
      setActiveMap(Object.fromEntries(activeResults));

      const sList = Array.isArray(sessionData) ? sessionData : [];
      setSessions(sList);

      const activeCount = sList.filter((s) => s.status === 'active').length;
      const attendanceTotal = sList.reduce((sum, s) => sum + (s.attendance_count || 0), 0);
      setStats({
        totalClasses: normalized.length,
        totalStudents: normalized.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
        activeSessions: activeCount,
        totalAttendanceRecords: attendanceTotal,
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้');
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // On mount: resolve terms + default selection, then let the term effect fetch.
  useEffect(() => {
    (async () => {
      const [termList, current] = await Promise.all([
        classApi.myTerms().catch(() => []),
        classApi.currentTerm().catch(() => null),
      ]);
      const list = Array.isArray(termList) ? termList : [];
      setTerms(list);
      setCurrentTerm(current || null);
      // Default = current term if it has data, else newest term with data, else current.
      const currentInList = current && list.find((t) => termsEqual(t, current));
      const def = currentInList || list[0] || current || null;
      setSelectedTerm(def);
      setTermsReady(true);
    })();
  }, []);

  // Refetch whenever the selected term changes (after terms resolved).
  useEffect(() => {
    if (!termsReady) return;
    fetchData(selectedTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termsReady, selectedTerm?.semester, selectedTerm?.academic_year]);

  // Clear the one-shot flash from history so a refresh doesn't re-show it
  useEffect(() => {
    if (location.state?.flash) {
      window.history.replaceState({}, '');
      const t = setTimeout(() => setFlash(''), 6000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [location.state]);

  const handleDelete = async (id) => {
    try {
      await classApi.remove(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting class:', err);
      setError(err.response?.data?.error || 'ไม่สามารถลบคลาสเรียนได้');
    }
  };

  const goToSession = (classId) => navigate(`/teacher/classes/${classId}/session`);

  const handleStart = async (classId) => {
    setBusyClassId(classId);
    setError('');
    try {
      await sessionApi.quickStart(classId);
      goToSession(classId);
    } catch (err) {
      if (err.response?.status === 409) {
        // Class already has an active session — the session page auto-loads it
        goToSession(classId);
        return;
      }
      console.error('Error starting check-in:', err);
      setError(err.response?.data?.error || 'ไม่สามารถเริ่มการเช็คชื่อได้');
    } finally {
      setBusyClassId(null);
    }
  };

  const handleStop = async (classId, sessionId) => {
    if (!sessionId) return;
    setBusyClassId(classId);
    setError('');
    try {
      await sessionApi.setStatus(sessionId, 'closed');
      await fetchData();
    } catch (err) {
      console.error('Error stopping check-in:', err);
      setError(err.response?.data?.error || 'ไม่สามารถหยุดการเช็คชื่อได้');
    } finally {
      setBusyClassId(null);
    }
  };

  // Past term = a selected term that is not the current (active) term.
  // Falls back to false if currentTerm is unavailable (keep current behavior).
  const isPastTerm =
    !!selectedTerm && !!currentTerm && !termsEqual(selectedTerm, currentTerm);

  const statTiles = [
    { label: 'คลาสทั้งหมด', value: stats.totalClasses, icon: BookOpen },
    { label: 'นักเรียนทั้งหมด', value: stats.totalStudents, icon: Users },
    { label: 'คาบที่กำลังดำเนินอยู่', value: stats.activeSessions, icon: Activity },
    { label: 'บันทึกการเช็คชื่อ', value: stats.totalAttendanceRecords, icon: ClipboardCheck },
  ];

  return (
    <ProtectedLayout requiredRole="teacher">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">แดชบอร์ดอาจารย์</h1>
            <p className="text-muted text-sm mt-1">ยินดีต้อนรับกลับ! ภาพรวมการเช็คชื่อของคุณ</p>
          </div>
          {selectedTerm && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent-dim px-3.5 py-1.5 text-sm font-medium text-accent self-start">
              ภาคเรียน {selectedTerm.label}
            </span>
          )}
        </div>

        {/* Term selector */}
        {terms.length > 0 && (
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

        {flash && (
          <div className="flex items-center gap-2 bg-ok/10 border border-ok/30 text-ok text-sm rounded-xl px-4 py-3">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{flash}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Statistics Cards */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statTiles.map(({ label, value, icon: Icon }) => (
              <div key={label} className="stat-tile">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">{label}</p>
                    <p className="text-3xl font-bold text-ink mt-1">{value}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-accent-dim flex items-center justify-center">
                    <Icon size={20} className="text-accent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions — start/stop check-in per class */}
        <Card title="การดำเนินการด่วน" subtitle="เริ่ม/หยุดการเช็คชื่อของแต่ละคลาส">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : classes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <BookOpen size={28} className="text-muted mb-3" />
              <p className="text-muted text-sm">ยังไม่มีคลาสเรียน สร้างคลาสใหม่เพื่อเริ่มเช็คชื่อ</p>
            </div>
          ) : (
            <div className="space-y-2">
              {classes.map((c) => {
                const active = activeMap[c.id];
                const isActive = !!active;
                const busy = busyClassId === c.id;
                return (
                  <div
                    key={c.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-elevated border border-border"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent-dim flex items-center justify-center shrink-0">
                      <Radio size={16} className="text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink truncate">{c.name}</p>
                      <p className="text-xs text-muted truncate">{c.code}</p>
                    </div>
                    {isActive ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:shrink-0">
                        <Badge status="active" label="กำลังเช็คชื่อ" size="sm" pulse />
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={ArrowRight}
                            onClick={() => goToSession(c.id)}
                          >
                            ไปที่คาบ
                          </Button>
                          {!isPastTerm && (
                            <Button
                              variant="danger"
                              size="sm"
                              icon={Square}
                              loading={busy}
                              disabled={busy}
                              onClick={() => handleStop(c.id, active.id)}
                            >
                              หยุดเช็คชื่อ
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : isPastTerm ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-muted sm:shrink-0">
                        ภาคเรียนที่สิ้นสุดแล้ว (ดูได้อย่างเดียว)
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Play}
                        loading={busy}
                        disabled={busy}
                        onClick={() => handleStart(c.id)}
                        className="sm:shrink-0"
                      >
                        เริ่มเช็คชื่อ
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Recent Sessions */}
        <Card title="คาบเรียนล่าสุด">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity size={28} className="text-muted mb-3" />
              <p className="text-muted text-sm">ยังไม่มีคาบเรียนล่าสุด</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.slice(0, 5).map((s) => (
                <Link
                  key={s.id}
                  to={s.status === 'active'
                    ? `/teacher/classes/${s.class_id}/session`
                    : `/teacher/sessions/${s.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-elevated border border-border hover:border-border-strong transition-all"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent-dim flex items-center justify-center shrink-0">
                    <Radio size={16} className="text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink truncate">{s.class_name || s.class_code || 'คาบเรียน'}</p>
                    <p className="text-xs text-muted">
                      {formatDate(s.session_date)} · {formatTime(s.start_time)}
                      {' · '}เช็คชื่อ {s.attendance_count || 0} คน
                    </p>
                  </div>
                  <Badge
                    status={s.status === 'active' ? 'active' : s.status === 'closed' ? 'inactive' : 'pending'}
                    label={s.status === 'active' ? 'กำลังดำเนิน' : s.status === 'closed' ? 'ปิดแล้ว' : 'รอเริ่ม'}
                    size="sm"
                  />
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* My Classes */}
        <ClassList classes={classes} isLoading={isLoading} onDelete={handleDelete} />
      </div>
    </ProtectedLayout>
  );
};

export default TeacherDashboard;
