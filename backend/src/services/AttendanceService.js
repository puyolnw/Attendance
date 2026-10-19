import { Attendance, Enrollment, Session, Class } from '../models/index.js';
import { SessionService } from './SessionService.js';

// Build a local Date from a DATEONLY string ("YYYY-MM-DD") and a TIME string ("HH:MM[:SS]").
export const buildDateTime = (dateOnly, time) => {
  const [y, m, d] = String(dateOnly).split('-').map(Number);
  const [hh, mm, ss] = String(time).split(':').map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0, ss || 0);
};

export class AttendanceService {
  // Validate student is enrolled in class
  static async isStudentEnrolled(studentId, classId) {
    return await Enrollment.findOne({
      where: { student_id: studentId, class_id: classId, status: 'active' }
    });
  }

  // Record attendance check-in
  static async recordCheckIn(sessionId, studentId, checkInMethod, ipAddress = null) {
    // Verify session is active (auto-close first if past end_time + buffer)
    const session = await Session.findByPk(sessionId);
    if (session) await SessionService.autoCloseIfExpired(session);
    if (!session || session.status !== 'active') {
      throw new Error('Session is not active');
    }

    // Verify student enrolled
    const enrollment = await this.isStudentEnrolled(studentId, session.class_id);
    if (!enrollment) {
      throw new Error('Student not enrolled in this class');
    }

    // Check no duplicate check-in
    const existing = await Attendance.findOne({
      where: { session_id: sessionId, student_id: studentId }
    });
    if (existing) {
      throw new Error('Already checked in for this session');
    }

    // Calculate status. Build start datetime from DATEONLY + TIME parts (local tz).
    const sessionStartTime = buildDateTime(session.session_date, session.start_time);
    const checkInTime = new Date();
    const status = SessionService.getAttendanceStatus(
      checkInTime,
      sessionStartTime,
      session.grace_period_minutes
    );

    // Record attendance
    const attendance = await Attendance.create({
      session_id: sessionId,
      student_id: studentId,
      check_in_time: checkInTime,
      check_in_method: checkInMethod,
      status,
      ip_address: ipAddress
    });

    return attendance;
  }

  // Get student attendance history
  static async getStudentHistory(studentId, limit = 50, offset = 0) {
    return await Attendance.findAndCountAll({
      where: { student_id: studentId },
      include: [{ model: Session, as: 'session', include: ['class'] }],
      limit,
      offset,
      order: [['check_in_time', 'DESC']]
    });
  }

  // One student's attendance across every session of a class (per-session detail).
  // Sessions with no attendance row for this student are reported as 'absent'.
  static async getStudentClassHistory(studentId, classId) {
    const cls = await Class.findByPk(classId, {
      attributes: ['id', 'course_code', 'course_name', 'room_number', 'semester', 'academic_year']
    });
    if (!cls) {
      const err = new Error('Class not found');
      err.status = 404;
      throw err;
    }

    const sessions = await Session.findAll({
      where: { class_id: classId },
      order: [['session_date', 'DESC'], ['start_time', 'DESC']]
    });

    const attendances = await Attendance.findAll({
      where: { student_id: studentId },
      include: [{ model: Session, as: 'session', where: { class_id: classId }, attributes: [] }]
    });
    const attMap = new Map(attendances.map((a) => [a.session_id, a]));

    const counts = { present: 0, late: 0, absent: 0, leave: 0, sick: 0 };
    const records = sessions.map((s) => {
      const a = attMap.get(s.id);
      const status = a?.status || (s.status === 'closed' ? 'absent' : null);
      if (status && counts[status] !== undefined) counts[status]++;
      return {
        session_id: s.id,
        session_date: s.session_date,
        start_time: s.start_time,
        end_time: s.end_time,
        session_status: s.status,
        status, // null = คาบยังไม่ปิด และยังไม่เช็คชื่อ
        check_in_time: a?.check_in_time || null,
        method: a?.check_in_method || null
      };
    });

    const attended = counts.present + counts.late;
    const gradedTotal = counts.present + counts.late + counts.absent + counts.leave + counts.sick;
    return {
      class_id: cls.id,
      course_code: cls.course_code,
      course_name: cls.course_name,
      room_number: cls.room_number,
      term_label: `${cls.semester}/${cls.academic_year}`,
      total_sessions: sessions.length,
      counts,
      present_rate: gradedTotal > 0 ? parseFloat(((attended / gradedTotal) * 100).toFixed(1)) : 0,
      records
    };
  }

  // Manual mark attendance (teacher)
  static async manualMark(sessionId, studentId, status) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new Error('Session not found');

    const existing = await Attendance.findOne({
      where: { session_id: sessionId, student_id: studentId }
    });

    if (existing) {
      return await existing.update({ status, check_in_method: 'manual' });
    }

    return await Attendance.create({
      session_id: sessionId,
      student_id: studentId,
      check_in_time: new Date(),
      check_in_method: 'manual',
      status
    });
  }

  // Find the single active session matching a PIN (PINs are unique among active sessions)
  static async findActiveSessionByPin(pin) {
    return await Session.findOne({
      where: { pin_code: pin, status: 'active' }
    });
  }

  // Mark all enrolled students who have NOT checked in as absent (used on session close)
  static async markAbsentees(sessionId) {
    const session = await Session.findByPk(sessionId);
    if (!session) throw new Error('Session not found');

    const enrollments = await Enrollment.findAll({
      where: { class_id: session.class_id, status: 'active' }
    });

    const marked = await Attendance.findAll({
      where: { session_id: sessionId },
      attributes: ['student_id']
    });
    const checkedIn = new Set(marked.map((a) => a.student_id));

    const toCreate = enrollments
      .filter((e) => !checkedIn.has(e.student_id))
      .map((e) => ({
        session_id: sessionId,
        student_id: e.student_id,
        check_in_time: new Date(),
        check_in_method: 'manual',
        status: 'absent'
      }));

    if (toCreate.length > 0) {
      await Attendance.bulkCreate(toCreate);
    }
    return toCreate.length;
  }
}
