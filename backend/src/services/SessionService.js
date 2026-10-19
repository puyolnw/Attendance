import { Session, Attendance, Student, Class, User, Enrollment } from '../models/index.js';
import { fn, col, literal } from 'sequelize';

export class SessionService {
  // Calculate attendance status for a self check-in (QR/PIN).
  // A student who checks in is physically present — never 'absent'.
  // Within grace → present; after grace → late (never absent from a check-in).
  static getAttendanceStatus(checkInTime, sessionStartTime, gracePeriodMinutes = 15) {
    const diffMinutes = (checkInTime.getTime() - sessionStartTime.getTime()) / (1000 * 60);
    if (diffMinutes <= gracePeriodMinutes) return 'present';
    return 'late';
  }

  // Create attendance session
  static async createSession(classId, sessionDate, startTime, endTime, createdBy, gracePeriodMinutes = 15) {
    const session = await Session.create({
      class_id: classId,
      session_date: sessionDate,
      start_time: startTime,
      end_time: endTime,
      status: 'active',
      created_by: createdBy,
      grace_period_minutes: gracePeriodMinutes
    });

    return session;
  }

  // Get session details
  static async getSession(sessionId) {
    return await Session.findByPk(sessionId, {
      include: ['class', 'creator']
    });
  }

  // Update session status
  static async updateSessionStatus(sessionId, status) {
    return await Session.update(
      { status },
      { where: { id: sessionId }, returning: true }
    );
  }

  // Get attendance list for session
  static async getSessionAttendance(sessionId, limit = 50, offset = 0) {
    return await Attendance.findAndCountAll({
      where: { session_id: sessionId },
      include: [{ model: Student, as: 'student' }],
      limit,
      offset,
      order: [['check_in_time', 'DESC']]
    });
  }

  // Check if student already checked in
  static async hasCheckedIn(sessionId, studentId) {
    return await Attendance.findOne({
      where: { session_id: sessionId, student_id: studentId }
    });
  }

  // Auto-close a session if it is past end_time + buffer. Returns true if closed.
  static async autoCloseIfExpired(session, bufferMinutes = 10) {
    if (!session || session.status !== 'active') return false;
    const [y, m, d] = String(session.session_date).split('-').map(Number);
    const [hh, mm, ss] = String(session.end_time).split(':').map(Number);
    const closeAt = new Date(y, m - 1, d, hh || 0, mm || 0, ss || 0);
    closeAt.setMinutes(closeAt.getMinutes() + bufferMinutes);
    if (new Date() >= closeAt) {
      await session.update({ status: 'closed' });
      // Mark absentees (import lazily to avoid circular dep)
      const { AttendanceService } = await import('./AttendanceService.js');
      await AttendanceService.markAbsentees(session.id);
      return true;
    }
    return false;
  }

  // List sessions for a class (with attendance count)
  static async listClassSessions(classId) {
    const sessions = await Session.findAll({
      where: { class_id: classId },
      include: [{ model: Attendance, as: 'attendances', attributes: [] }],
      attributes: {
        include: [[fn('COUNT', col('attendances.id')), 'attendance_count']]
      },
      group: ['Session.id'],
      order: [['session_date', 'DESC'], ['start_time', 'DESC']]
    });
    return sessions;
  }

  // List all sessions created by a teacher (across their classes).
  // Optional { semester, academic_year } filters the included Class by term;
  // when absent, sessions from ALL terms are returned.
  static async listTeacherSessions(teacherId, filter = {}) {
    const classInclude = {
      model: Class,
      as: 'class',
      attributes: ['id', 'course_code', 'course_name']
    };
    if (filter.semester && filter.academic_year) {
      classInclude.where = {
        semester: filter.semester,
        academic_year: filter.academic_year
      };
    }
    const sessions = await Session.findAll({
      where: { created_by: teacherId },
      include: [
        classInclude,
        { model: Attendance, as: 'attendances', attributes: [] }
      ],
      attributes: {
        include: [[fn('COUNT', col('attendances.id')), 'attendance_count']]
      },
      group: ['Session.id', 'class.id'],
      order: [['session_date', 'DESC'], ['start_time', 'DESC']]
    });
    return sessions;
  }

  // Full detail for one session: class info + every enrolled student's status
  // (students with no attendance row are reported as 'absent').
  static async getSessionSummary(sessionId) {
    const session = await Session.findByPk(sessionId, {
      include: [{
        model: Class,
        as: 'class',
        attributes: ['id', 'course_code', 'course_name', 'room_number']
      }]
    });
    if (!session) {
      const err = new Error('Session not found');
      err.status = 404;
      throw err;
    }

    const enrollments = await Enrollment.findAll({
      where: { class_id: session.class_id, status: 'active' },
      include: [{
        model: Student,
        as: 'student',
        include: [{ model: User, as: 'user', attributes: ['full_name'] }]
      }]
    });

    const attendances = await Attendance.findAll({
      where: { session_id: sessionId }
    });
    const attMap = new Map(attendances.map((a) => [a.student_id, a]));

    const counts = { present: 0, late: 0, absent: 0, leave: 0, sick: 0 };
    const students = enrollments.map((enr) => {
      const a = attMap.get(enr.student_id);
      const status = a?.status || 'absent';
      if (counts[status] !== undefined) counts[status]++;
      return {
        student_id: enr.student_id,
        student_id_number: enr.student?.student_id_number || '—',
        full_name: enr.student?.user?.full_name || 'Unknown',
        status,
        check_in_time: a?.check_in_time || null,
        method: a?.check_in_method || null
      };
    });
    students.sort((x, y) => x.full_name.localeCompare(y.full_name));

    return {
      id: session.id,
      class_id: session.class_id,
      course_code: session.class?.course_code,
      course_name: session.class?.course_name,
      room_number: session.class?.room_number,
      session_date: session.session_date,
      start_time: session.start_time,
      end_time: session.end_time,
      status: session.status,
      pin_code: session.pin_code,
      total_students: students.length,
      counts,
      students
    };
  }
}
