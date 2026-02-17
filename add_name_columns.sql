-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Update existing records to split any existing name field or set defaults
-- This assumes you might have a 'name' field or need to handle existing data
UPDATE "users" 
SET "firstName" = COALESCE("firstName", ''),
    "lastName" = COALESCE("lastName", '')
WHERE "firstName" IS NULL OR "lastName" IS NULL;
