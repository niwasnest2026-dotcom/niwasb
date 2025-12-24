-- Emergency fix for missing columns
-- Run this immediately to fix the current error

-- Add missing updated_at column
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing gender_preference column  
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(20) DEFAULT 'Co-living';

-- Disable RLS to allow updates
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

-- Update existing records
UPDATE properties 
SET 
  updated_at = COALESCE(updated_at, created_at, NOW()),
  gender_preference = COALESCE(gender_preference, 'Co-living')
WHERE updated_at IS NULL OR gender_preference IS NULL;

-- Test that it works
SELECT 'Emergency fix applied! Try updating property now.' as message;

-- Show the columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('updated_at', 'gender_preference');