-- =====================================================
-- Simple Google Maps Location Setup (No Constraints)
-- =====================================================
-- Run this if you want a simpler setup without validation constraints

-- Add Google Maps location columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add helpful comments
COMMENT ON COLUMN properties.google_maps_url IS 'Google Maps URL for the property location';
COMMENT ON COLUMN properties.latitude IS 'Property latitude coordinate';
COMMENT ON COLUMN properties.longitude IS 'Property longitude coordinate';

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name IN ('google_maps_url', 'latitude', 'longitude')
ORDER BY column_name;