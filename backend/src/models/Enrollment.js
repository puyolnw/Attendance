import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Students', key: 'id' },
    onDelete: 'CASCADE'
  },
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'classes', key: 'id' },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('active', 'withdrawn', 'completed'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['student_id'] },
    { fields: ['class_id'] },
    { fields: ['student_id', 'class_id'], unique: true }
  ]
});

export default Enrollment;
