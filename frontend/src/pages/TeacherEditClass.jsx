import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import ClassForm from '../components/teacher/ClassForm';
import Spinner from '../components/common/Spinner';
import { classApi } from '../services/endpoints';

const TeacherEditClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const cls = await classApi.get(classId);
        setClassData({
          id: cls.id,
          name: cls.course_name || '',
          code: cls.course_code || '',
          description: cls.description || '',
          room: cls.room_number || '',
          semester: cls.semester != null ? String(cls.semester) : '',
          academicYear: cls.academic_year != null ? String(cls.academic_year) : '2569',
          schedules: Array.isArray(cls.schedules)
            ? cls.schedules.map((s) => ({
                day_of_week: s.day_of_week,
                start_time: s.start_time,
                end_time: s.end_time,
              }))
            : [],
        });
      } catch (err) {
        console.error('Error loading class:', err);
        setError(err.response?.data?.error || 'ไม่สามารถโหลดคลาสเรียนได้');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        course_code: formData.code,
        course_name: formData.name,
        room_number: formData.room,
        description: formData.description,
        semester: formData.semester,
        academic_year: formData.academic_year,
        schedules: formData.schedules,
      };
      await classApi.update(classId, payload);
      navigate(`/teacher/classes/${classId}`);
    } catch (err) {
      console.error('Error updating class:', err);
      setError(err.response?.data?.error || 'ไม่สามารถอัปเดตคลาสเรียนได้');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedLayout requiredRole="teacher">
        <Spinner fullscreen />
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout requiredRole="teacher">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">แก้ไขคลาส</h1>
          <p className="text-muted text-sm mt-1">อัปเดตรายละเอียดคลาสเรียน</p>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <ClassForm initialData={classData} onSubmit={handleSubmit} isLoading={saving} />
      </div>
    </ProtectedLayout>
  );
};

export default TeacherEditClass;
