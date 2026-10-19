/**
 * Set up all model associations
 * Called after all models are initialized to avoid circular dependencies
 */
export const setupAssociations = (models) => {
  const { User, Teacher, Student, Class, Schedule, Enrollment, Session, Attendance } = models;

  // User -> Teacher (one-to-one)
  Teacher.belongsTo(User, { foreignKey: 'id', as: 'user' });
  User.hasOne(Teacher, { foreignKey: 'id', as: 'teacher' });

  // User -> Student (one-to-one)
  Student.belongsTo(User, { foreignKey: 'id', as: 'user' });
  User.hasOne(Student, { foreignKey: 'id', as: 'student' });

  // Teacher -> Class (one-to-many)
  Class.belongsTo(Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
  Teacher.hasMany(Class, { foreignKey: 'teacher_id', as: 'classes' });

  // Class -> Schedule (one-to-many)
  Schedule.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
  Class.hasMany(Schedule, { foreignKey: 'class_id', as: 'schedules' });

  // Student -> Enrollment (one-to-many)
  Enrollment.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  Student.hasMany(Enrollment, { foreignKey: 'student_id', as: 'enrollments' });

  // Class -> Enrollment (one-to-many)
  Enrollment.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
  Class.hasMany(Enrollment, { foreignKey: 'class_id', as: 'enrollments' });

  // Class -> Session (one-to-many)
  Session.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
  Class.hasMany(Session, { foreignKey: 'class_id', as: 'sessions' });

  // Teacher -> Session (creator)
  Session.belongsTo(Teacher, { foreignKey: 'created_by', as: 'creator' });
  Teacher.hasMany(Session, { foreignKey: 'created_by', as: 'createdSessions' });

  // Session -> Attendance (one-to-many)
  Attendance.belongsTo(Session, { foreignKey: 'session_id', as: 'session' });
  Session.hasMany(Attendance, { foreignKey: 'session_id', as: 'attendances' });

  // Student -> Attendance (one-to-many)
  Attendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  Student.hasMany(Attendance, { foreignKey: 'student_id', as: 'attendances' });
};
