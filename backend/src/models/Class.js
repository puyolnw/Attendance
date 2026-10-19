import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  teacher_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'Teachers', key: 'id' }
  },
  course_code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  course_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  room_number: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  semester: {
    type: DataTypes.INTEGER,        // 1, 2, 3
    allowNull: false,
    defaultValue: 1
  },
  academic_year: {
    type: DataTypes.INTEGER,        // Thai Buddhist year, e.g. 2569
    allowNull: false,
    defaultValue: 2569
  }
}, {
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['teacher_id'] }]
});

export default Class;
