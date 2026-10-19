import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import useForm from '../../hooks/useForm';
import { Check } from 'lucide-react';

const EnrollmentForm = ({ classInfo, onSubmit, isLoading = false }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    values,
    errors,
    setFieldValue,
    handleSubmit,
  } = useForm(
    {
      classId: classInfo?.id || '',
      confirmEnrollment: '',
    },
    {
      confirmEnrollment: (val) => !val ? 'กรุณายืนยันการลงทะเบียน' : null,
    }
  );

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert('กรุณายอมรับข้อกำหนดและเงื่อนไข');
      return;
    }
    await handleSubmit(async () => {
      onSubmit(values);
    })();
  };

  if (!classInfo) {
    return (
      <Card className="max-w-md">
        <p className="text-muted text-sm">ไม่พบข้อมูลคลาสเรียน</p>
      </Card>
    );
  }

  return (
    <Card title="ยืนยันการลงทะเบียน" className="max-w-2xl">
      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* Class Information Summary */}
        <div className="bg-accent-dim border border-accent/30 rounded-xl p-6 space-y-3">
          <h3 className="font-semibold text-lg text-ink">{classInfo.name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted">รหัสวิชา</p>
              <p className="font-mono font-medium text-ink">{classInfo.code}</p>
            </div>
            <div>
              <p className="text-muted">อาจารย์</p>
              <p className="font-medium text-ink">{classInfo.teacherName}</p>
            </div>
            <div>
              <p className="text-muted">ตารางเรียน</p>
              <p className="font-medium text-ink">{classInfo.schedule}</p>
            </div>
            <div>
              <p className="text-muted">ห้องเรียน</p>
              <p className="font-medium text-ink">{classInfo.room}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted">รายละเอียด</p>
              <p className="font-medium text-ink">{classInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-elevated rounded-xl p-4 border border-border">
          <h4 className="font-semibold text-ink mb-3">ข้อกำหนดและเงื่อนไข</h4>
          <div className="text-sm text-ink-dim space-y-2 max-h-32 overflow-y-auto mb-4 border border-border rounded-lg p-3 bg-surface">
            <p>• ฉันเข้าใจข้อกำหนดและความคาดหวังของวิชานี้</p>
            <p>• ฉันตกลงที่จะเข้าเรียนอย่างสม่ำเสมอ</p>
            <p>• ฉันจะใช้เฉพาะวิธีเช็คชื่อที่ได้รับอนุญาตเท่านั้น</p>
            <p>• ฉันเข้าใจนโยบายการเข้าเรียนของสถาบันนี้</p>
            <p>• ฉันยินยอมให้เก็บและใช้ข้อมูลการเข้าเรียนของฉัน</p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <span
              className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                agreedToTerms
                  ? 'bg-accent border-accent'
                  : 'bg-elevated border-border-strong group-hover:border-accent'
              }`}
            >
              {agreedToTerms && <Check size={14} className="text-base" strokeWidth={3} />}
            </span>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm text-ink-dim">
              ฉันยอมรับข้อกำหนดและเงื่อนไข
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
            disabled={!agreedToTerms}
          >
            ยืนยันการลงทะเบียน
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EnrollmentForm;
