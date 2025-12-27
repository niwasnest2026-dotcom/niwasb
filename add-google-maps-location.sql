-- Add Google Maps location fields to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add comments for clarity
COMMENT ON COLUMN properties.google_maps_url IS 'Google Maps URL for the property location';
COMMENT ON COLUMN properties.latitude IS 'Property latitude coordinate';
COMMENT ON COLUMN properties.longitude IS 'Property longitude coordinate';

-- Update RLS policies to allow admins to update location fields
-- (Assuming existing RLS policies already handle property updates for admins)

-- Example of updating existing properties with sample data (optional)
-- UPDATE properties SET 
--   google_maps_url = 'https://maps.google.com/maps?q=12.9716,77.5946',
--   latitude = 12.9716,
--   longitude = 77.5946
-- WHERE id = 'sample-property-id';