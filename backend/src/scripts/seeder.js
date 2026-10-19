import sequelize from '../config/database.js';
import { User, Teacher, Student, Class, Schedule, Enrollment, Session, Attendance } from '../models/index.js';
import { hashPassword } from '../config/auth.js';
import { QRService } from '../services/QRService.js';

/* ---------------------------------------------------------------------------
 * Thai seed data — full, all columns populated, realistically linked.
 * Credentials: teacherN@school.ac.th / studentN@school.ac.th, password: 123456
 * ------------------------------------------------------------------------- */

const TEACHERS = [
  { email: 'teacher1@school.ac.th', full_name: 'อาจารย์สมชาย ใจดี' },
  { email: 'teacher2@school.ac.th', full_name: 'อาจารย์สุนิสา รักเรียน' },
  { email: 'teacher3@school.ac.th', full_name: 'ผศ.ดร.วิชัย พัฒนกิจ' },
  { email: 'teacher4@school.ac.th', full_name: 'อาจารย์กมลวรรณ ศรีสุข' },
];

const STUDENT_NAMES = [
  'ณัฐพงศ์ ทองมี', 'ศิริพร แสงทอง', 'ธนวัฒน์ บุญมา', 'พิมพ์ชนก วงศ์ไทย',
  'กิตติศักดิ์ เจริญสุข', 'อารยา ประเสริฐ', 'ภาณุพงศ์ สุขสันต์', 'ชนัญชิดา คำแก้ว',
  'ปิยะพงษ์ มั่นคง', 'วรรณวิสา ดวงแก้ว', 'อนุชา รุ่งเรือง', 'ณิชา พรหมมา',
  'ธีรภัทร ชัยชนะ', 'สุชานันท์ ทิพย์มณี', 'จิรายุ ศักดิ์ศรี', 'เบญจวรรณ ปัญญาดี',
  'พชร วัฒนกุล', 'กัญญารัตน์ แซ่ลิ้ม', 'นราธิป สินสมบัติ', 'มนัสนันท์ อุดมทรัพย์',
  'ศุภกร บุญเรือง', 'ธัญชนก เกิดผล', 'วีรภัทร คงทน', 'อภิสรา นวลจันทร์',
];

// day_of_week: 0=อาทิตย์ .. 6=เสาร์
const CLASSES = [
  { t: 0, code: 'CS101',   name: 'พื้นฐานการเขียนโปรแกรม',       room: 'อาคาร 1 ห้อง 101', desc: 'แนวคิดพื้นฐานการเขียนโปรแกรมและวิทยาการคอมพิวเตอร์', days: [1, 3], start: '09:00', end: '10:30' },
  { t: 0, code: 'CS201',   name: 'โครงสร้างข้อมูลและอัลกอริทึม', room: 'อาคาร 1 ห้อง 202', desc: 'โครงสร้างข้อมูลและการออกแบบอัลกอริทึมขั้นสูง',       days: [2, 4], start: '13:00', end: '14:30' },
  { t: 1, code: 'MATH101', name: 'แคลคูลัส 1',                   room: 'อาคาร 2 ห้อง 101', desc: 'แคลคูลัสเชิงอนุพันธ์เบื้องต้น',                     days: [1, 4], start: '10:45', end: '12:15' },
  { t: 1, code: 'MATH202', name: 'พีชคณิตเชิงเส้น',              room: 'อาคาร 2 ห้อง 205', desc: 'เมทริกซ์ เวกเตอร์ และการแปลงเชิงเส้น',              days: [3],    start: '09:00', end: '12:00' },
  { t: 2, code: 'ENG105',  name: 'ภาษาอังกฤษเพื่อการสื่อสาร',    room: 'อาคาร 3 ห้อง 301', desc: 'ทักษะการฟัง พูด อ่าน เขียนภาษาอังกฤษ',              days: [2, 5], start: '13:00', end: '14:30' },
  { t: 2, code: 'PHY101',  name: 'ฟิสิกส์ทั่วไป',               room: 'อาคาร 2 ห้อง 110', desc: 'กลศาสตร์ ความร้อน และคลื่น',                        days: [1, 3], start: '14:45', end: '16:15' },
  { t: 3, code: 'BUS210',  name: 'หลักการตลาด',                 room: 'อาคาร 4 ห้อง 402', desc: 'แนวคิดและกลยุทธ์การตลาดสมัยใหม่',                    days: [4],    start: '09:00', end: '12:00' },
  { t: 3, code: 'ART150',  name: 'ประวัติศาสตร์ศิลป์',          room: 'อาคาร 5 ห้อง 501', desc: 'พัฒนาการของศิลปะตะวันตกและตะวันออก',                days: [5],    start: '13:00', end: '16:00' },
];

const STATUSES = ['present', 'present', 'present', 'late', 'absent', 'leave', 'sick'];
const pad = (n) => String(n).padStart(2, '0');

export async function seedDatabase() {
  console.log('เริ่มเพิ่มข้อมูลตัวอย่าง (ภาษาไทย)...');
  const pw = await hashPassword('123456');

  // ---- Admin ----
  let admin = await User.findOne({ where: { email: 'admin@school.ac.th' } });
  if (!admin) {
    admin = await User.create({ email: 'admin@school.ac.th', password_hash: pw, full_name: 'ผู้ดูแลระบบ', role: 'admin', is_active: true });
    console.log('+ ผู้ดูแลระบบ: admin@school.ac.th');
  }

  // ---- Teachers (users.is_active = true) ----
  const teacherIds = [];
  for (const t of TEACHERS) {
    let user = await User.findOne({ where: { email: t.email } });
    if (!user) {
      user = await User.create({ email: t.email, password_hash: pw, full_name: t.full_name, role: 'teacher', is_active: true });
      await Teacher.create({ id: user.id });
      console.log(`+ อาจารย์: ${t.full_name}`);
    }
    teacherIds.push(user.id);
  }

  // ---- Students (student_id_number + is_active) ----
  const studentIds = [];
  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const email = `student${i + 1}@school.ac.th`;
    let user = await User.findOne({ where: { email } });
    if (!user) {
      // one inactive account to exercise the "ปิดใช้งาน" state in admin UI
      const active = i !== STUDENT_NAMES.length - 1;
      user = await User.create({ email, password_hash: pw, full_name: STUDENT_NAMES[i], role: 'student', is_active: active });
      await Student.create({ id: user.id, student_id_number: `66${pad(i + 1)}0${pad(i + 1)}` });
      console.log(`+ นักเรียน: ${STUDENT_NAMES[i]}`);
    }
    studentIds.push(user.id);
  }

  // ---- Classes across 3 terms (x3 the base list) ----
  // Each base course is offered in several term/year combos → distinct classes.
  // 2/2568 = current active term; 1/2568 = previous (read-only history)
  const TERMS = [
    { semester: 2, academic_year: 2568 },
    { semester: 1, academic_year: 2568 },
  ];
  const classRows = [];
  for (let ti = 0; ti < TERMS.length; ti++) {
    const term = TERMS[ti];
    for (const c of CLASSES) {
      // same course_code can repeat across terms (a term is a distinct offering)
      let cls = await Class.findOne({
        where: { course_code: c.code, semester: term.semester, academic_year: term.academic_year },
      });
      if (!cls) {
        cls = await Class.create({
          teacher_id: teacherIds[c.t],
          course_code: c.code,
          course_name: c.name,
          room_number: c.room,
          description: c.desc,
          semester: term.semester,
          academic_year: term.academic_year,
        });
      }
      classRows.push({ id: cls.id, teacher_id: teacherIds[c.t], def: c, term });
    }
    console.log(`+ วิชาภาค ${term.semester}/${term.academic_year} (${CLASSES.length} วิชา)`);
  }

  // ---- Schedules (was completely missing before) ----
  for (const cr of classRows) {
    for (const day of cr.def.days) {
      const existing = await Schedule.findOne({ where: { class_id: cr.id, day_of_week: day } });
      if (!existing) {
        await Schedule.create({
          class_id: cr.id,
          day_of_week: day,
          start_time: cr.def.start,
          end_time: cr.def.end,
          location: cr.def.room,
        });
      }
    }
  }
  console.log('+ สร้างตารางเรียน (schedules) ครบทุกวิชา');

  // ---- Enrollments (varied status: mostly active, a few withdrawn/completed) ----
  for (let ci = 0; ci < classRows.length; ci++) {
    const count = 8 + (ci % 4) * 2; // 8,10,12,14
    const start = (ci * 3) % studentIds.length;
    for (let k = 0; k < count; k++) {
      const sid = studentIds[(start + k) % studentIds.length];
      const existing = await Enrollment.findOne({ where: { class_id: classRows[ci].id, student_id: sid } });
      if (!existing) {
        // last student of each class = withdrawn, 2nd-last = completed, rest active
        let status = 'active';
        if (k === count - 1) status = 'withdrawn';
        else if (k === count - 2) status = 'completed';
        await Enrollment.create({ class_id: classRows[ci].id, student_id: sid, status });
      }
    }
  }
  console.log('+ ลงทะเบียนเรียน (active/withdrawn/completed)');

  // ---- Sessions (all columns incl qr_code + pin_code) + Attendance ----
  const now = new Date();
  for (const cr of classRows) {
    for (let d = 1; d <= 6; d++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
      const sessionDate = `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;

      const existing = await Session.findOne({ where: { class_id: cr.id, session_date: sessionDate } });
      if (existing) continue;

      const pin = String(100000 + ((d * 37 + 11) % 900000));
      const session = await Session.create({
        class_id: cr.id,
        session_date: sessionDate,
        start_time: cr.def.start,
        end_time: cr.def.end,
        status: 'closed',
        created_by: cr.teacher_id,
        grace_period_minutes: 15,
        pin_code: pin,
      });
      // qr_code encodes the real session id (matches check-in flow)
      const qr = await QRService.generateQR(session.id, pin);
      await session.update({ qr_code: qr });

      // attendance only for ACTIVE enrollments
      const enrolled = await Enrollment.findAll({ where: { class_id: cr.id, status: 'active' } });
      const [sh, sm] = cr.def.start.split(':').map(Number);
      for (let ei = 0; ei < enrolled.length; ei++) {
        const status = STATUSES[(ei + d) % STATUSES.length];
        const checkInTime = new Date(day);
        checkInTime.setHours(sh, sm + (ei % 25), Math.floor(Math.random() * 60));
        await Attendance.create({
          session_id: session.id,
          student_id: enrolled[ei].student_id,
          check_in_time: checkInTime,
          check_in_method: status === 'leave' || status === 'sick' ? 'manual' : (ei % 2 === 0 ? 'qr' : 'pin'),
          status,
          ip_address: '10.0.' + (d) + '.' + (ei + 1),
        });
      }
    }
    console.log(`+ คาบเรียน + เช็คชื่อ: ${cr.def.code}`);
  }

  console.log('\nเพิ่มข้อมูลตัวอย่างเสร็จสมบูรณ์!');
  console.log('บัญชีทดสอบ (รหัสผ่านทั้งหมด: 123456)');
  console.log('  อาจารย์: teacher1@school.ac.th ถึง teacher4@school.ac.th');
  console.log('  นักเรียน: student1@school.ac.th ถึง student24@school.ac.th');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ alter: true });
      await seedDatabase();
      process.exit(0);
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  })();
}

export default seedDatabase;
