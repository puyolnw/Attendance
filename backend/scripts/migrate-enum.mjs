// One-off: add leave/sick to the Attendance status enum (Postgres ENUM can't be added via sequelize alter).
import sequelize from '../src/config/database.js';

const run = async () => {
  // Find the enum type backing Attendances.status
  const [types] = await sequelize.query(`
    SELECT t.typname
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    GROUP BY t.typname
    HAVING array_agg(e.enumlabel::text ORDER BY e.enumsortorder) @> ARRAY['present','late','absent']
  `);

  if (!types.length) {
    console.log('No attendance status enum found — nothing to migrate (fresh DB will get it via sync).');
    process.exit(0);
  }

  for (const { typname } of types) {
    for (const val of ['leave', 'sick']) {
      await sequelize.query(`ALTER TYPE "${typname}" ADD VALUE IF NOT EXISTS '${val}'`);
      console.log(`Ensured '${val}' on enum ${typname}`);
    }
  }
  console.log('Enum migration done.');
  process.exit(0);
};

run().catch((e) => { console.error('Migration failed:', e.message); process.exit(1); });
