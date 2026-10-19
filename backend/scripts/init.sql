-- Initial setup SQL (optional - Sequelize will create tables)
-- This file is kept for manual initialization if needed
-- The actual table creation is handled by Sequelize migrations in the app startup

-- Create extensions if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up initial database (tables will be created by Sequelize ORM)
-- Alter default search_path
ALTER ROLE postgres SET search_path = public;
