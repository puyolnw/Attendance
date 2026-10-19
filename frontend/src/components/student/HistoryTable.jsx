import React, { useState } from 'react';
import Table from '../common/Table';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Select from '../common/Select';
import { ATTENDANCE_STATUSES, statusLabel, statusBadge } from '../../services/endpoints';
import { formatDate, formatTime } from '../../utils/helpers';
import { QrCode, KeyRound, Hand, ListChecks, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

const HistoryTable = ({ history = [], isLoading = false, classFilter = '' }) => {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClass, setFilterClass] = useState(classFilter);

  const filteredHistory = history.filter((record) => {
    if (filterStatus && record.status !== filterStatus) return false;
    if (filterClass && record.classId !== filterClass) return false;
    return true;
  });

  const columns = [
    {
      key: 'date',
      label: 'วันที่',
      render: (value) => formatDate(value),
    },
    {
      key: 'className',
      label: 'คลาสเรียน',
      render: (value, row) => (
        <div>
          <p className="font-medium text-ink">{value}</p>
          <p className="text-xs text-muted font-mono">{row.classCode}</p>
        </div>
      ),
    },
    {
      key: 'sessionTime',
      label: 'เวลาคาบเรียน',
      render: (value) => (
        <span className="text-sm text-ink-dim">{value}</span>
      ),
    },
    {
      key: 'status',
      label: 'สถานะ',
      render: (value) => (
        <Badge status={statusBadge(value)} label={statusLabel(value)} />
      ),
    },
    {
      key: 'checkInTime',
      label: 'เวลาเช็คชื่อ',
      render: (value, row) => {
        if (!value) return <span className="text-muted">-</span>;
        const method = row.checkInMethod;
        const MethodIcon = method === 'qr' ? QrCode : method === 'pin' ? KeyRound : Hand;
        const methodLabel = method === 'qr' ? 'QR Code' : method === 'pin' ? 'PIN' : 'ด้วยตนเอง';
        return (
          <div>
            <p className="text-sm text-ink-dim">{formatTime(value)}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <MethodIcon size={13} /> {methodLabel}
            </p>
          </div>
        );
      },
    },
  ];

  const statusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    ...ATTENDANCE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
  ];

  const classMap = new Map();
  history.forEach((r) => {
    if (r.classId && !classMap.has(r.classId)) {
      classMap.set(r.classId, r.className);
    }
  });

  const classOptions = [
    { value: '', label: 'ทุกคลาสเรียน' },
    ...Array.from(classMap.entries()).map(([id, name]) => ({
      value: id,
      label: name,
    })),
  ];

  // Calculate statistics
  const stats = {
    total: filteredHistory.length,
    present: filteredHistory.filter((r) => r.status === 'present').length,
    absent: filteredHistory.filter((r) => r.status === 'absent').length,
    late: filteredHistory.filter((r) => r.status === 'late').length,
    attendanceRate: filteredHistory.length > 0
      ? Math.round(
        ((filteredHistory.filter((r) => r.status === 'present' || r.status === 'late').length) /
          filteredHistory.length) *
        100
      )
      : 0,
  };

  const statTiles = [
    { label: 'ทั้งหมด', value: stats.total, icon: ListChecks, color: 'text-accent' },
    { label: 'มาเรียน', value: stats.present, icon: CheckCircle, color: 'text-ok' },
    { label: 'ขาดเรียน', value: stats.absent, icon: XCircle, color: 'text-bad' },
    { label: 'มาสาย', value: stats.late, icon: Clock, color: 'text-warn' },
    { label: 'อัตรา', value: `${stats.attendanceRate}%`, icon: TrendingUp, color: 'text-info' },
  ];

  return (
    <Card title="ประวัติการเช็คชื่อ">
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statTiles.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-elevated border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">{label}</p>
                <Icon size={15} className={color} />
              </div>
              <p className="text-2xl font-bold text-ink mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="กรองตามสถานะ"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={statusOptions}
          />
          <Select
            label="กรองตามคลาสเรียน"
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            options={classOptions}
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredHistory}
          isLoading={isLoading}
          emptyMessage="ไม่พบบันทึกการเช็คชื่อ"
        />
      </div>
    </Card>
  );
};

export default HistoryTable;
