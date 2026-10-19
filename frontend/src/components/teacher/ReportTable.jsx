import React, { useState } from 'react';
import { Download, ListChecks, CheckCircle2, XCircle, Clock } from 'lucide-react';
import Table from '../common/Table';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Select from '../common/Select';
import { downloadCSV, formatDate, formatTime } from '../../utils/helpers';
import { ATTENDANCE_STATUSES, statusLabel, statusBadge } from '../../services/endpoints';

const ReportTable = ({ classId, data = [], isLoading = false, onExport }) => {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const filteredData = data.filter((record) => {
    if (filterStatus && record.status !== filterStatus) return false;
    if (filterMonth) {
      const recordMonth = new Date(record.date).getMonth();
      return recordMonth === parseInt(filterMonth);
    }
    return true;
  });

  const columns = [
    {
      key: 'date',
      label: 'วันที่',
      render: (value) => formatDate(value),
    },
    {
      key: 'studentName',
      label: 'ชื่อนักเรียน',
    },
    {
      key: 'studentId',
      label: 'รหัสนักเรียน',
      render: (value) => <span className="font-mono text-sm text-ink-dim">{value}</span>,
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
      render: (value) => (value ? formatTime(value) : '-'),
    },
    {
      key: 'method',
      label: 'วิธีเช็คชื่อ',
      render: (value) => (
        <span className="text-xs font-medium text-ink-dim bg-elevated border border-border px-2 py-1 rounded">
          {value === 'qr' ? 'QR Code' : value === 'pin' ? 'PIN' : 'เช็คด้วยตนเอง'}
        </span>
      ),
    },
  ];

  const statusOptions = [
    { value: '', label: 'ทุกสถานะ' },
    ...ATTENDANCE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
  ];

  const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const monthOptions = [
    { value: '', label: 'ทุกเดือน' },
    ...THAI_MONTHS.map((label, i) => ({ value: i.toString(), label })),
  ];

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      const csv = generateCSV(filteredData);
      downloadCSV(csv, `attendance-report-${classId}.csv`);
    }
  };

  const generateCSV = (records) => {
    const headers = ['วันที่', 'ชื่อนักเรียน', 'รหัสนักเรียน', 'สถานะ', 'เวลาเช็คชื่อ', 'วิธีเช็คชื่อ'];
    const rows = records.map((record) => [
      formatDate(record.date),
      record.studentName,
      record.studentId,
      statusLabel(record.status),
      record.checkInTime ? formatTime(record.checkInTime) : '-',
      record.method === 'qr' ? 'QR Code' : record.method === 'pin' ? 'PIN' : 'เช็คด้วยตนเอง',
    ]);
    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  // Calculate statistics
  const stats = {
    total: filteredData.length,
    present: filteredData.filter((r) => r.status === 'present').length,
    absent: filteredData.filter((r) => r.status === 'absent').length,
    late: filteredData.filter((r) => r.status === 'late').length,
  };

  const statTiles = [
    { label: 'บันทึกทั้งหมด', value: stats.total, icon: ListChecks, color: 'text-accent', bg: 'bg-accent-dim' },
    { label: 'มาเรียน', value: stats.present, icon: CheckCircle2, color: 'text-ok', bg: 'bg-ok/15' },
    { label: 'ขาดเรียน', value: stats.absent, icon: XCircle, color: 'text-bad', bg: 'bg-bad/15' },
    { label: 'มาสาย', value: stats.late, icon: Clock, color: 'text-warn', bg: 'bg-warn/15' },
  ];

  return (
    <Card
      title="รายงานการเช็คชื่อ"
      action={
        <Button onClick={handleExport} variant="primary" size="sm" icon={Download}>
          ส่งออก CSV
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statTiles.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-3 p-4 bg-elevated border border-border rounded-xl">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs text-muted">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
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
            label="กรองตามเดือน"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            options={monthOptions}
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          emptyMessage="ไม่พบบันทึกการเช็คชื่อ"
        />

        {/* Export Button */}
        <Button
          onClick={handleExport}
          variant="primary"
          icon={Download}
          fullWidth
        >
          ส่งออกเป็น CSV
        </Button>
      </div>
    </Card>
  );
};

export default ReportTable;
