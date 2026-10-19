import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Schedule = sequelize.define('Schedule', {
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
  day_of_week: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '0=Sun, 6=Sat'
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  underscored: true
});

export default Schedule;
