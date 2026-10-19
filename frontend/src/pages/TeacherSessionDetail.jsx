import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, MapPin, CalendarDays, Clock, LayoutDashboard } from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { sessionApi, statusLabel, statusBadge } from '../services/endpoints';
import { formatDate, formatTime } from '../utils/helpers';

const methodLabel = (m) => {
  if (m === 'qr') return 'QR';
  if (m === 'pin') return 'PIN';
  if (m === 'manual') return 'เช็คด้วยตนเอง';
  return '—';
};

const STAT_TILES = [
  { key: 'present', label: 'มาเรียน', color: 'text-ok' },
  { key: 'late', label: 'มาสาย', color: 'text-warn' },
  { key: 'absent', label: 'ขาดเรียน', color: 'text-bad' },
  { key: 'leave', label: 'ลา', color: 'text-muted' },
  { key: 'sick', label: 'ป่วย', color: 'text-muted' },
];

const TeacherSessionDetail = () => {
  const { sessionId } = useParams();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await sessionApi.summary(sessionId);
        setSummary(data);
      } catch (err) {
        console.error('Error loading session summary:', err);
        setError(err.response?.data?.error || 'ไม่สามารถโหลดข้อมูลคาบเรียนได้');
        setSummary(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [sessionId]);

  if (isLoading) {
    return (
      <ProtectedLayout requiredRole="teacher">
        <Spinner fullscreen />
      </ProtectedLayout>
    );
  }

  if (!summary) {
    return (
      <ProtectedLayout requiredRole="teacher">
        <div className="space-y-4 animate-fade-in">
          <Link to="/teacher">
            <Button variant="secondary" icon={ArrowLeft}>ย้อนกลับ</Button>
          </Link>
          <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error || 'ไม่พบคาบเรียน'}</span>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const counts = summary.counts || {};
  const isActive = summary.status === 'active';

  const infoItems = [
    {
      label: 'วันที่',
      value: `${formatDate(summary.session_date)} · ${formatTime(summary.start_time)}–${formatTime(summary.end_time)}`,
      icon: CalendarDays,
    },
    { label: 'ห้องเรียน', value: summary.room_number || '—', icon: MapPin },
    { label: 'จำนวนนักเรียน', value: `${summary.total_students ?? 0} คน`, icon: Clock },
  ];

  const columns = [
    { key: 'student_id_number', label: 'รหัสนักเรียน', render: (v) => v || '—' },
    { key: 'full_name', label: 'ชื่อ', render: (v) => v || '—' },
    {
      key: 'status',
      label: 'สถานะ',
      render: (v) => <Badge status={statusBadge(v)} label={statusLabel(v)} size="sm" />,
    },
    {
      key: 'check_in_time',
      label: 'เวลาเช็คชื่อ',
      render: (v) => (v ? formatTime(v) : '—'),
    },
    { key: 'method', label: 'วิธี', render: (v) => methodLabel(v) },
  ];

  const students = Array.isArray(summary.students) ? summary.students : [];

  return (
    <ProtectedLayout requiredRole="teacher">
      <div className="space-y-6 animate-fade-in">
        {/* Back navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/teacher/classes/${summary.class_id}/reports`}>
            <Button variant="secondary" icon={ArrowLeft}>กลับไปรายงาน</Button>
          </Link>
          <Link to="/teacher">
            <Button variant="ghost" icon={LayoutDashboard}>แดชบอร์ด</Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                {summary.course_name || 'คาบเช็คชื่อ'}
              </h1>
              <Badge
                status={isActive ? 'active' : 'inactive'}
                label={isActive ? 'กำลังดำเนิน' : 'ปิดแล้ว'}
                size="sm"
                pulse={isActive}
              />
            </div>
            <p className="text-muted text-sm mt-1 font-mono">{summary.course_code}</p>
          </div>
        </div>

        {/* Session info */}
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAT_TILES.map(({ key, label, color }) => (
            <div
              key={key}
              className="surface-card p-4 flex flex-col items-center justify-center text-center"
            >
              <p className={`text-3xl font-bold ${color}`}>{counts[key] ?? 0}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Students table */}
        <Card title="รายชื่อนักเรียน" subtitle={`นักเรียนทั้งหมด ${summary.total_students ?? 0} คน`}>
          <Table
            columns={columns}
            data={students}
            rowKey="student_id"
            pageSize={20}
            emptyMessage="ไม่มีนักเรียนในคาบเรียนนี้"
          />
        </Card>
      </div>
    </ProtectedLayout>
  );
};

export default TeacherSessionDetail;
