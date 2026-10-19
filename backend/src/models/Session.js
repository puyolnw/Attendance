import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'classes', key: 'id' },
    onDelete: 'CASCADE'
  },
  session_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'active', 'closed'),
    defaultValue: 'scheduled'
  },
  qr_code: {
    type: DataTypes.TEXT,
    comment: 'QR code data URL'
  },
  pin_code: {
    type: DataTypes.STRING(6),
    comment: '6-digit PIN'
  },
  grace_period_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 15
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Teachers', key: 'id' }
  }
}, {
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['class_id'] }]
});

export default Session;
