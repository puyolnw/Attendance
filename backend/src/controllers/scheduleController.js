import { Schedule, Class, Enrollment, Teacher, User } from '../models/index.js';
import { CURRENT_TERM } from '../config/currentTerm.js';

const hhmm = (t) => (t ? String(t).slice(0, 5) : '');

const mapSchedule = (sc, cls) => ({
  id: sc.id,
  class_id: cls.id,
  course_code: cls.course_code,
  course_name: cls.course_name,
  room: sc.location || cls.room_number || '',
  day_of_week: sc.day_of_week,
  start_time: hhmm(sc.start_time),
  end_time: hhmm(sc.end_time),
});

// GET /schedules/my — weekly timetable for the logged-in user.
// teacher → classes they teach; student → classes they are actively enrolled in.
export const getMySchedule = async (req, res, next) => {
  try {
    const role = req.user.role;
    let classes = [];

    // Filter by term. Use query params when provided (term selector),
    // otherwise fall back to the configured current term.
    const { semester, academic_year } = req.query;
    const termWhere = semester && academic_year
      ? { semester, academic_year }
      : {
          semester: CURRENT_TERM.semester,
          academic_year: CURRENT_TERM.academic_year,
        };

    if (role === 'teacher') {
      classes = await Class.findAll({
        where: { teacher_id: req.user.sub, ...termWhere },
        include: [{ model: Schedule, as: 'schedules' }],
      });
    } else {
      const enrollments = await Enrollment.findAll({
        where: { student_id: req.user.sub, status: 'active' },
        include: [{
          model: Class,
          as: 'class',
          where: termWhere,
          include: [{ model: Schedule, as: 'schedules' }],
        }],
      });
      classes = enrollments.map((e) => e.class).filter(Boolean);
    }

    const items = [];
    for (const cls of classes) {
      for (const sc of cls.schedules || []) {
        items.push(mapSchedule(sc, cls));
      }
    }
    // sort by day then start time
    items.sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time));

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
