import { ClassService } from '../services/ClassService.js';
import { CURRENT_TERM } from '../config/currentTerm.js';
import { validateRequest } from '../middleware/validation.js';
import {
  createClassSchema,
  updateClassSchema,
  addStudentSchema
} from '../middleware/validation.js';

export const createClass = async (req, res, next) => {
  try {
    const { error, value } = createClassSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const classData = {
      ...value,
      teacher_id: req.user.sub
    };

    const newClass = await ClassService.createClass(classData);
    res.status(201).json({
      success: true,
      data: newClass
    });
  } catch (error) {
    if (error.status === 403) {
      return res.status(403).json({ success: false, error: error.message });
    }
    if (error.status === 409) {
      return res.status(409).json({ success: false, error: error.message });
    }
    next(error);
  }
};

export const listAvailableClasses = async (req, res, next) => {
  try {
    const { semester, academic_year } = req.query;
    const classes = await ClassService.listAvailableClasses(req.user.sub, { semester, academic_year });
    res.json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
};

export const listMyClasses = async (req, res, next) => {
  try {
    const { semester, academic_year } = req.query;
    const classes = await ClassService.listTeacherClasses(req.user.sub, { semester, academic_year });
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    next(error);
  }
};

export const listMyTerms = async (req, res, next) => {
  try {
    const terms = await ClassService.listTeacherTerms(req.user.sub);
    res.json({ success: true, data: terms });
  } catch (error) {
    next(error);
  }
};

export const getCurrentTerm = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        ...CURRENT_TERM,
        label: `${CURRENT_TERM.semester}/${CURRENT_TERM.academic_year}`
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classData = await ClassService.getClass(id);

    if (!classData) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = updateClassSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const classData = await ClassService.getClass(id);
    if (!classData) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    if (classData.teacher_id !== req.user.sub) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this class' });
    }

    const updatedClass = await ClassService.updateClass(id, value);
    res.json({
      success: true,
      data: updatedClass
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classData = await ClassService.getClass(id);

    if (!classData) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    if (classData.teacher_id !== req.user.sub) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this class' });
    }

    await ClassService.deleteClass(id);
    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classData = await ClassService.getClass(id);

    if (!classData) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    const students = await ClassService.getStudents(id);
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

export const addStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error, value } = addStudentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }

    const classData = await ClassService.getClass(id);
    if (!classData) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    if (classData.teacher_id !== req.user.sub) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const enrollment = await ClassService.addStudent(id, value.student_id);
    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    if (error.message?.includes('already')) {
      return res.status(409).json({ success: false, error: error.message });
    }
    next(error);
  }
};

export const removeStudent = async (req, res, next) => {
  try {
    const { id, studentId } = req.params;
    const classData = await ClassService.getClass(id);

    if (!classData) {
      return res.status(404).json({ success: false, error: 'Class not found' });
    }

    if (classData.teacher_id !== req.user.sub) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await ClassService.removeStudent(id, studentId);
    res.json({
      success: true,
      message: 'Student removed from class'
    });
  } catch (error) {
    next(error);
  }
};
