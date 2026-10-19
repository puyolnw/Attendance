import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  session_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'sessions', key: 'id' },
    onDelete: 'CASCADE'
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Students', key: 'id' },
    onDelete: 'CASCADE'
  },
  check_in_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  check_in_method: {
    type: DataTypes.ENUM('qr', 'pin', 'manual'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('present', 'late', 'absent', 'leave', 'sick'),
    defaultValue: 'present'
  },
  ip_address: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['session_id'] },
    { fields: ['student_id'] },
    { fields: ['session_id', 'student_id'], unique: true }
  ]
});

export default Attendance;
