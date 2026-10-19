import React, { useEffect, useState } from 'react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import HistoryTable from '../components/student/HistoryTable';
import Spinner from '../components/common/Spinner';
import { attendanceApi } from '../services/endpoints';
import { AlertCircle } from 'lucide-react';

const StudentHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await attendanceApi.myHistory();
        const rows = Array.isArray(res) ? res : res?.data ?? [];

        // Map backend records {id, session_date, check_in_time, status,
        // check_in_method, class_name, course_code, session_time} → UI shape.
        const mapped = rows.map((r) => ({
          id: r.id,
          date: r.session_date ? new Date(r.session_date) : null,
          classId: String(r.class_id ?? r.classId ?? ''),
          className: r.class_name || r.className || r.course_name || '—',
          classCode: r.class_code || r.course_code || r.classCode || '',
          sessionTime:
            r.session_time ||
            [r.start_time, r.end_time].filter(Boolean).join('-') ||
            '',
          status: r.status,
          checkInTime: r.check_in_time ? new Date(r.check_in_time) : null,
          checkInMethod: r.check_in_method || r.checkInMethod || null,
        }));

        setHistory(mapped);
      } catch (err) {
        console.error('Failed to load history', err);
        setError(err?.response?.data?.error || 'ไม่สามารถโหลดประวัติของคุณได้');
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <ProtectedLayout requiredRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">ประวัติการเช็คชื่อ</h1>
          <p className="text-muted text-sm mt-1">ดูบันทึกการเช็คชื่อของคุณในทุกคลาสเรียน</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-bad/40 bg-bad/10 px-4 py-3 text-sm text-bad">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <Spinner fullscreen />
        ) : (
          <HistoryTable history={history} isLoading={isLoading} />
        )}
      </div>
    </ProtectedLayout>
  );
};

export default StudentHistoryPage;
