import { Session, Attendance, Class } from '../models/index.js';
import { SessionService } from '../services/SessionService.js';
import { QRService } from '../services/QRService.js';
import { isCurrentTerm } from '../config/currentTerm.js';

export const createSession = async (req, res, next) => {
  try {
    const { class_id, session_date, start_time, end_time, grace_period_minutes } = req.body;

    if (!class_id || !session_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Validate time ordering (HH:MM strings compare lexicographically for same day)
    if (start_time >= end_time) {
      return res.status(400).json({ success: false, error: 'End time must be after start time' });
    }

    // Ownership: teacher must own the class
    const cls = await Class.findByPk(class_id);
    if (!cls) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }
    if (cls.teacher_id !== req.user.sub) {
      return res.status(403).json({ success: false, error: 'Not authorized for this class' });
    }

    // Block sessions for past terms (read-only history)
    if (!isCurrentTerm(cls.semester, cls.academic_year)) {
      return res.status(403).json({ success: false, error: 'ภาคเรียนนี้สิ้นสุดแล้ว ไม่สามารถเปิดคาบเช็คชื่อได้' });
    }

    // Enforce single active session per class
    const existingActive = await Session.findOne({
      where: { class_id, status: 'active' }
    });
    if (existingActive) {
      return res.status(409).json({
        success: false,
        error: 'This class already has an active session',
        data: { id: existingActive.id }
      });
    }

    // Create session FIRST, then generate QR with the real session id
    const session = await SessionService.createSession(
      class_id,
      session_date,
      start_time,
      end_time,
      req.user.sub,
      grace_period_minutes ?? 15
    );

    const pin = QRService.generatePIN();
    const qrImage = await QRService.generateQR(session.id, pin);
    await session.update({ qr_code: qrImage, pin_code: pin });

    res.status(201).json({
      success: true,
      data: {
        id: session.id,
        class_id: session.class_id,
        session_date: session.session_date,
        start_time: session.start_time,
        end_time: session.end_time,
        status: session.status,
        pin_code: session.pin_code,
        qr_code: qrImage,
        grace_period_minutes: session.grace_period_minutes
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const session = await SessionService.getSession(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({
      success: true,
      data: {
        id: session.id,
        class_id: session.class_id,
        session_date: session.session_date,
        start_time: session.start_time,
        end_time: session.end_time,
        status: session.status,
        pin_code: session.pin_code,
        grace_period_minutes: session.grace_period_minutes
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getQRCode = async (req, res, next) => {
  try {
    const session = await Session.findByPk(req.params.id);

    if (!session || !session.qr_code) {
      return res.status(404).json({ success: false, error: 'QR code not available' });
    }

    res.json({ success: true, data: { qr_code: session.qr_code } });
  } catch (error) {
    next(error);
  }
};

export const updateSessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['scheduled', 'active', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const [, [session]] = await SessionService.updateSessionStatus(req.params.id, status);

    // When closing, mark all not-checked-in enrolled students as absent
    let absentCount = 0;
    if (status === 'closed') {
      const { AttendanceService } = await import('../services/AttendanceService.js');
      absentCount = await AttendanceService.markAbsentees(req.params.id);
    }

    res.json({
      success: true,
      data: { id: session.id, status: session.status, absent_marked: absentCount }
    });
  } catch (error) {
    next(error);
  }
};

// Quick-start: begin an attendance session NOW for a class (default 1-hour window).
// Reuses createSession logic (ownership, single-active guard, QR+PIN).
export const quickStartSession = async (req, res, next) => {
  try {
    const { class_id } = req.body;
    if (!class_id) {
      return res.status(400).json({ success: false, error: 'กรุณาระบุคลาสเรียน' });
    }

    const cls = await Class.findByPk(class_id);
    if (!cls) return res.status(404).json({ success: false, error: 'ไม่พบคลาสเรียน' });
    if (cls.teacher_id !== req.user.sub) {
      return res.status(403).json({ success: false, error: 'ไม่มีสิทธิ์ในคลาสเรียนนี้' });
    }
    if (!isCurrentTerm(cls.semester, cls.academic_year)) {
      return res.status(403).json({ success: false, error: 'ภาคเรียนนี้สิ้นสุดแล้ว ไม่สามารถเปิดคาบเช็คชื่อได้' });
    }

    const existingActive = await Session.findOne({ where: { class_id, status: 'active' } });
    if (existingActive) {
      return res.status(409).json({
        success: false,
        error: 'คลาสเรียนนี้มีคาบที่กำลังดำเนินอยู่แล้ว',
        data: { id: existingActive.id }
      });
    }

    // default: now → now + 1h, in local time
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const sessionDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const startTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const end = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

    const session = await SessionService.createSession(
      class_id, sessionDate, startTime, endTime, req.user.sub, 15
    );
    const pin = QRService.generatePIN();
    const qrImage = await QRService.generateQR(session.id, pin);
    await session.update({ qr_code: qrImage, pin_code: pin });

    res.status(201).json({
      success: true,
      data: {
        id: session.id,
        class_id: session.class_id,
        session_date: session.session_date,
        start_time: session.start_time,
        end_time: session.end_time,
        status: session.status,
        pin_code: session.pin_code,
        qr_code: qrImage,
        grace_period_minutes: session.grace_period_minutes
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get the active session for a class (or null). Used by students to check in quickly.
export const getActiveSession = async (req, res, next) => {
  try {
    let session = await Session.findOne({
      where: { class_id: req.params.id, status: 'active' }
    });
    if (session) {
      const closed = await SessionService.autoCloseIfExpired(session);
      if (closed) session = null;
    }
    res.json({
      success: true,
      data: session
        ? {
            id: session.id,
            class_id: session.class_id,
            session_date: session.session_date,
            start_time: session.start_time,
            end_time: session.end_time,
            status: session.status,
            pin_code: session.pin_code,
            qr_code: session.qr_code,
            grace_period_minutes: session.grace_period_minutes
          }
        : null
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionSummary = async (req, res, next) => {
  try {
    const summary = await SessionService.getSessionSummary(req.params.id);
    res.json({ success: true, data: summary });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ success: false, error: error.message });
    }
    next(error);
  }
};

export const getSessionAttendance = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await SessionService.getSessionAttendance(
      req.params.id,
      limit,
      offset
    );

    res.json({
      success: true,
      data: rows.map(a => ({
        id: a.id,
        student_id: a.student_id,
        student_name: a.student.User?.full_name,
        check_in_time: a.check_in_time,
        method: a.check_in_method,
        status: a.status
      })),
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};

export const listClassSessions = async (req, res, next) => {
  try {
    const sessions = await SessionService.listClassSessions(req.params.id);
    res.json({
      success: true,
      data: sessions.map(s => ({
        id: s.id,
        class_id: s.class_id,
        session_date: s.session_date,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status,
        grace_period_minutes: s.grace_period_minutes,
        attendance_count: parseInt(s.get('attendance_count')) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const listTeacherSessions = async (req, res, next) => {
  try {
    const { semester, academic_year } = req.query;
    const filter = semester && academic_year ? { semester, academic_year } : {};
    const sessions = await SessionService.listTeacherSessions(req.user.sub, filter);
    res.json({
      success: true,
      data: sessions.map(s => ({
        id: s.id,
        class_id: s.class_id,
        class_code: s.class?.course_code,
        class_name: s.class?.course_name,
        session_date: s.session_date,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status,
        attendance_count: parseInt(s.get('attendance_count')) || 0
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const manualMark = async (req, res, next) => {
  try {
    const { student_id, status } = req.body;

    if (!student_id || !status) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const validStatuses = ['present', 'late', 'absent', 'leave', 'sick'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid attendance status' });
    }

    const { AttendanceService } = await import('../services/AttendanceService.js');
    const attendance = await AttendanceService.manualMark(req.params.id, student_id, status);

    res.json({
      success: true,
      data: { id: attendance.id, status: attendance.status }
    });
  } catch (error) {
    next(error);
  }
};
