-- Database initialization script for Khabeer Backend
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
-- Note: The database is already created by the POSTGRES_DB environment variable
-- This script is mainly for any additional setup

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (these will be created by Prisma migrations)
-- This is just a placeholder for any custom database setup

-- Log the initialization
DO $$
BEGIN
    RAISE NOTICE 'Khabeer database initialized successfully at %', NOW();
END $$; 