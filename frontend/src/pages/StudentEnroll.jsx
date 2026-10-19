import React, { useEffect, useState } from 'react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import ClassBrowser from '../components/student/ClassBrowser';
import Spinner from '../components/common/Spinner';
import { classApi, enrollmentApi } from '../services/endpoints';
import { AlertCircle } from 'lucide-react';

const StudentEnroll = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTerm, setCurrentTerm] = useState(null); // { semester, academic_year, label }

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [rows, term] = await Promise.all([
        classApi.listAvailable(),
        classApi.currentTerm().catch(() => null),
      ]);
      setCurrentTerm(term || null);
      const list = Array.isArray(rows) ? rows : rows?.data ?? [];
      const mapped = list
        .filter((c) => !c.is_enrolled) // only NOT yet enrolled
        .map((c) => ({
          id: c.id,
          name: c.course_name,
          code: c.course_code,
          description: c.description || '',
          teacherName: c.teacher_name || '—',
          room: c.room_number || '—',
          schedule: c.schedule || '',
          semester: c.semester ?? null,
          academicYear: c.academic_year ?? null,
          termLabel:
            c.term_label ||
            (c.semester && c.academic_year ? `${c.semester}/${c.academic_year}` : ''),
          enrollmentCount: c.enrollment_count ?? 0,
          isEnrolled: false,
        }));
      setClasses(mapped);
    } catch (err) {
      console.error('Failed to load available classes', err);
      setError(err?.response?.data?.error || 'ไม่สามารถโหลดรายวิชาได้');
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEnroll = async (classId) => {
    try {
      await enrollmentApi.enroll(classId);
      // Drop the class from the enroll list so it disappears immediately.
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      return { success: true, message: 'ลงทะเบียนสำเร็จ' };
    } catch (err) {
      console.error('Enroll failed', err);
      return {
        success: false,
        message: err?.response?.data?.error || 'ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
      };
    }
  };

  return (
    <ProtectedLayout requiredRole="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">ลงทะเบียนเรียน</h1>
          <p className="text-muted text-sm mt-1">ค้นหาและลงทะเบียนคลาสเรียนที่ยังไม่ได้ลงทะเบียน</p>
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
          <ClassBrowser
            classes={classes}
            isLoading={isLoading}
            onEnroll={handleEnroll}
            defaultTerm={
              currentTerm
                ? {
                    semester: currentTerm.semester,
                    academic_year: currentTerm.academic_year,
                  }
                : null
            }
          />
        )}
      </div>
    </ProtectedLayout>
  );
};

export default StudentEnroll;
