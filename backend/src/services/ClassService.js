import { Class, Enrollment, Student, User, Teacher, Schedule } from '../models/index.js';
import { Op } from 'sequelize';
import { isCurrentTerm, CURRENT_TERM } from '../config/currentTerm.js';

const teacherInclude = {
  model: Teacher,
  as: 'teacher',
  include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }]
};

const DAY_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const hhmm = (t) => (t ? String(t).slice(0, 5) : '');
const formatSchedule = (schedules = []) =>
  schedules
    .map((s) => `${DAY_TH[s.day_of_week] ?? ''} ${hhmm(s.start_time)}-${hhmm(s.end_time)}`.trim())
    .join(', ');

// Flatten a Class instance (with teacher+schedules) → plain object incl enrollment_count.
const enrichClass = async (cls) => {
  if (!cls) return null;
  const enrollmentCount = await Enrollment.count({
    where: { class_id: cls.id, status: 'active' }
  });
  const json = cls.toJSON ? cls.toJSON() : cls;
  return {
    ...json,
    teacher_name: json.teacher?.user?.full_name || '—',
    schedule: formatSchedule(json.schedules),
    enrollment_count: enrollmentCount,
    term_label: `${json.semester}/${json.academic_year}` // e.g. "1/2569"
  };
};

// Build a Sequelize where-clause from optional {semester, academic_year} filter.
const termWhere = (filter = {}) => {
  const w = {};
  if (filter.semester) w.semester = Number(filter.semester);
  if (filter.academic_year) w.academic_year = Number(filter.academic_year);
  return w;
};

export class ClassService {
  static async createClass(classData) {
    const { schedules, ...classFields } = classData;

    // New classes must be for the current active term only
    if (!isCurrentTerm(classFields.semester, classFields.academic_year)) {
      const err = new Error('สร้างวิชาได้เฉพาะภาคเรียนปัจจุบันเท่านั้น');
      err.status = 403;
      throw err;
    }

    // Prevent duplicate course_code within the same term for this teacher
    const dup = await Class.findOne({
      where: {
        teacher_id: classFields.teacher_id,
        course_code: classFields.course_code,
        semester: classFields.semester,
        academic_year: classFields.academic_year
      }
    });
    if (dup) {
      const err = new Error(`มีวิชา ${classFields.course_code} ในภาคเรียน ${classFields.semester}/${classFields.academic_year} อยู่แล้ว`);
      err.status = 409;
      throw err;
    }

    const newClass = await Class.create(classFields);

    // Persist optional weekly schedule rows
    if (Array.isArray(schedules) && schedules.length > 0) {
      await Schedule.bulkCreate(
        schedules.map((s) => ({
          class_id: newClass.id,
          day_of_week: Number(s.day_of_week),
          start_time: s.start_time,
          end_time: s.end_time,
          location: s.location || classFields.room_number || null
        }))
      );
    }

    return this.getClass(newClass.id);
  }

  static async getClass(classId) {
    const cls = await Class.findByPk(classId, {
      include: [teacherInclude, { model: Schedule, as: 'schedules' }]
    });
    return enrichClass(cls);
  }

  static async listTeacherClasses(teacherId, filter = {}) {
    const classes = await Class.findAll({
      where: { teacher_id: teacherId, ...termWhere(filter) },
      include: [teacherInclude, { model: Schedule, as: 'schedules' }],
      order: [['academic_year', 'DESC'], ['semester', 'DESC'], ['created_at', 'DESC']]
    });
    return Promise.all(classes.map(enrichClass));
  }

  // Distinct terms (semester + year) across a teacher's classes, newest first.
  static async listTeacherTerms(teacherId) {
    const classes = await Class.findAll({
      where: { teacher_id: teacherId },
      attributes: ['semester', 'academic_year'],
      group: ['semester', 'academic_year'],
      order: [['academic_year', 'DESC'], ['semester', 'DESC']]
    });
    return classes.map((c) => ({
      semester: c.semester,
      academic_year: c.academic_year,
      label: `${c.semester}/${c.academic_year}`
    }));
  }

  // Classes a student can enroll in — CURRENT TERM ONLY (past terms are closed).
  static async listAvailableClasses(studentId, filter = {}) {
    const classes = await Class.findAll({
      where: { semester: CURRENT_TERM.semester, academic_year: CURRENT_TERM.academic_year },
      include: [teacherInclude, { model: Schedule, as: 'schedules' }],
      order: [['course_code', 'ASC']]
    });

    const myEnrollments = await Enrollment.findAll({
      where: { student_id: studentId },
      attributes: ['class_id', 'id', 'status']
    });
    const enrolledMap = new Map(myEnrollments.map((e) => [e.class_id, e]));

    return Promise.all(
      classes.map(async (cls) => {
        const base = await enrichClass(cls);
        const enr = enrolledMap.get(cls.id);
        return {
          ...base,
          is_enrolled: !!enr && enr.status === 'active',
          enrollment_id: enr?.id || null,
        };
      })
    );
  }

  static async updateClass(classId, updateData) {
    const { schedules, ...classFields } = updateData;

    if (Object.keys(classFields).length > 0) {
      await Class.update(classFields, { where: { id: classId } });
    }

    // If schedules provided, replace the whole weekly set
    if (Array.isArray(schedules)) {
      await Schedule.destroy({ where: { class_id: classId } });
      if (schedules.length > 0) {
        await Schedule.bulkCreate(
          schedules.map((s) => ({
            class_id: classId,
            day_of_week: Number(s.day_of_week),
            start_time: s.start_time,
            end_time: s.end_time,
            location: s.location || null
          }))
        );
      }
    }

    return this.getClass(classId);
  }

  static async deleteClass(classId) {
    await Class.destroy({
      where: { id: classId }
    });
  }

  static async getStudents(classId) {
    const enrollments = await Enrollment.findAll({
      where: {
        class_id: classId,
        status: { [Op.ne]: 'withdrawn' }
      },
      include: [{
        model: Student,
        as: 'student',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }]
      }],
      order: [['created_at', 'ASC']]
    });

    return enrollments.map(e => ({
      enrollment_id: e.id,
      student_id: e.student_id,
      student_id_number: e.student.student_id_number,
      full_name: e.student.user.full_name,
      email: e.student.user.email,
      status: e.status,
      enrolled_at: e.created_at
    }));
  }

  static async addStudent(classId, studentId) {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const existing = await Enrollment.findOne({
      where: {
        class_id: classId,
        student_id: studentId
      }
    });

    if (existing && existing.status === 'active') {
      throw new Error('Student is already enrolled in this class');
    }

    if (existing && existing.status !== 'active') {
      await existing.update({ status: 'active' });
      return this.getEnrollmentDetails(existing.id);
    }

    const enrollment = await Enrollment.create({
      class_id: classId,
      student_id: studentId,
      status: 'active'
    });

    return this.getEnrollmentDetails(enrollment.id);
  }

  static async removeStudent(classId, studentId) {
    const enrollment = await Enrollment.findOne({
      where: {
        class_id: classId,
        student_id: studentId
      }
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    await enrollment.update({ status: 'withdrawn' });
  }

  static async getEnrollmentDetails(enrollmentId) {
    return await Enrollment.findByPk(enrollmentId, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'full_name', 'email']
          }]
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'course_name', 'course_code']
        }
      ]
    });
  }
}
