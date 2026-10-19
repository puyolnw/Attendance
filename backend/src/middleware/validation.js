import Joi from 'joi';

const scheduleItemSchema = Joi.object({
  day_of_week: Joi.number().integer().min(0).max(6).required(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  location: Joi.string().optional().allow('').max(50)
});

export const createClassSchema = Joi.object({
  course_code: Joi.string().required().min(2).max(20),
  course_name: Joi.string().required().min(3).max(100),
  room_number: Joi.string().optional().allow('').max(50),
  description: Joi.string().optional().allow('').max(500),
  semester: Joi.number().valid(1, 2, 3).required(),
  academic_year: Joi.number().integer().min(2500).max(2600).required(),
  schedules: Joi.array().items(scheduleItemSchema).optional()
});

export const updateClassSchema = Joi.object({
  course_code: Joi.string().optional().min(2).max(20),
  course_name: Joi.string().optional().min(3).max(100),
  room_number: Joi.string().optional().allow('').max(50),
  description: Joi.string().optional().allow('').max(500),
  semester: Joi.number().valid(1, 2, 3).optional(),
  academic_year: Joi.number().integer().min(2500).max(2600).optional(),
  schedules: Joi.array().items(scheduleItemSchema).optional()
}).min(1);

export const enrollSchema = Joi.object({
  class_id: Joi.string().uuid().required()
});

export const addStudentSchema = Joi.object({
  student_id: Joi.string().uuid().required()
});

export const createSessionSchema = Joi.object({
  class_id: Joi.string().uuid().required(),
  session_date: Joi.date().required(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  grace_period_minutes: Joi.number().optional().default(15)
});

export const checkInSchema = Joi.object({
  session_id: Joi.string().uuid().required(),
  check_in_method: Joi.string().valid('qr', 'pin', 'manual').required(),
  pin_code: Joi.string().when('check_in_method', { is: 'pin', then: Joi.string().required() }),
  qr_data: Joi.string().when('check_in_method', { is: 'qr', then: Joi.string().required() })
});

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }
    req.validated = value;
    next();
  };
};
