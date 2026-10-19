import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Pencil, Trash2, Plus, GraduationCap, CalendarDays, MapPin } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

const ClassList = ({ classes = [], onDelete, isLoading = false }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteConfirm = () => {
    if (selectedClass && onDelete) {
      onDelete(selectedClass.id);
    }
    setShowDeleteModal(false);
    setSelectedClass(null);
  };

  return (
    <>
      <Card
        title="คลาสของฉัน"
        action={
          <Link to="/teacher/classes/create">
            <Button variant="primary" size="sm" icon={Plus}>คลาสใหม่</Button>
          </Link>
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <GraduationCap size={30} className="text-muted mb-3" />
            <p className="text-muted text-sm">ยังไม่มีคลาสเรียน สร้างคลาสแรกของคุณเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="group relative surface-card p-5 hover:border-border-strong hover:shadow-elevated transition-all"
              >
                <Link to={`/teacher/classes/${cls.id}`} className="block">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-accent-gradient flex items-center justify-center shrink-0 shadow-glow-sm">
                      <BookOpen size={20} className="text-base" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-ink truncate group-hover:text-accent transition-colors">
                        {cls.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="inline-block font-mono text-xs text-muted bg-elevated border border-border px-2 py-0.5 rounded">
                          {cls.code}
                        </span>
                        {cls.termLabel && (
                          <span className="inline-block text-xs text-accent bg-accent-dim border border-accent px-2 py-0.5 rounded">
                            {cls.termLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-sm text-ink-dim">
                    {cls.schedule && (
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-muted shrink-0" />
                        <span className="truncate">{cls.schedule}</span>
                      </div>
                    )}
                    {cls.room && cls.room !== '—' && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-muted shrink-0" />
                        <span className="truncate">{cls.room}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Users size={14} className="text-muted" />
                    <Badge status="active" label={`ลงทะเบียน ${cls.enrollmentCount || 0} คน`} size="sm" />
                  </div>
                </Link>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Link to={`/teacher/classes/${cls.id}/edit`} className="flex-1">
                    <Button size="sm" variant="secondary" icon={Pencil} fullWidth>
                      แก้ไข
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    icon={Trash2}
                    onClick={() => {
                      setSelectedClass(cls);
                      setShowDeleteModal(true);
                    }}
                  >
                    ลบ
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedClass(null);
        }}
        title="ลบคลาสเรียน?"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedClass(null);
              }}
            >
              ยกเลิก
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleDeleteConfirm}>
              ลบ
            </Button>
          </>
        }
      >
        <p className="text-ink-dim">
          คุณแน่ใจหรือไม่ว่าต้องการลบ <span className="text-ink font-medium">"{selectedClass?.name}"</span>? การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>
      </Modal>
    </>
  );
};

export default ClassList;
