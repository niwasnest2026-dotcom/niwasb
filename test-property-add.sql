-- Test script to check if property can be added
-- Run this in Supabase SQL editor to test the schema

-- Check if gender_preference column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name = 'gender_preference';

-- Test inserting a simple property
INSERT INTO properties (
  name, 
  address, 
  city, 
  property_type, 
  price, 
  gender_preference
) VALUES (
  'Test Property', 
  'Test Address', 
  'Test City', 
  'PG', 
  10000, 
  'Co-living'
) RETURNING id, name, gender_preference;

-- Clean up test data (optional)
-- DELETE FROM properties WHERE name = 'Test Property';