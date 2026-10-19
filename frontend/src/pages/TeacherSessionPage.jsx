import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, Radio, Square, AlertCircle, Info, Maximize2, Minimize2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import SessionCreator from '../components/teacher/SessionCreator';
import LiveMonitor from '../components/teacher/LiveMonitor';
import QRDisplay from '../components/teacher/QRDisplay';
import Button from '../components/common/Button';
import { classApi, sessionApi } from '../services/endpoints';
import { formatDate } from '../utils/helpers';

const TeacherSessionPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('qr'); // 'qr', 'monitor'
  const [notice, setNotice] = useState('');
  const [isPastTerm, setIsPastTerm] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const pollRef = useRef(null);

  const enterFullscreen = useCallback(() => {
    setFullscreen(true);
    try {
      document.documentElement.requestFullscreen?.();
    } catch (err) {
      /* Fullscreen API blocked — CSS overlay still works. */
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
    try {
      if (document.fullscreenElement) document.exitFullscreen?.();
    } catch (err) {
      /* Ignore — overlay is already dismissed. */
    }
  }, []);

  // Escape exits the present-mode overlay.
  useEffect(() => {
    if (!fullscreen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') exitFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, exitFullscreen]);

  const pollAttendance = useCallback(async (sessionId) => {
    try {
      const res = await sessionApi.getAttendance(sessionId);
      setAttendance(res?.data ?? []);
    } catch (err) {
      console.error('Error polling attendance:', err);
    }
  }, []);

  const startPolling = useCallback(
    (sessionId) => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollAttendance(sessionId);
      pollRef.current = setInterval(() => pollAttendance(sessionId), 3000);
    },
    [pollAttendance]
  );

  // Restore an active session (QR + monitor) so a page refresh keeps it live.
  const restoreSession = useCallback(
    async (session) => {
      if (!session?.id) return;
      setSessionData(session);
      setSessionActive(true);
      let qr = session.qr_code || null;
      if (!qr) {
        try {
          const res = await sessionApi.getQR(session.id);
          qr = res?.qr_code || null;
        } catch (qrErr) {
          console.error('Error loading QR:', qrErr);
        }
      }
      setQrCode(qr);
      startPolling(session.id);
    },
    [startPolling]
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [cls, studentList, activeSession, currentTerm] = await Promise.all([
          classApi.listMine().catch(() => []),
          classId ? classApi.getStudents(classId).catch(() => []) : Promise.resolve([]),
          classId ? classApi.getActiveSession(classId).catch(() => null) : Promise.resolve(null),
          classApi.currentTerm().catch(() => null),
        ]);
        const rawClasses = Array.isArray(cls) ? cls : [];
        setClasses(
          rawClasses.map((c) => ({
            id: c.id,
            name: c.course_name || c.name,
            code: c.course_code || c.code,
          }))
        );

        // Determine whether this class belongs to a past (non-current) term.
        // Fall back to false if term info is missing (keep current behavior).
        const thisClass = rawClasses.find((c) => String(c.id) === String(classId));
        if (thisClass && currentTerm) {
          const past =
            (thisClass.semester != null && thisClass.academic_year != null) &&
            !(
              Number(thisClass.semester) === Number(currentTerm.semester) &&
              Number(thisClass.academic_year) === Number(currentTerm.academic_year)
            );
          setIsPastTerm(past);
        }
        const sl = Array.isArray(studentList) ? studentList : (studentList?.data ?? []);
        setStudents(
          sl.map((s) => ({
            id: s.id || s.student_id,
            studentId: s.student_id_number || s.student_id || '—',
            studentName: s.full_name || s.student_name || '—',
          }))
        );
        if (activeSession && activeSession.id) {
          await restoreSession(activeSession);
        }
      } catch (err) {
        console.error('Error loading session context:', err);
      }
    };
    load();
  }, [classId, restoreSession]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const handleCreateSession = async (formData) => {
    setIsLoading(true);
    setError('');
    setNotice('');
    try {
      const session = await sessionApi.create({ class_id: classId, ...formData });
      // Backend returns qr_code + full fields in the create response.
      await restoreSession(session);
    } catch (err) {
      console.error('Error creating session:', err);
      // 409: this class already has an active session — auto-load and monitor it.
      if (err.response?.status === 409 && classId) {
        try {
          const existing = await classApi.getActiveSession(classId);
          if (existing && existing.id) {
            await restoreSession(existing);
            setNotice('คลาสเรียนนี้มีคาบที่กำลังดำเนินอยู่แล้ว กำลังแสดงคาบเดิม');
            return;
          }
        } catch (loadErr) {
          console.error('Error loading existing active session:', loadErr);
        }
      }
      setError(err.response?.data?.error || 'ไม่สามารถสร้างคาบเรียนได้');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      await sessionApi.manualMark(sessionData.id, studentId, status);
      pollAttendance(sessionData.id);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError(err.response?.data?.error || 'ไม่สามารถเช็คชื่อได้');
    }
  };

  const handleEndSession = async () => {
    setError('');
    try {
      if (sessionData?.id) {
        const closedSessionId = sessionData.id;
        await sessionApi.setStatus(closedSessionId, 'closed');
        if (fullscreen) exitFullscreen();
        if (pollRef.current) clearInterval(pollRef.current);
        setSessionActive(false);
        setSessionData(null);
        setQrCode(null);
        setAttendance([]);
        // Go straight to the session detail/summary page for the just-closed session
        navigate(`/teacher/sessions/${closedSessionId}`);
      }
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err.response?.data?.error || 'ไม่สามารถปิดคาบเรียนได้');
      if (pollRef.current) clearInterval(pollRef.current);
      setSessionActive(false);
      setSessionData(null);
      setQrCode(null);
      setAttendance([]);
      setActiveTab('qr');
    }
  };

  if (!sessionActive) {
    return (
      <ProtectedLayout requiredRole="teacher">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">คาบเช็คชื่อ</h1>
            <p className="text-muted text-sm mt-1">สร้างคาบเรียนใหม่เพื่อเริ่มเช็คชื่อ</p>
          </div>
          {notice && (
            <div className="flex items-center gap-2 bg-info/10 border border-info/30 text-info text-sm rounded-xl px-4 py-3">
              <Info size={16} className="shrink-0" />
              <span>{notice}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {isPastTerm ? (
            <div className="rounded-2xl border border-border bg-elevated p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-dim">
                <Lock size={22} className="text-accent" />
              </div>
              <div className="space-y-1">
                <p className="text-ink font-medium">ภาคเรียนนี้สิ้นสุดแล้ว</p>
                <p className="text-muted text-sm">
                  ไม่สามารถเปิดคาบเช็คชื่อได้ — ดูรายงานย้อนหลังได้ที่หน้ารายงาน
                </p>
              </div>
              <Link
                to={`/teacher/reports/${classId}`}
                className="inline-flex items-center gap-2 rounded-xl border border-accent bg-accent-dim px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white"
              >
                ดูรายงานของคลาสนี้
              </Link>
            </div>
          ) : (
            <SessionCreator
              classId={classId}
              classes={classes}
              onSubmit={handleCreateSession}
              isLoading={isLoading}
            />
          )}
        </div>
      </ProtectedLayout>
    );
  }

  const tabs = [
    { id: 'qr', label: 'QR Code และ PIN', icon: QrCode },
    { id: 'monitor', label: 'ติดตามสด', icon: Radio },
  ];

  return (
    <ProtectedLayout requiredRole="teacher">
      <div className="space-y-6 animate-fade-in">
        {notice && (
          <div className="flex items-center gap-2 bg-info/10 border border-info/30 text-info text-sm rounded-xl px-4 py-3">
            <Info size={16} className="shrink-0" />
            <span>{notice}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-ok opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-ok" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">คาบเรียนที่กำลังดำเนินอยู่</h1>
              <p className="text-muted text-sm mt-1">
                คาบเช็คชื่อ
                {sessionData?.session_date ? ` - ${formatDate(sessionData.session_date)}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Maximize2} onClick={enterFullscreen}>
              แสดงเต็มจอ
            </Button>
            <Button variant="danger" icon={Square} onClick={handleEndSession}>
              จบคาบเรียน
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === id
                  ? 'text-accent border-accent'
                  : 'text-muted border-transparent hover:text-ink'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeTab === 'qr' ? (
            <div className="lg:col-span-1">
              <QRDisplay
                qrCode={qrCode}
                pin={sessionData?.pin_code}
                isLoading={isLoading}
              />
            </div>
          ) : null}

          <div className={activeTab === 'monitor' ? 'lg:col-span-3' : 'lg:col-span-2'}>
            <LiveMonitor
              students={students}
              attendance={attendance}
              onMarkAttendance={handleMarkAttendance}
            />
          </div>
        </div>
      </div>

      {/* Present mode — full-viewport overlay for projector/classroom screen */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col items-center justify-center min-h-screen overflow-auto p-6">
          <button
            onClick={exitFullscreen}
            className="absolute top-5 right-5 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted hover:text-ink bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Minimize2 size={18} />
            ออกจากเต็มจอ
          </button>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-5xl font-bold text-ink tracking-tight">
              {classes.find((c) => String(c.id) === String(classId))?.name || 'คาบเช็คชื่อ'}
            </h2>
            {sessionData?.session_date && (
              <p className="text-muted text-lg sm:text-2xl mt-2">
                {formatDate(sessionData.session_date)}
              </p>
            )}
          </div>

          {/* QR + PIN */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
            {qrCode ? (
              <div className="bg-white p-6 rounded-2xl shadow-2xl">
                <img
                  src={qrCode}
                  alt="QR Code เช็คชื่อ"
                  className="w-full max-w-md aspect-square object-contain"
                  style={{ width: 'min(80vw, 400px)', height: 'min(80vw, 400px)' }}
                />
              </div>
            ) : (
              <div
                className="bg-white/5 rounded-2xl flex items-center justify-center text-muted"
                style={{ width: 'min(80vw, 400px)', height: 'min(80vw, 400px)' }}
              >
                ไม่มี QR Code
              </div>
            )}

            <div className="text-center">
              <p className="text-muted text-xl sm:text-2xl tracking-widest uppercase mb-3">PIN</p>
              <p className="font-mono text-ink text-6xl sm:text-8xl font-bold tracking-wider">
                {sessionData?.pin_code || '——————'}
              </p>
            </div>
          </div>

          {/* Live count */}
          <p className="text-muted text-lg sm:text-2xl mt-10">
            เช็คชื่อแล้ว <span className="text-ink font-bold">{attendance.length}</span> คน
          </p>
        </div>
      )}
    </ProtectedLayout>
  );
};

export default TeacherSessionPage;
