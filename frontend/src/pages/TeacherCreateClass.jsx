import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import ProtectedLayout from '../components/layout/ProtectedLayout';
import ClassForm from '../components/teacher/ClassForm';
import { classApi } from '../services/endpoints';

const TeacherCreateClass = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setIsLoading(true);
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
      await classApi.create(payload);
      navigate('/teacher');
    } catch (err) {
      setError(err.response?.data?.error || 'ไม่สามารถสร้างคลาสเรียนได้');
      console.error('Error creating class:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedLayout requiredRole="teacher">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">สร้างคลาสใหม่</h1>
          <p className="text-muted text-sm mt-1">กรอกรายละเอียดเพื่อสร้างคลาสเรียนใหม่</p>
        </div>
        {error && (
          <div className="flex items-center gap-2 bg-bad/10 border border-bad/30 text-bad text-sm rounded-xl px-4 py-3 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <ClassForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </ProtectedLayout>
  );
};

export default TeacherCreateClass;
