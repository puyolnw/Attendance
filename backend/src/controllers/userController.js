import { User, Teacher, Student } from '../models/index.js';
import { hashPassword } from '../config/auth.js';

// GET /users — list all users (admin)
export const listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'full_name', 'role', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']],
    });
    res.json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        name: u.full_name,
        email: u.email,
        role: u.role,
        status: u.is_active === false ? 'inactive' : 'active',
        createdAt: u.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// POST /users — create a user (admin)
export const createUser = async (req, res, next) => {
  try {
    const { name, full_name, email, role, password } = req.body;
    const fullName = full_name || name;

    if (!fullName || !email || !role || !password) {
      return res.status(400).json({ success: false, error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
    }
    if (!['teacher', 'student', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'บทบาทไม่ถูกต้อง' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const password_hash = await hashPassword(password);
    const user = await User.create({ email, password_hash, full_name: fullName, role, is_active: true });

    if (role === 'teacher') {
      await Teacher.create({ id: user.id });
    } else if (role === 'student') {
      await Student.create({ id: user.id, student_id_number: `STU-${user.id.substring(0, 8)}` });
    }

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        status: 'active',
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /users/:id — soft delete (deactivate)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.sub) {
      return res.status(400).json({ success: false, error: 'ไม่สามารถลบบัญชีของตนเองได้' });
    }
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'ไม่พบผู้ใช้' });
    }
    await user.update({ is_active: false });
    res.json({ success: true, message: 'ปิดใช้งานบัญชีเรียบร้อย' });
  } catch (error) {
    next(error);
  }
};

// GET /users/summary — system stats (admin dashboard tiles)
export const getSummary = async (req, res, next) => {
  try {
    const { Class } = await import('../models/index.js');
    const [totalUsers, totalTeachers, totalStudents, totalClasses] = await Promise.all([
      User.count(),
      User.count({ where: { role: 'teacher' } }),
      User.count({ where: { role: 'student' } }),
      Class.count(),
    ]);
    res.json({
      success: true,
      data: { totalUsers, totalTeachers, totalStudents, totalClasses },
    });
  } catch (error) {
    next(error);
  }
};
