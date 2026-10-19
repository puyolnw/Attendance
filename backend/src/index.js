import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import all models to register them
import './models/User.js';
import './models/Teacher.js';
import './models/Student.js';
import './models/Class.js';
import './models/Schedule.js';
import './models/Enrollment.js';
import './models/Session.js';
import './models/Attendance.js';
import { setupAssociations } from './models/associations.js';

import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import classRoutes from './routes/classRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import userRoutes from './routes/userRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import seedDatabase from './scripts/seeder.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/schedules', scheduleRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Setup model associations (after models are loaded)
    setupAssociations(sequelize.models);
    console.log('Model associations initialized');

    // Sync models (development only)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Database synced');

      // Run seeder in development
      const hasData = await sequelize.models.User.count();
      if (hasData === 0) {
        console.log('Running database seeder...');
        await seedDatabase();
      }
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
