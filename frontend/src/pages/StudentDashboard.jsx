import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { enrollmentApi, classApi } from '../services/endpoints';
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
  Calendar,
  QrCode,
  PlusCircle,
  History,
  MapPin,
  User,
  AlertCircle,
} from 'lucide-react';

// Color the attendance percent by rate: >=80 ok, 50-79 warn, <50 bad.
const rateColor = (rate) => {
  if (rate >= 80) return 'text-ok';
  if (rate >= 50) return 'text-warn';
  return 'text-bad';
};

const StudentDashboard = () => {
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [currentTerm, setCurrentTerm] = useState(null); // { semester, academic_year, label }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [rows, term] = await Promise.all([
          enrollmentApi.myClasses(),
          classApi.currentTerm().catch(() => null),
        ]);
        const list = Array.isArray(rows) ? rows : rows?.data ?? [];

        const mapped = list.map((row) => {
          const cls = row.class || row.Class || row;
          const presentCount = row.present_count ?? row.presentCount ?? 0;
          const totalSessions = row.total_sessions ?? row.totalSessions ?? 0;
          const semester = row.semester ?? cls.semester ?? null;
          const academicYear = row.academic_year ?? cls.academic_year ?? null;
          return {
            id: cls.id ?? row.class_id,
            enrollmentId: row.enrollment_id ?? row.id,
            name: cls.course_name || cls.name || 'ไม่มีชื่อวิชา',
            code: cls.course_code || cls.code || '—',
            teacherName:
              row.teacher_name || cls.teacher_name || cls.teacherName || '—',
            room: cls.room_number || cls.room || row.room_number || '—',
            schedule: row.schedule || cls.schedule || '',
            semester,
            academicYear,
            termKey:
              semester != null && academicYear != null
                ? `${semester}/${academicYear}`
                : null,
            presentCount,
            totalSessions,
          };
        });

        setEnrolledClasses(mapped);
        setCurrentTerm(term || null);
      } catch (err) {
        console.error('Failed to load dashboard', err);
        setError(
          err?.response?.data?.error || 'ไม่สามารถโหลดคลาสเรียนของคุณได้'
        );
        setEnrolledClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Scope to the current term if any enrolled class matches; otherwise fall
  // back to ALL enrolled classes so a student with only other-term classes
  // still sees something.
  const scopedClasses = useMemo(() => {
    if (!currentTerm) return enrolledClasses;
    const key = `${currentTerm.semester}/${currentTerm.academic_year}`;
    const inTerm = enrolledClasses.filter((c) => c.termKey === key);
    return inTerm.length > 0 ? inTerm : enrolledClasses;
  }, [enrolledClasses, currentTerm]);

  const stats = useMemo(() => {
    const totalClasses = scopedClasses.length;
    const totalAttendance = scopedClasses.reduce(
      (sum, c) => sum + (c.presentCount || 0),
      0
    );
    const totalSessionsSum = scopedClasses.reduce(
      (sum, c) => sum + (c.totalSessions || 0),
      0
    );
    const attendanceRate =
      totalSessionsSum > 0
        ? Math.round((totalAttendance / totalSessionsSum) * 100)
        : 0;
    return { totalClasses, totalAttendance, attendanceRate };
  }, [scopedClasses]);

  const statTiles = [
    { label: 'คลาสที่ลงทะเบียน', value: stats.totalClasses, icon: BookOpen },
    { label: 'เข้าเรียนแล้ว', value: stats.totalAttendance, icon: CheckCircle },
    { label: 'อัตราการเข้าเรียน', value: `${stats.attendanceRate}%`, icon: TrendingUp },
  ];

  return (
    <ProtectedLayout requiredRole="student">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">แดชบอร์ดนักเรียน</h1>
            {currentTerm?.label && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-elevated px-3 py-1 text-xs font-medium text-ink-dim">
                <Calendar size={13} className="text-muted" />
                ภาคเรียน {currentTerm.label}
              </span>
            )}
          </div>
          <p className="text-muted text-sm mt-1">ติดตามการเช็คชื่อของคุณในทุกคลาสที่ลงทะเบียน</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Statistics Cards */}
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        {/* Quick Actions */}
        <Card title="ทางลัด">
          <div className="flex flex-wrap gap-3">
            <Link to="/student/checkin">
              <Button variant="primary" icon={QrCode}>เช็คชื่อเลย</Button>
            </Link>
            <Link to="/student/enroll">
              <Button variant="secondary" icon={PlusCircle}>ลงทะเบียนเรียน</Button>
            </Link>
            <Link to="/student/history">
              <Button variant="secondary" icon={History}>ดูประวัติ</Button>
            </Link>
          </div>
        </Card>

        {/* Enrolled Classes */}
        <Card title="คลาสของฉัน">
          {isLoading ? (
            <Spinner />
          ) : scopedClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen size={32} className="text-muted mb-3" />
              <p className="text-muted text-sm">ยังไม่มีคลาสเรียน</p>
              <Link to="/student/enroll" className="mt-3">
                <Button variant="primary" icon={PlusCircle}>ลงทะเบียนเรียน</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scopedClasses.map((cls) => {
                const percent =
                  cls.totalSessions > 0
                    ? Math.round((cls.presentCount / cls.totalSessions) * 100)
                    : 0;
                return (
                  <Link
                    key={cls.id}
                    to={`/student/classes/${cls.id}/history`}
                    className="block bg-elevated rounded-xl p-4 border border-border hover:border-border-strong transition-colors"
                  >
                    <h3 className="font-semibold text-ink">{cls.name}</h3>
                    <p className="text-xs text-muted mt-1 font-mono">{cls.code}</p>

                    <div className="mt-3 space-y-2 text-sm text-ink-dim">
                      <p className="flex items-center gap-2">
                        <User size={15} className="text-muted" /> {cls.teacherName}
                      </p>
                      {cls.schedule && (
                        <p className="flex items-center gap-2">
                          <Calendar size={15} className="text-muted shrink-0" /> {cls.schedule}
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <MapPin size={15} className="text-muted" /> {cls.room}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-ink-dim">
                        เข้าเรียน {cls.presentCount}/{cls.totalSessions} ครั้ง
                      </span>
                      <span className={`text-sm font-bold ${rateColor(percent)}`}>
                        {percent}%
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </ProtectedLayout>
  );
};

export default StudentDashboard;
