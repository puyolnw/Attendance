import { Enrollment, Class, Student, User, Teacher, Session, Attendance, Schedule } from '../models/index.js';
import { Op } from 'sequelize';
import { isCurrentTerm } from '../config/currentTerm.js';

const DAY_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const hhmm = (t) => (t ? String(t).slice(0, 5) : '');
const formatSchedule = (schedules = []) =>
  schedules
    .map((s) => `${DAY_TH[s.day_of_week] ?? ''} ${hhmm(s.start_time)}-${hhmm(s.end_time)}`.trim())
    .join(', ');

export class EnrollmentService {
  static async enrollStudent(studentId, classId) {
    const classData = await Class.findByPk(classId);
    if (!classData) {
      throw new Error('Class not found');
    }

    // Only the current term is open for enrollment
    if (!isCurrentTerm(classData.semester, classData.academic_year)) {
      const err = new Error('ภาคเรียนนี้สิ้นสุดแล้ว ไม่สามารถลงทะเบียนได้');
      err.status = 403;
      throw err;
    }

    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const existing = await Enrollment.findOne({
      where: {
        student_id: studentId,
        class_id: classId
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
      student_id: studentId,
      class_id: classId,
      status: 'active'
    });

    return this.getEnrollmentDetails(enrollment.id);
  }

  static async getEnrolledClasses(studentId) {
    const enrollments = await Enrollment.findAll({
      where: {
        student_id: studentId,
        status: 'active'
      },
      include: [{
        model: Class,
        as: 'class',
        include: [
          {
            model: Teacher,
            as: 'teacher',
            include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }]
          },
          { model: Schedule, as: 'schedules' }
        ]
      }],
      order: [['created_at', 'DESC']]
    });

    // For each enrolled class, count total sessions and this student's present+late attendance
    const result = [];
    for (const e of enrollments) {
      const cls = e.class;
      const totalSessions = await Session.count({ where: { class_id: cls.id } });
      const presentCount = await Attendance.count({
        where: { student_id: studentId, status: { [Op.in]: ['present', 'late'] } },
        include: [{ model: Session, as: 'session', where: { class_id: cls.id }, attributes: [] }]
      });
      const teacherUser = cls.teacher?.user;
      result.push({
        enrollment_id: e.id,
        class_id: cls.id,
        course_code: cls.course_code,
        course_name: cls.course_name,
        teacher_name: teacherUser?.full_name || '—',
        teacher_id: teacherUser?.id || null,
        room_number: cls.room_number || '—',
        schedule: formatSchedule(cls.schedules),
        semester: cls.semester,
        academic_year: cls.academic_year,
        term_label: `${cls.semester}/${cls.academic_year}`,
        total_sessions: totalSessions,
        present_count: presentCount,
        enrolled_at: e.created_at
      });
    }
    return result;
  }

  static async dropClass(enrollmentId, studentId) {
    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (enrollment.student_id !== studentId) {
      throw new Error('Not authorized to drop this enrollment');
    }

    await enrollment.update({ status: 'withdrawn' });
  }

  static async getClassEnrollments(classId) {
    return await Enrollment.findAll({
      where: {
        class_id: classId,
        status: 'active'
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
          include: [{
            model: Teacher,
            as: 'teacher',
            include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email'] }]
          }]
        }
      ]
    });
  }
}
