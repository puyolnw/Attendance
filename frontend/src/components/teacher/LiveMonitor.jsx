import React, { useMemo, useState } from 'react';
import { Users, Search, UserX } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { ATTENDANCE_STATUSES, statusLabel, statusBadge } from '../../services/endpoints';

const STAT_TILES = [
  { value: 'present', color: 'text-ok', bg: 'bg-ok/15' },
  { value: 'late', color: 'text-warn', bg: 'bg-warn/15' },
  { value: 'absent', color: 'text-bad', bg: 'bg-bad/15' },
  { value: 'leave', color: 'text-info', bg: 'bg-info/15' },
  { value: 'sick', color: 'text-info', bg: 'bg-info/15' },
];

const LiveMonitor = ({ students = [], attendance = [], onMarkAttendance }) => {
  const [query, setQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Merge enrolled students with live attendance records (keyed by student id)
  const rows = useMemo(() => {
    const byStudent = {};
    attendance.forEach((a) => {
      byStudent[a.student_id] = a;
    });

    if (students.length > 0) {
      return students.map((s) => {
        const rec = byStudent[s.id] || byStudent[s.studentId] || {};
        return {
          studentId: s.id,
          idNumber: s.studentId,
          name: s.studentName,
          status: rec.status || null,
          checkInTime: rec.check_in_time || null,
        };
      });
    }
    // Fallback: no enrolled list available, render from attendance records only
    return attendance.map((a) => ({
      studentId: a.student_id,
      idNumber: a.student_id,
      name: a.student_name || '—',
      status: a.status || null,
      checkInTime: a.check_in_time || null,
    }));
  }, [students, attendance]);

  const counts = useMemo(() => {
    const c = { present: 0, late: 0, absent: 0, leave: 0, sick: 0 };
    rows.forEach((r) => {
      if (r.status && c[r.status] != null) c[r.status] += 1;
    });
    return c;
  }, [rows]);

  const markedCount = useMemo(
    () => rows.filter((r) => r.status).length,
    [rows]
  );

  const unmarked = useMemo(() => rows.filter((r) => !r.status), [rows]);

  // Filter by search + sort un-marked students to the top
  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? rows.filter(
          (r) =>
            (r.name || '').toLowerCase().includes(q) ||
            String(r.idNumber || '').toLowerCase().includes(q)
        )
      : rows;
    // stable sort: un-marked first
    return [...filtered].sort((a, b) => {
      const av = a.status ? 1 : 0;
      const bv = b.status ? 1 : 0;
      return av - bv;
    });
  }, [rows, query]);

  const handleMarkRemaining = () => {
    unmarked.forEach((r) => {
      onMarkAttendance && onMarkAttendance(r.studentId, 'absent');
    });
    setConfirmOpen(false);
  };

  return (
    <Card
      title="ติดตามการเช็คชื่อสด"
      subtitle="รีเฟรชอัตโนมัติทุก 3 วินาที"
    >
      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {STAT_TILES.map(({ value, color, bg }) => (
          <div
            key={value}
            className={`flex flex-col items-center justify-center py-3 rounded-xl border border-border ${bg}`}
          >
            <p className={`text-2xl font-bold ${color}`}>{counts[value]}</p>
            <p className="text-xs text-muted mt-0.5">{statusLabel(value)}</p>
          </div>
        ))}
      </div>

      {/* Summary line */}
      <p className="text-sm text-muted mb-3">
        เช็คชื่อแล้ว <span className="text-ink font-semibold">{markedCount}</span> /
        ทั้งหมด <span className="text-ink font-semibold">{rows.length}</span> คน
      </p>

      {/* Search + bulk-absent controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          icon={Search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหานักเรียน..."
          className="flex-1"
        />
        <Button
          variant="secondary"
          icon={UserX}
          disabled={unmarked.length === 0}
          onClick={() => setConfirmOpen(true)}
        >
          มาร์คขาดที่เหลือทั้งหมด
        </Button>
      </div>

      {/* Student rows with manual-mark buttons */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Users size={28} className="text-muted mb-3" />
          <p className="text-muted text-sm">ยังไม่มีนักเรียนให้แสดง</p>
        </div>
      ) : visibleRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Search size={28} className="text-muted mb-3" />
          <p className="text-muted text-sm">ไม่พบนักเรียนที่ตรงกับการค้นหา</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleRows.map((row) => (
            <div
              key={row.studentId}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-elevated border border-border rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{row.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted font-mono">{row.idNumber}</span>
                    <Badge
                      status={row.status ? statusBadge(row.status) : 'pending'}
                      label={row.status ? statusLabel(row.status) : 'ยังไม่ได้เช็คชื่อ'}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ATTENDANCE_STATUSES.map((s) => {
                  const active = row.status === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => onMarkAttendance && onMarkAttendance(row.studentId, s.value)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                        active
                          ? 'bg-accent text-base border-accent'
                          : 'bg-surface text-ink-dim border-border hover:border-border-strong hover:text-ink'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm bulk-absent */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="มาร์คขาดที่เหลือทั้งหมด"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="danger" icon={UserX} onClick={handleMarkRemaining}>
              ยืนยันมาร์คขาด
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-dim">
          จะมาร์คนักเรียนที่ยังไม่ได้เช็คชื่อจำนวน{' '}
          <span className="text-bad font-semibold">{unmarked.length}</span> คน
          เป็น "ขาด" ทั้งหมด ต้องการดำเนินการต่อหรือไม่?
        </p>
      </Modal>
    </Card>
  );
};

export default LiveMonitor;
