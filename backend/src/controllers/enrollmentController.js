import { EnrollmentService } from '../services/EnrollmentService.js';
import { enrollSchema } from '../middleware/validation.js';

export const enrollStudent = async (req, res, next) => {
  try {
    const { error, value } = enrollSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const enrollment = await EnrollmentService.enrollStudent(
      req.user.sub,
      value.class_id
    );

    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({ success: false, error: error.message });
    }
    if (error.message?.includes('already')) {
      return res.status(409).json({ success: false, error: error.message });
    }
    if (error.message?.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    next(error);
  }
};

export const getMyClasses = async (req, res, next) => {
  try {
    const enrollments = await EnrollmentService.getEnrolledClasses(req.user.sub);
    res.json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

export const dropClass = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;

    await EnrollmentService.dropClass(enrollmentId, req.user.sub);

    res.json({
      success: true,
      message: 'Dropped class successfully'
    });
  } catch (error) {
    if (error.message?.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error.message?.includes('not authorized')) {
      return res.status(403).json({ success: false, error: error.message });
    }
    next(error);
  }
};
