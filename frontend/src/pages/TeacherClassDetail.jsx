import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Pencil,
  Play,
  FileText,
  AlignLeft,
  MapPin,
  BookMarked,
  CalendarDays,
  Users,
} from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { AlertCircle, CalendarClock as SessionsIcon } from 'lucide-react';
import { classApi } from '../services/endpoints';
import { formatDate, formatTime } from '../utils/helpers';

const TeacherClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [cls, students, sessionList] = await Promise.all([
          classApi.get(classId),
          classApi.getStudents(classId).catch(() => []),
          classApi.getSessions(classId).catch(() => []),
        ]);
        setSessions(Array.isArray(sessionList) ? sessionList : []);
        setClassData({
          id: cls.id,
          name: cls.course_name || cls.name,
          code: cls.course_code || cls.code,
          description: cls.description,
          room: cls.room_number,
          semester: cls.semester,
          academicYear: cls.academic_year,
          enrollmentCount: Array.isArray(students) ? students.length : 0,
        });
        const list = Array.isArray(students) ? students : (students?.data ?? []);
        setEnrollments(
          list.map((s, i) => ({
            id: s.enrollment_id || s.id || i,
            studentId: s.student_id_number || s.student_id || s.studentId || '—',
            studentName: s.full_name || s.student_name || s.studentName || '—',
            enrolledDate: s.enrolled_date || s.created_at || null,
          }))
        );
      } catch (err) {
        console.error('Error loading class:', err);
        setError(err.response?.data?.error || 'ไม่สามารถโหลดคลาสเรียนได้');
        setClassData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  if (isLoading) {
    return (
      <ProtectedLayout requiredRole="teacher">
        <Spinner fullscreen />
      </ProtectedLayout>
    );
  }

  if (!classData) {
    return (
      <ProtectedLayout requiredRole="teacher">
        <Card>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BookMarked size={28} className="text-muted mb-3" />
            <p className="text-muted text-sm">{error || 'ไม่พบคลาสเรียน'}</p>
          </div>
        </Card>
      </ProtectedLayout>
    );
  }

  const enrollmentColumns = [
    { key: 'studentId', label: 'รหัสนักเรียน' },
    { key: 'studentName', label: 'ชื่อ' },
    {
      key: 'enrolledDate',
      label: 'วันที่ลงทะเบียน',
      render: (value) => formatDate(value),
    },
  ];

  const infoItems = [
    { label: 'รายละเอียด', value: classData.description || '—', icon: AlignLeft },
    { label: 'ห้องเรียน', value: classData.room || '—', icon: MapPin },
    { label: 'ภาคเรียน', value: classData.semester || '—', icon: BookMarked },
    { label: 'ปีการศึกษา', value: classData.academicYear || '—', icon: CalendarDays },
    { label: 'ลงทะเบียนแล้ว', value: `${classData.enrollmentCount}`, icon: Users },
  ];

  return (
    <ProtectedLayout requiredRole="teacher">
      <div className="space-y-6 animate-fade-in">
        {error && (
          <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">{classData.name}</h1>
            <p className="text-muted text-sm mt-1 font-mono">{classData.code}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/teacher/classes/${classId}/edit`}>
              <Button variant="secondary" icon={Pencil}>แก้ไขคลาส</Button>
            </Link>
            <Link to={`/teacher/classes/${classId}/session`}>
              <Button variant="primary" icon={Play}>เริ่มคาบเรียน</Button>
            </Link>
          </div>
        </div>

        {/* Class Information */}
        <Card title="ข้อมูลคลาสเรียน">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {infoItems.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-3 bg-elevated border border-border rounded-xl"
              >
                <div className="w-9 h-9 rounded-lg bg-accent-dim flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted uppercase tracking-wide">{label}</p>
                  <p className="font-medium text-ink mt-0.5 break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Enrollments */}
        <Card title="นักเรียนที่ลงทะเบียน">
          <Table columns={enrollmentColumns} data={enrollments} emptyMessage="ยังไม่มีนักเรียนลงทะเบียน" />
        </Card>

        {/* Sessions */}
        <Card title="คาบเรียนทั้งหมด">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <SessionsIcon size={28} className="text-muted mb-3" />
              <p className="text-muted text-sm">ยังไม่มีคาบเรียน</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  to={`/teacher/sessions/${s.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-elevated border border-border hover:border-border-strong transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent-dim flex items-center justify-center shrink-0">
                    <SessionsIcon size={16} className="text-accent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">
                      {formatDate(s.session_date)}
                    </p>
                    <p className="text-xs text-muted">
                      {formatTime(s.start_time)}–{formatTime(s.end_time)} · เช็คชื่อ {s.attendance_count || 0} คน
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

        {/* Reports */}
        <Card>
          <Link to={`/teacher/classes/${classId}/reports`}>
            <Button variant="primary" icon={FileText} fullWidth>
              ดูรายงานทั้งหมด
            </Button>
          </Link>
        </Card>
      </div>
    </ProtectedLayout>
  );
};

export default TeacherClassDetail;
