import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '3600';

export const generateToken = (userId, email, role) => {
  return jwt.sign(
    { sub: userId, email, role },
    JWT_SECRET,
    { expiresIn: parseInt(JWT_EXPIRY) }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password) => {
  return await bcryptjs.hash(password, 10);
};

export const comparePassword = async (password, hash) => {
  return await bcryptjs.compare(password, hash);
};
