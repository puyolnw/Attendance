import React, { useState } from 'react';
import { Play, Info, Zap, SlidersHorizontal, ChevronDown } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import useForm from '../../hooks/useForm';

// Build "start now" defaults from the client's clock.
const buildQuickStartDefaults = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const session_date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const start_time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const end = new Date(now.getTime() + 60 * 60 * 1000);
  const end_time = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  return { session_date, start_time, end_time, grace_period_minutes: 15 };
};

const SessionCreator = ({ classId, classes = [], onSubmit, isLoading = false }) => {
  const [showCustom, setShowCustom] = useState(false);

  const {
    values,
    errors,
    setFieldValue,
    handleSubmit,
  } = useForm(
    {
      classId: classId || '',
      session_date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '10:00',
      grace_period_minutes: '15',
    },
    {
      classId: (val) => !val ? 'กรุณาเลือกคลาสเรียน' : null,
      session_date: (val) => !val ? 'กรุณาระบุวันที่' : null,
      start_time: (val) => !val ? 'กรุณาระบุเวลาเริ่ม' : null,
      end_time: (val) => !val ? 'กรุณาระบุเวลาสิ้นสุด' : null,
    }
  );

  const selectedClassId = classId || values.classId;

  const handleQuickStart = () => {
    if (!selectedClassId) {
      // Surface the class requirement via the form validation path.
      setShowCustom(true);
      handleSubmit(async () => {})();
      return;
    }
    onSubmit(buildQuickStartDefaults());
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    await handleSubmit(async () => {
      onSubmit({
        session_date: values.session_date,
        start_time: values.start_time,
        end_time: values.end_time,
        grace_period_minutes: Number(values.grace_period_minutes) || 0,
      });
    })();
  };

  const classOptions = classes.map((cls) => ({
    value: cls.id,
    label: `${cls.name} (${cls.code})`,
  }));

  return (
    <Card title="สร้างคาบเช็คชื่อ" className="max-w-2xl">
      <div className="space-y-6">
        {/* Class selector (shared by quick-start and custom form) */}
        <Select
          label="เลือกคลาสเรียน"
          value={values.classId}
          onChange={(e) => setFieldValue('classId', e.target.value)}
          options={classOptions}
          error={errors.classId}
          required
          disabled={!!classId}
        />

        {/* Quick start */}
        <div className="rounded-xl border border-accent/40 bg-accent-dim p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-accent shrink-0" />
            <h3 className="text-ink font-semibold">เริ่มคาบเรียนตอนนี้</h3>
          </div>
          <p className="text-muted text-sm">
            เริ่มคาบเช็คชื่อทันที ระบบจะตั้งเวลาเริ่มเป็นตอนนี้ และสิ้นสุดในอีก 1 ชั่วโมง
            (ช่วงผ่อนผัน 15 นาที)
          </p>
          <Button
            type="button"
            variant="primary"
            icon={Zap}
            fullWidth
            loading={isLoading}
            onClick={handleQuickStart}
          >
            เริ่มคาบเรียนตอนนี้
          </Button>
        </div>

        {/* Custom scheduling toggle */}
        <div className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowCustom((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors"
          >
            <SlidersHorizontal size={16} />
            กำหนดเวลาเอง
            <ChevronDown
              size={16}
              className={`transition-transform ${showCustom ? 'rotate-180' : ''}`}
            />
          </button>

          {showCustom && (
            <form onSubmit={handleSubmitForm} className="space-y-6 mt-4 animate-fade-in">
              <Input
                label="วันที่คาบเรียน"
                type="date"
                lang="en-GB"
                value={values.session_date}
                onChange={(e) => setFieldValue('session_date', e.target.value)}
                error={errors.session_date}
                hint="รูปแบบ วว/ดด/ปปปป"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="เวลาเริ่ม (24 ชม.)"
                  type="time"
                  lang="en-GB"
                  step="60"
                  value={values.start_time}
                  onChange={(e) => setFieldValue('start_time', e.target.value)}
                  error={errors.start_time}
                  required
                />
                <Input
                  label="เวลาสิ้นสุด (24 ชม.)"
                  type="time"
                  lang="en-GB"
                  step="60"
                  value={values.end_time}
                  onChange={(e) => setFieldValue('end_time', e.target.value)}
                  error={errors.end_time}
                  required
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="ช่วงผ่อนผัน (นาที)"
                  type="number"
                  min="0"
                  value={values.grace_period_minutes}
                  onChange={(e) => setFieldValue('grace_period_minutes', e.target.value)}
                  placeholder="15"
                />
                <div className="flex items-start gap-2 text-xs text-muted bg-elevated border border-border rounded-lg px-3 py-2">
                  <Info size={14} className="text-accent shrink-0 mt-0.5" />
                  <span>
                    นักเรียนที่เช็คชื่อภายใน {values.grace_period_minutes || 0} นาทีหลังเวลาเริ่ม จะถูกบันทึกเป็น
                    <span className="text-warn font-medium"> มาสาย</span>; หลังจากนั้นจะถูกบันทึกเป็น
                    <span className="text-bad font-medium"> ขาดเรียน</span>
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                icon={Play}
                fullWidth
                loading={isLoading}
              >
                เริ่มคาบเรียนตามเวลาที่กำหนด
              </Button>
            </form>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SessionCreator;
