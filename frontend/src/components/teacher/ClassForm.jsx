import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import Card from '../common/Card';
import useForm from '../../hooks/useForm';
import { classApi } from '../../services/endpoints';

const DAY_OPTIONS = [
  { value: '0', label: 'อาทิตย์' },
  { value: '1', label: 'จันทร์' },
  { value: '2', label: 'อังคาร' },
  { value: '3', label: 'พุธ' },
  { value: '4', label: 'พฤหัสบดี' },
  { value: '5', label: 'ศุกร์' },
  { value: '6', label: 'เสาร์' },
];

const SEMESTERS = [
  { value: '1', label: 'ภาคเรียนที่ 1' },
  { value: '2', label: 'ภาคเรียนที่ 2' },
  { value: '3', label: 'ภาคเรียนที่ 3' },
];

const CURRENT_THAI_YEAR = new Date().getFullYear() + 543;

// Build year options: [current-1 .. current+2] plus any extra year (union, desc)
const buildYearOptions = (extraYear) => {
  const set = new Set();
  for (let y = CURRENT_THAI_YEAR - 1; y <= CURRENT_THAI_YEAR + 2; y += 1) {
    set.add(y);
  }
  const extra = Number(extraYear);
  if (extra && !Number.isNaN(extra)) set.add(extra);
  return Array.from(set)
    .sort((a, b) => b - a)
    .map((y) => ({ value: String(y), label: `${y}` }));
};

const emptyRow = () => ({ day_of_week: '1', start_time: '09:00', end_time: '10:30' });

const ClassForm = ({ initialData = null, onSubmit, isLoading = false }) => {
  const {
    values,
    errors,
    setValues,
    setFieldValue,
    handleSubmit,
    resetForm,
  } = useForm(
    {
      name: '',
      code: '',
      description: '',
      semester: '',
      academicYear: '',
      room: '',
    },
    {
      name: (val) => (!val ? 'กรุณากรอกชื่อวิชา' : null),
      code: (val) => (!val ? 'กรุณากรอกรหัสวิชา' : null),
      semester: (val) => (!val ? 'กรุณาเลือกภาคเรียน' : null),
      academicYear: (val) => (!val ? 'กรุณาเลือกปีการศึกษา' : null),
    }
  );

  const [rows, setRows] = useState([]);
  const [rowErrors, setRowErrors] = useState({});
  const [yearOptions, setYearOptions] = useState(() => buildYearOptions());
  // In create mode we lock the term to the current term (only current-term
  // creation is allowed server-side). Holds { label } for display.
  const [lockedTerm, setLockedTerm] = useState(null);
  const isCreate = !initialData;

  // Seed from initialData (edit mode) — support snake_case + camelCase
  useEffect(() => {
    if (!initialData) return;
    const name = initialData.name ?? initialData.course_name ?? '';
    const code = initialData.code ?? initialData.course_code ?? '';
    const room = initialData.room ?? initialData.room_number ?? '';
    const semester =
      initialData.semester != null ? String(initialData.semester) : '';
    const academicYear =
      initialData.academicYear != null
        ? String(initialData.academicYear)
        : initialData.academic_year != null
        ? String(initialData.academic_year)
        : '';

    setValues({
      name,
      code,
      description: initialData.description ?? '',
      semester,
      academicYear,
      room,
    });
    setYearOptions(buildYearOptions(academicYear));

    if (Array.isArray(initialData.schedules)) {
      setRows(
        initialData.schedules.map((s) => ({
          day_of_week: String(s.day_of_week ?? '1'),
          start_time: s.start_time ?? '09:00',
          end_time: s.end_time ?? '10:30',
        }))
      );
    }
  }, [initialData, setValues]);

  // Default term for create mode
  useEffect(() => {
    if (initialData) return;
    let active = true;
    (async () => {
      try {
        const term = await classApi.currentTerm();
        if (!active || !term) return;
        const sem = term.semester != null ? String(term.semester) : '2';
        const year =
          term.academic_year != null
            ? String(term.academic_year)
            : '2568';
        setFieldValue('semester', sem);
        setFieldValue('academicYear', year);
        setYearOptions(buildYearOptions(year));
        setLockedTerm({
          label:
            term.label ||
            `${SEMESTERS.find((s) => s.value === sem)?.label || `ภาคเรียนที่ ${sem}`} ปีการศึกษา ${year}`,
        });
      } catch (err) {
        setFieldValue('semester', '2');
        setFieldValue('academicYear', '2568');
        setYearOptions(buildYearOptions('2568'));
        setLockedTerm({ label: 'ภาคเรียนที่ 2 ปีการศึกษา 2568' });
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (idx) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  };

  const updateRow = (idx, field, value) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const validateRows = () => {
    const errs = {};
    rows.forEach((r, i) => {
      if (r.day_of_week === '' || !r.start_time || !r.end_time) {
        errs[i] = 'กรุณากรอกวันและเวลาให้ครบ';
      } else if (r.end_time <= r.start_time) {
        errs[i] = 'เวลาสิ้นสุดต้องหลังเวลาเริ่ม';
      }
    });
    setRowErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateRows()) return;
    await handleSubmit(async () => {
      onSubmit({
        name: values.name,
        code: values.code,
        description: values.description,
        room: values.room,
        semester: Number(values.semester),
        academic_year: Number(values.academicYear),
        academicYear: Number(values.academicYear),
        schedules: rows.map((r) => ({
          day_of_week: Number(r.day_of_week),
          start_time: r.start_time,
          end_time: r.end_time,
        })),
      });
    })();
  };

  return (
    <Card title={initialData ? 'แก้ไขคลาส' : 'สร้างคลาสใหม่'}>
      <form onSubmit={handleSubmitForm} className="space-y-6">
        <Input
          label="ชื่อวิชา"
          value={values.name}
          onChange={(e) => setFieldValue('name', e.target.value)}
          error={errors.name}
          placeholder="เช่น คณิตศาสตร์ 101"
          required
        />

        <Input
          label="รหัสวิชา"
          value={values.code}
          onChange={(e) => setFieldValue('code', e.target.value)}
          error={errors.code}
          placeholder="เช่น MATH101"
          required
        />

        <Input
          label="รายละเอียด"
          value={values.description}
          onChange={(e) => setFieldValue('description', e.target.value)}
          placeholder="รายละเอียดคร่าวๆ ของคลาสเรียน"
        />

        {isCreate ? (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-ink-dim">ภาคเรียน</label>
            <div className="flex items-center justify-between rounded-xl border border-border bg-elevated px-4 py-2.5">
              <span className="text-sm text-ink">
                {lockedTerm?.label ||
                  `${SEMESTERS.find((s) => s.value === String(values.semester))?.label || ''} ปีการศึกษา ${values.academicYear || ''}`}
              </span>
              <span className="rounded-full bg-accent-dim px-2.5 py-0.5 text-xs font-medium text-accent">
                ภาคเรียนปัจจุบัน
              </span>
            </div>
            <p className="text-muted text-xs">
              สร้างคลาสได้เฉพาะภาคเรียนปัจจุบันเท่านั้น
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="ภาคเรียน"
              value={values.semester != null ? String(values.semester) : ''}
              onChange={(e) => setFieldValue('semester', e.target.value)}
              options={SEMESTERS}
              error={errors.semester}
              required
            />
            <Select
              label="ปีการศึกษา (พ.ศ.)"
              value={values.academicYear != null ? String(values.academicYear) : ''}
              onChange={(e) => setFieldValue('academicYear', e.target.value)}
              options={yearOptions}
              error={errors.academicYear}
              required
            />
          </div>
        )}

        <Input
          label="ห้องเรียน"
          value={values.room}
          onChange={(e) => setFieldValue('room', e.target.value)}
          placeholder="เช่น A101"
        />

        {/* Weekly schedule editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-sm font-medium text-ink-dim">
              <Clock size={15} className="text-muted" />
              ตารางเรียน
            </label>
            <Button type="button" variant="secondary" onClick={addRow}>
              <span className="flex items-center gap-1.5">
                <Plus size={15} />
                เพิ่มคาบเรียน
              </span>
            </Button>
          </div>

          {rows.length === 0 ? (
            <p className="text-muted text-xs">ยังไม่มีคาบเรียน (สามารถเว้นว่างได้)</p>
          ) : (
            <div className="space-y-3">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-elevated p-3"
                >
                  <div className="flex items-start gap-2">
                    <Select
                      className="w-40 shrink-0"
                      value={row.day_of_week}
                      onChange={(e) => updateRow(idx, 'day_of_week', e.target.value)}
                      options={DAY_OPTIONS}
                      placeholder="เลือกวัน"
                    />
                    <Input
                      className="flex-1"
                      type="time"
                      value={row.start_time}
                      onChange={(e) => updateRow(idx, 'start_time', e.target.value)}
                    />
                    <span className="pt-2 text-muted">-</span>
                    <Input
                      className="flex-1"
                      type="time"
                      value={row.end_time}
                      onChange={(e) => updateRow(idx, 'end_time', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="mt-1 rounded-lg p-2 text-muted hover:text-bad hover:bg-bad/10 transition-colors"
                      aria-label="ลบคาบเรียน"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {rowErrors[idx] && (
                    <p className="text-bad text-xs mt-2">{rowErrors[idx]}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <Button type="submit" variant="primary" fullWidth loading={isLoading}>
            {initialData ? 'บันทึกคลาส' : 'สร้างคลาส'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetForm();
              setRows([]);
              setRowErrors({});
            }}
            disabled={isLoading}
          >
            รีเซ็ต
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ClassForm;
