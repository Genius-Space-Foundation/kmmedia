-- Manual migration to add firstName and lastName to users table
-- This preserves existing data

-- Step 1: Add columns as nullable first
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT;

-- Step 2: Set default values for existing users (empty strings for now)
-- You can manually update these later if needed
UPDATE "users" 
SET "firstName" = COALESCE("firstName", ''),
    "lastName" = COALESCE("lastName", '')
WHERE "firstName" IS NULL OR "lastName" IS NULL;

-- Step 3: Make columns NOT NULL (to match Prisma schema)
ALTER TABLE "users" 
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL;

-- Verification query (optional - run separately to check)
-- SELECT id, email, "firstName", "lastName" FROM users LIMIT 5;
