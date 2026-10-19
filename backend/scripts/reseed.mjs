// Wipe all seedable data and re-seed with the Thai dataset.
import sequelize from '../src/config/database.js';
import { setupAssociations } from '../src/models/index.js';
import seedDatabase from '../src/scripts/seeder.js';

const run = async () => {
  await sequelize.authenticate();
  setupAssociations(sequelize.models);
  await sequelize.sync();

  console.log('กำลังล้างข้อมูลเดิม...');
  // Order matters (children first). CASCADE handles the rest.
  await sequelize.query(`
    TRUNCATE TABLE
      "attendances",
      "sessions",
      "enrollments",
      "schedules",
      "classes",
      "Students",
      "Teachers",
      "users"
    CASCADE;
  `);
  console.log('ล้างข้อมูลเดิมเรียบร้อย');

  await seedDatabase();
  process.exit(0);
};

run().catch((e) => { console.error('Reseed failed:', e); process.exit(1); });
