-- =====================================================
-- Google Maps Location Integration Setup for NiwasNest
-- =====================================================
-- Run this script in your Supabase SQL Editor

-- 1. Add Google Maps location columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 2. Add helpful comments for documentation
COMMENT ON COLUMN properties.google_maps_url IS 'Google Maps URL for the property location (e.g., https://maps.google.com/maps?q=12.9716,77.5946)';
COMMENT ON COLUMN properties.latitude IS 'Property latitude coordinate (-90 to 90)';
COMMENT ON COLUMN properties.longitude IS 'Property longitude coordinate (-180 to 180)';

-- 3. Add constraints for coordinate validation (with proper error handling)
DO $$
BEGIN
    -- Add latitude constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'latitude_range' AND table_name = 'properties'
    ) THEN
        ALTER TABLE properties ADD CONSTRAINT latitude_range 
        CHECK (latitude >= -90 AND latitude <= 90);
    END IF;
    
    -- Add longitude constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'longitude_range' AND table_name = 'properties'
    ) THEN
        ALTER TABLE properties ADD CONSTRAINT longitude_range 
        CHECK (longitude >= -180 AND longitude <= 180);
    END IF;
END $$;

-- 4. Create index for location-based queries (optional, for future features)
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 5. Update RLS policies (if needed - uncomment if you have specific admin policies)
-- This assumes your existing RLS policies already allow admins to update properties
-- If you need specific policies for location fields, uncomment and modify:

/*
-- Allow authenticated users to read location data
CREATE POLICY IF NOT EXISTS "Allow reading location data" ON properties
FOR SELECT USING (true);

-- Allow admins to update location data
CREATE POLICY IF NOT EXISTS "Allow admins to update location" ON properties
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);
*/

-- 6. Sample data update (optional - uncomment to add sample location data)
/*
-- Example: Update existing properties with sample location data
UPDATE properties SET 
  google_maps_url = 'https://maps.google.com/maps?q=12.9716,77.5946',
  latitude = 12.9716,
  longitude = 77.5946
WHERE city = 'Bangalore' AND google_maps_url IS NULL;

UPDATE properties SET 
  google_maps_url = 'https://maps.google.com/maps?q=19.0760,72.8777',
  latitude = 19.0760,
  longitude = 72.8777
WHERE city = 'Mumbai' AND google_maps_url IS NULL;
*/

-- 7. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name IN ('google_maps_url', 'latitude', 'longitude')
ORDER BY column_name;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Google Maps location integration setup completed successfully!';
  RAISE NOTICE 'New columns added: google_maps_url, latitude, longitude';
  RAISE NOTICE 'You can now add location data through the admin interface.';
END $$;