import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { attendanceApi, statusLabel, statusBadge } from '../services/endpoints';
import { formatDate, formatTime } from '../utils/helpers';

const methodLabel = (m) => {
  if (m === 'qr') return 'QR';
  if (m === 'pin') return 'PIN';
  if (m === 'manual') return 'เช็คด้วยตนเอง';
  return '—';
};

const Tile = ({ label, value, color = 'text-ink' }) => (
  <div className="rounded-xl border border-border bg-elevated/40 px-4 py-3">
    <p className="text-xs text-muted">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

const StudentClassHistory = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await attendanceApi.myClassHistory(classId);
        if (active) setData(res);
      } catch (err) {
        console.error('Failed to load class history', err);
        if (active) setError(err?.response?.data?.error || 'ไม่สามารถโหลดประวัติการเข้าเรียนได้');
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [classId]);

  const counts = data?.counts || {};

  const columns = [
    { key: 'session_date', label: 'วันที่', render: (v) => formatDate(v) },
    {
      key: 'start_time',
      label: 'เวลา',
      render: (_, row) => `${formatTime(row.start_time)}–${formatTime(row.end_time)}`,
    },
    {
      key: 'status',
      label: 'สถานะ',
      render: (v) =>
        v ? (
          <Badge status={statusBadge(v)} label={statusLabel(v)} size="sm" />
        ) : (
          <span className="inline-flex items-center rounded-full border border-border bg-elevated px-2.5 py-1 text-xs text-muted">
            ยังไม่เช็คชื่อ
          </span>
        ),
    },
    {
      key: 'check_in_time',
      label: 'เวลาเช็คชื่อ',
      render: (v) => (v ? formatTime(v) : '—'),
    },
    { key: 'method', label: 'วิธี', render: (v) => methodLabel(v) },
  ];

  return (
    <ProtectedLayout requiredRole="student">
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/student/classes')}>
            กลับ
          </Button>
        </div>

        {isLoading ? (
          <Spinner fullscreen />
        ) : error ? (
          <div className="flex items-center gap-2 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : data ? (
          <>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                {data.course_name}
              </h1>
              <p className="text-muted text-sm mt-1">
                {data.course_code}
                {data.term_label ? ` · ${data.term_label}` : ''}
                {data.room_number ? ` · ${data.room_number}` : ''}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Tile label="มาเรียน" value={counts.present ?? 0} color="text-ok" />
              <Tile label="มาสาย" value={counts.late ?? 0} color="text-warn" />
              <Tile label="ขาดเรียน" value={counts.absent ?? 0} color="text-bad" />
              <Tile label="ลา" value={counts.leave ?? 0} />
              <Tile label="ป่วย" value={counts.sick ?? 0} />
              <Tile
                label="อัตราการเข้าเรียน"
                value={`${data.present_rate ?? 0}%`}
                color="text-accent"
              />
            </div>

            <Card title="ประวัติการเข้าเรียน" subtitle={`ทั้งหมด ${data.total_sessions ?? 0} คาบ`} padding={false}>
              <div className="p-5">
                <Table
                  columns={columns}
                  data={data.records || []}
                  rowKey="session_id"
                  pagination={(data.records || []).length > 10}
                  emptyMessage="ยังไม่มีคาบเรียน"
                />
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </ProtectedLayout>
  );
};

export default StudentClassHistory;
