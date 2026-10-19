import { User, Teacher, Student } from '../models/index.js';
import { generateToken, hashPassword, comparePassword } from '../config/auth.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    const password_hash = await hashPassword(password);
    const user = await User.create({
      email,
      password_hash,
      full_name,
      role
    });

    // Create role-specific record
    if (role === 'teacher') {
      await Teacher.create({ id: user.id });
    } else if (role === 'student') {
      await Student.create({ id: user.id, student_id_number: `STU-${user.id.substring(0, 8)}` });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.status(201).json({
      success: true,
      data: { id: user.id, email: user.email, role: user.role },
      accessToken: token
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      data: { id: user.id, email: user.email, role: user.role },
      accessToken: token
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.sub);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: { id: user.id, email: user.email, full_name: user.full_name, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};
