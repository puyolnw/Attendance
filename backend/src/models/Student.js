import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'users', key: 'id' }
  },
  student_id_number: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
}, {
  timestamps: false
});

export default Student;
