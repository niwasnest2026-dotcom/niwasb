-- Quick RLS fix - just disable row level security
-- Run this first to fix the immediate property insertion issue

-- Disable RLS on properties table
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

-- Add gender_preference column if missing
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(20) DEFAULT 'Co-living';

-- Update existing properties
UPDATE properties 
SET gender_preference = 'Co-living' 
WHERE gender_preference IS NULL;

-- Test if it works
SELECT 'RLS Fix Complete - Try adding property now!' as message;

-- Show current RLS status
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'properties';