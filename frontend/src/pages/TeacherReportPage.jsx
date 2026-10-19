import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Download,
  ArrowLeft,
  FileBarChart,
  AlertTriangle,
  Users,
  CalendarDays,
  TrendingUp,
  Percent,
} from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import ReportTable from '../components/teacher/ReportTable';
import Card from '../components/common/Card';
import { reportApi, attendanceApi } from '../services/endpoints';
import { formatDate } from '../utils/formatters';

// Status → short cell letter + Tailwind classes for the matrix grid
const STATUS_CELL = {
  present: { letter: 'P', label: 'มา', cls: 'bg-ok/15 text-ok border-ok/30' },
  late: { letter: 'L', label: 'สาย', cls: 'bg-warn/15 text-warn border-warn/30' },
  absent: { letter: 'A', label: 'ขาด', cls: 'bg-bad/15 text-bad border-bad/30' },
  leave: { letter: 'V', label: 'ลา', cls: 'bg-accent-dim text-accent border-accent/30' },
  sick: { letter: 'S', label: 'ป่วย', cls: 'bg-elevated text-ink-dim border-border' },
};

const rateColor = (pct) => {
  if (pct >= 80) return 'text-ok';
  if (pct >= 50) return 'text-warn';
  return 'text-bad';
};

const TeacherReportPage = () => {
  const { classId } = useParams();
  const [matrix, setMatrix] = useState(null);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    let active = true;

    const fetchAll = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [matrixData, attRes] = await Promise.all([
          reportApi.matrix(classId),
          attendanceApi.classAttendance(classId, 1, 500),
        ]);
        if (!active) return;

        setMatrix(matrixData);

        const rows = Array.isArray(attRes?.data) ? attRes.data : [];
        setRecords(
          rows.map((r) => ({
            id: r.id,
            date: r.session?.session_date || r.check_in_time,
            studentName: r.student?.user?.full_name || '—',
            studentId: r.student?.student_id_number || '—',
            status: r.status,
            checkInTime: r.check_in_time,
            method: r.check_in_method,
          }))
        );
      } catch (err) {
        console.error('Failed to load report:', err);
        if (active) {
          setError(err?.response?.data?.error || 'ไม่สามารถโหลดรายงานการเช็คชื่อได้');
          setMatrix(null);
          setRecords([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchAll();
    return () => {
      active = false;
    };
  }, [classId]);

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const blob = await reportApi.exportCSV(classId);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `attendance-report-${classId}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      setError(err?.response?.data?.error || 'ไม่สามารถส่งออก CSV ได้');
    } finally {
      setExporting(false);
    }
  };

  const students = matrix?.students ?? [];
  const sessions = matrix?.sessions ?? [];

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => a.full_name.localeCompare(b.full_name, 'th')),
    [students]
  );

  // Overview aggregate tiles
  const overview = useMemo(() => {
    const totalStudents = students.length;
    const totalSessions = sessions.length;
    const rates = students.map((s) => s.summary.present_rate);
    const overallRate =
      rates.length > 0
        ? parseFloat((rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1))
        : 0;
    // Average attended sessions per student (present + late)
    const avgAttended =
      totalStudents > 0
        ? parseFloat(
            (
              students.reduce((a, s) => a + s.summary.present + s.summary.late, 0) /
              totalStudents
            ).toFixed(1)
          )
        : 0;
    return { totalStudents, totalSessions, overallRate, avgAttended };
  }, [students, sessions]);

  const getTabClasses = (viewName) => {
    const isActive = activeView === viewName;
    return isActive
      ? 'px-4 py-2 rounded-lg bg-accent-dim text-accent border border-accent font-medium'
      : 'px-4 py-2 rounded-lg bg-elevated text-ink-dim border border-border hover:bg-elevated/80 transition-colors';
  };

  const statTiles = [
    { label: 'นักเรียนทั้งหมด', value: overview.totalStudents, icon: Users, color: 'text-accent', bg: 'bg-accent-dim' },
    { label: 'จำนวนคาบเรียน', value: overview.totalSessions, icon: CalendarDays, color: 'text-ink', bg: 'bg-elevated' },
    { label: 'อัตราเข้าเรียนเฉลี่ย', value: `${overview.overallRate}%`, icon: Percent, color: rateColor(overview.overallRate), bg: 'bg-ok/15' },
    { label: 'เข้าเรียนเฉลี่ย (คาบ)', value: overview.avgAttended, icon: TrendingUp, color: 'text-accent', bg: 'bg-accent-dim' },
  ];

  return (
    <ProtectedLayout requiredRole="teacher">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent-gradient flex items-center justify-center shadow-glow-sm shrink-0">
              <FileBarChart size={22} className="text-base" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                รายงานการเช็คชื่อ
              </h1>
              <p className="text-muted text-sm mt-1">
                {matrix
                  ? `${matrix.course_name} (${matrix.course_code})`
                  : 'สรุปการเข้าเรียนของนักเรียนทั้งคลาส'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/teacher/classes/${classId}`}>
              <Button variant="secondary" size="sm" icon={ArrowLeft}>
                ย้อนกลับ
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              loading={exporting}
              onClick={handleExport}
            >
              ส่งออก CSV
            </Button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        {!isLoading && (
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            <button onClick={() => setActiveView('overview')} className={getTabClasses('overview')}>
              ภาพรวม
            </button>
            <button onClick={() => setActiveView('matrix')} className={getTabClasses('matrix')}>
              ตารางรายคาบ
            </button>
            <button onClick={() => setActiveView('raw')} className={getTabClasses('raw')}>
              บันทึกดิบ
            </button>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <Spinner message="กำลังโหลดรายงาน..." />
        ) : (
          <>
            {/* ---------------- Overview ---------------- */}
            {activeView === 'overview' && (
              <div className="space-y-6">
                {/* Stat tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {statTiles.map(({ label, value, icon: Icon, color, bg }) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 p-4 bg-elevated border border-border rounded-xl"
                    >
                      <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                        <Icon size={18} className={color} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted truncate">{label}</p>
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Per-student summary */}
                <Card variant="dark" title="สรุปรายนักเรียน">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted border-b border-border">
                          <th className="py-3 px-3 font-medium">รหัสนักเรียน</th>
                          <th className="py-3 px-3 font-medium">ชื่อ</th>
                          <th className="py-3 px-3 font-medium text-center">มา</th>
                          <th className="py-3 px-3 font-medium text-center">ขาด</th>
                          <th className="py-3 px-3 font-medium text-center">ลา</th>
                          <th className="py-3 px-3 font-medium text-center">ป่วย</th>
                          <th className="py-3 px-3 font-medium text-right">%เข้าเรียน</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedStudents.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-muted">
                              ยังไม่มีข้อมูล
                            </td>
                          </tr>
                        )}
                        {sortedStudents.map((s) => {
                          const attended = s.summary.present + s.summary.late;
                          return (
                            <tr
                              key={s.student_id}
                              className="border-b border-border/50 hover:bg-elevated/50"
                            >
                              <td className="py-2.5 px-3 font-mono text-ink-dim">
                                {s.student_id_number}
                              </td>
                              <td className="py-2.5 px-3 text-ink">{s.full_name}</td>
                              <td className="py-2.5 px-3 text-center text-ok font-medium">{attended}</td>
                              <td className="py-2.5 px-3 text-center text-bad">{s.summary.absent}</td>
                              <td className="py-2.5 px-3 text-center text-ink-dim">{s.summary.leave}</td>
                              <td className="py-2.5 px-3 text-center text-ink-dim">{s.summary.sick}</td>
                              <td className={`py-2.5 px-3 text-right font-bold ${rateColor(s.summary.present_rate)}`}>
                                {s.summary.present_rate}%
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ---------------- Matrix ---------------- */}
            {activeView === 'matrix' && (
              <Card variant="dark" title="ตารางการเข้าเรียนรายคาบ">
                {sessions.length === 0 || sortedStudents.length === 0 ? (
                  <p className="py-8 text-center text-muted">ยังไม่มีข้อมูล</p>
                ) : (
                  <>
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="text-sm border-collapse">
                        <thead>
                          <tr className="bg-elevated">
                            <th className="sticky left-0 z-10 bg-elevated py-3 px-3 text-left font-medium text-muted border-b border-r border-border min-w-[180px]">
                              นักเรียน
                            </th>
                            {sessions.map((sess) => (
                              <th
                                key={sess.session_id}
                                className="py-3 px-2 text-center font-medium text-muted border-b border-border whitespace-nowrap"
                              >
                                {formatDate(sess.date, 'DD/MM')}
                              </th>
                            ))}
                            <th className="py-3 px-3 text-center font-medium text-muted border-b border-l border-border whitespace-nowrap">
                              %
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedStudents.map((s) => (
                            <tr key={s.student_id} className="hover:bg-elevated/40">
                              <td className="sticky left-0 z-10 bg-base py-2 px-3 border-b border-r border-border">
                                <div className="text-ink truncate max-w-[160px]">{s.full_name}</div>
                                <div className="text-xs font-mono text-muted">{s.student_id_number}</div>
                              </td>
                              {sessions.map((sess) => {
                                const st = s.cells[sess.session_id] || 'absent';
                                const cell = STATUS_CELL[st] || STATUS_CELL.absent;
                                return (
                                  <td
                                    key={sess.session_id}
                                    className="py-2 px-2 text-center border-b border-border"
                                  >
                                    <span
                                      title={cell.label}
                                      className={`inline-flex items-center justify-center w-7 h-7 rounded-md border text-xs font-bold ${cell.cls}`}
                                    >
                                      {cell.letter}
                                    </span>
                                  </td>
                                );
                              })}
                              <td className={`py-2 px-3 text-center border-b border-l border-border font-bold ${rateColor(s.summary.present_rate)}`}>
                                {s.summary.present_rate}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted">
                      {Object.values(STATUS_CELL).map((c) => (
                        <div key={c.letter} className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded border text-[10px] font-bold ${c.cls}`}>
                            {c.letter}
                          </span>
                          {c.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* ---------------- Raw Log ---------------- */}
            {activeView === 'raw' && (
              <ReportTable
                classId={classId}
                data={records}
                isLoading={false}
                onExport={handleExport}
              />
            )}
          </>
        )}
      </div>
    </ProtectedLayout>
  );
};

export default TeacherReportPage;
