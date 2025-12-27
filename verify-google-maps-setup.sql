-- =====================================================
-- Verify Google Maps Location Setup
-- =====================================================
-- Run this to check if the Google Maps columns exist

-- Check if columns exist
SELECT 
  table_name,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name IN ('google_maps_url', 'latitude', 'longitude')
ORDER BY column_name;

-- Check constraints
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'properties' 
  AND constraint_name IN ('latitude_range', 'longitude_range');

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'properties' 
  AND indexname = 'idx_properties_location';

-- Sample query to test the new columns
SELECT 
  id,
  name,
  city,
  google_maps_url,
  latitude,
  longitude
FROM properties 
LIMIT 5;