import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'users', key: 'id' }
  }
}, {
  timestamps: false
});

export default Teacher;
