import { Attendance, Session, Student, User } from '../models/index.js';
import { AttendanceService } from '../services/AttendanceService.js';
import { QRService } from '../services/QRService.js';

export const checkInByQR = async (req, res, next) => {
  try {
    const { qr_data } = req.body;

    if (!qr_data) {
      return res.status(400).json({ success: false, error: 'กรุณาสแกน QR code' });
    }

    // Decode QR payload — contains the real session_id
    let qrPayload;
    try {
      qrPayload = await QRService.verifyQRData(qr_data);
    } catch (error) {
      return res.status(400).json({ success: false, error: 'QR code ไม่ถูกต้อง' });
    }

    const sessionId = qrPayload.session_id;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'QR code ไม่ถูกต้อง' });
    }

    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'ไม่พบคาบเรียนของ QR code นี้' });
    }

    const attendance = await AttendanceService.recordCheckIn(
      sessionId,
      req.user.sub,
      'qr',
      req.ip
    );

    res.status(201).json({
      success: true,
      data: {
        id: attendance.id,
        session_id: sessionId,
        class_id: session.class_id,
        status: attendance.status,
        check_in_time: attendance.check_in_time
      }
    });
  } catch (error) {
    if (error.message.includes('not active') || error.message.includes('not enrolled') || error.message.includes('Already')) {
      return res.status(400).json({ success: false, error: translateCheckInError(error.message) });
    }
    next(error);
  }
};

export const checkInByPIN = async (req, res, next) => {
  try {
    const { pin_code } = req.body;

    if (!pin_code) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกรหัส PIN' });
    }

    if (!/^\d{6}$/.test(pin_code)) {
      return res.status(400).json({ success: false, error: 'รหัส PIN ต้องเป็นตัวเลข 6 หลัก' });
    }

    // Find the active session that owns this PIN (no session_id needed from client)
    const session = await AttendanceService.findActiveSessionByPin(pin_code);
    if (!session) {
      return res.status(404).json({ success: false, error: 'ไม่พบคาบเรียนที่ใช้รหัส PIN นี้ หรือคาบเรียนปิดแล้ว' });
    }

    const attendance = await AttendanceService.recordCheckIn(
      session.id,
      req.user.sub,
      'pin',
      req.ip
    );

    res.status(201).json({
      success: true,
      data: {
        id: attendance.id,
        session_id: session.id,
        class_id: session.class_id,
        status: attendance.status,
        check_in_time: attendance.check_in_time
      }
    });
  } catch (error) {
    if (error.message.includes('not active') || error.message.includes('not enrolled') || error.message.includes('Already')) {
      return res.status(400).json({ success: false, error: translateCheckInError(error.message) });
    }
    next(error);
  }
};

// Translate service errors → friendly Thai messages
const translateCheckInError = (msg) => {
  if (msg.includes('not enrolled')) return 'คุณไม่ได้ลงทะเบียนในคลาสเรียนนี้';
  if (msg.includes('not active')) return 'คาบเรียนนี้ปิดแล้ว';
  if (msg.includes('Already')) return 'คุณเช็คชื่อคาบเรียนนี้ไปแล้ว';
  return msg;
};

export const getMyClassHistory = async (req, res, next) => {
  try {
    const data = await AttendanceService.getStudentClassHistory(req.user.sub, req.params.classId);
    res.json({ success: true, data });
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ success: false, error: error.message });
    }
    next(error);
  }
};

export const getMyHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await AttendanceService.getStudentHistory(
      req.user.sub,
      limit,
      offset
    );

    const hhmm = (t) => (t ? String(t).slice(0, 5) : '');
    res.json({
      success: true,
      data: rows.map(a => ({
        id: a.id,
        session_id: a.session?.id,
        class_id: a.session?.class?.id,
        class_name: a.session?.class?.course_name || '—',
        class_code: a.session?.class?.course_code || '—',
        session_date: a.session?.session_date,
        session_time: a.session
          ? `${hhmm(a.session.start_time)}-${hhmm(a.session.end_time)}`
          : '',
        check_in_time: a.check_in_time,
        status: a.status,
        check_in_method: a.check_in_method
      })),
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};

export const getClassAttendance = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const { count, rows } = await Attendance.findAndCountAll({
      include: [
        { model: Session, as: 'session', where: { class_id: req.params.classId } },
        { model: Student, as: 'student', include: [{ model: User, as: 'user', attributes: ['full_name'] }] }
      ],
      attributes: ['id', 'student_id', 'check_in_time', 'status', 'check_in_method'],
      limit,
      offset,
      order: [['check_in_time', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) }
    });
  } catch (error) {
    next(error);
  }
};
