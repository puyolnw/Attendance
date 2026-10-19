import { Class, Session, Attendance, Student, User, Enrollment, Teacher } from '../models/index.js';
import { Op } from 'sequelize';

export class ReportService {
  static async getClassAttendanceReport(classId, startDate, endDate) {
    const classData = await Class.findByPk(classId, {
      include: [{
        model: Teacher,
        as: 'teacher',
        include: [{ model: User, as: 'user', attributes: ['full_name'] }]
      }]
    });
    if (!classData) {
      throw new Error('Class not found');
    }

    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    const sessions = await Session.findAll({
      where: {
        class_id: classId,
        ...(Object.keys(dateFilter).length > 0 && { session_date: dateFilter })
      },
      include: [{
        model: Attendance,
        as: 'attendances',
        separate: true
      }],
      order: [['session_date', 'DESC']]
    });

    const stats = this.calculateStats(sessions);

    return {
      class_id: classId,
      course_code: classData.course_code,
      course_name: classData.course_name,
      teacher_name: classData.teacher?.user?.full_name || 'Unknown',
      period: {
        start_date: startDate || null,
        end_date: endDate || null
      },
      stats,
      sessions: sessions.map(s => ({
        session_id: s.id,
        date: s.session_date,
        start_time: s.start_time,
        end_time: s.end_time,
        total_attendance: s.attendances?.length || 0
      }))
    };
  }

  static async generateCSV(classId, startDate, endDate) {
    const report = await this.getClassAttendanceReport(classId, startDate, endDate);
    const classData = report;

    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    const sessions = await Session.findAll({
      where: {
        class_id: classId,
        ...(Object.keys(dateFilter).length > 0 && { session_date: dateFilter })
      },
      order: [['session_date', 'ASC']]
    });

    const enrollments = await Enrollment.findAll({
      where: { class_id: classId, status: 'active' },
      include: [{
        model: Student,
        as: 'student',
        include: [{
          model: User,
          as: 'user'
        }]
      }]
    });

    const rows = [];
    rows.push(['Class Attendance Report']);
    rows.push([`Course: ${classData.course_name} (${classData.course_code})`]);
    rows.push([`Teacher: ${classData.teacher_name}`]);
    rows.push([`Generated: ${new Date().toLocaleString()}`]);
    rows.push([]);

    const sessionDates = sessions.map(s => s.session_date);
    const headers = ['Student Name', 'Student ID', ...sessionDates];
    rows.push(headers);

    for (const enrollment of enrollments) {
      const row = [
        enrollment.student.user.full_name,
        enrollment.student.student_id_number
      ];

      for (const session of sessions) {
        const attendance = await Attendance.findOne({
          where: {
            session_id: session.id,
            student_id: enrollment.student_id
          }
        });

        const codeMap = { present: 'P', late: 'L', absent: 'A', leave: 'V', sick: 'S' };
        row.push(attendance ? (codeMap[attendance.status] || 'A') : 'A');
      }

      rows.push(row);
    }

    rows.push([]);
    rows.push(['Legend: P=Present, L=Late, A=Absent, V=Leave, S=Sick']);

    let csvContent = '';
    for (const row of rows) {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    }

    return csvContent;
  }

  static async getAttendanceMatrix(classId) {
    const classData = await Class.findByPk(classId, {
      include: [{
        model: Teacher,
        as: 'teacher',
        include: [{ model: User, as: 'user', attributes: ['full_name'] }]
      }]
    });
    if (!classData) {
      throw new Error('Class not found');
    }

    const sessions = await Session.findAll({
      where: { class_id: classId },
      order: [['session_date', 'ASC'], ['start_time', 'ASC']]
    });

    const enrollments = await Enrollment.findAll({
      where: { class_id: classId, status: 'active' },
      include: [{
        model: Student,
        as: 'student',
        include: [{ model: User, as: 'user', attributes: ['full_name'] }]
      }]
    });

    const attendances = await Attendance.findAll({
      include: [{
        model: Session,
        as: 'session',
        where: { class_id: classId },
        attributes: []
      }]
    });

    // Lookup: `${session_id}_${student_id}` → status
    const statusMap = new Map();
    for (const a of attendances) {
      statusMap.set(`${a.session_id}_${a.student_id}`, a.status);
    }

    const totalSessions = sessions.length;

    const students = enrollments.map((enr) => {
      const cells = {};
      const counts = { present: 0, late: 0, absent: 0, leave: 0, sick: 0 };

      for (const s of sessions) {
        const status = statusMap.get(`${s.id}_${enr.student_id}`) || 'absent';
        cells[s.id] = status;
        if (counts[status] !== undefined) counts[status]++;
      }

      const present_rate = totalSessions > 0
        ? parseFloat(((counts.present + counts.late) / totalSessions * 100).toFixed(1))
        : 0;

      return {
        student_id: enr.student_id,
        student_id_number: enr.student?.student_id_number || '—',
        full_name: enr.student?.user?.full_name || 'Unknown',
        cells,
        summary: {
          present: counts.present,
          late: counts.late,
          absent: counts.absent,
          leave: counts.leave,
          sick: counts.sick,
          total: totalSessions,
          present_rate
        }
      };
    });

    return {
      class_id: classId,
      course_code: classData.course_code,
      course_name: classData.course_name,
      teacher_name: classData.teacher?.user?.full_name || 'Unknown',
      sessions: sessions.map((s) => ({
        session_id: s.id,
        date: s.session_date,
        start_time: s.start_time,
        end_time: s.end_time
      })),
      students
    };
  }

  static calculateStats(sessions) {
    let totalSessions = 0;
    const counts = { present: 0, late: 0, absent: 0, leave: 0, sick: 0 };

    for (const session of sessions) {
      totalSessions++;
      const records = session.attendances;
      if (Array.isArray(records)) {
        for (const attendance of records) {
          if (counts[attendance.status] !== undefined) counts[attendance.status]++;
        }
      }
    }

    const total = counts.present + counts.late + counts.absent + counts.leave + counts.sick;
    const rate = (n) => (total > 0 ? parseFloat((n / total * 100).toFixed(2)) : 0);

    return {
      total_sessions: totalSessions,
      total_attendance_records: total,
      ...counts,
      present_rate: rate(counts.present),
      late_rate: rate(counts.late),
      absent_rate: rate(counts.absent),
      leave_rate: rate(counts.leave),
      sick_rate: rate(counts.sick)
    };
  }
}
