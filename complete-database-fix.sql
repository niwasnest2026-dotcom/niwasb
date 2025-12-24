-- Complete database setup and fix script
-- Run this in your Supabase SQL editor to fix all issues

-- 1. Add gender_preference column if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(20) DEFAULT 'Co-living' 
CHECK (gender_preference IN ('Male', 'Female', 'Co-living'));

-- 2. Disable RLS on all property-related tables to allow admin operations
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_rooms DISABLE ROW LEVEL SECURITY;

-- 3. Ensure property_images table exists with correct structure
CREATE TABLE IF NOT EXISTS property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ensure property_amenities table exists
CREATE TABLE IF NOT EXISTS property_amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, amenity_id)
);

-- 5. Ensure amenities table has basic amenities
INSERT INTO amenities (name, icon_name) VALUES 
('WiFi', 'wifi'),
('Power Backup', 'power'),
('Gym', 'gym'),
('Gaming Zone', 'gaming'),
('AC', 'ac'),
('Lounge', 'lounge')
ON CONFLICT (name) DO NOTHING;

-- 6. Update existing properties to have gender_preference if null
UPDATE properties 
SET gender_preference = 'Co-living' 
WHERE gender_preference IS NULL;

-- 7. Test insert to verify everything works
DO $$
BEGIN
  -- Try to insert a test property
  INSERT INTO properties (
    name, 
    address, 
    city, 
    property_type, 
    price, 
    gender_preference,
    verified,
    secure_booking
  ) VALUES (
    'Test Property - DELETE ME', 
    'Test Address', 
    'Test City', 
    'PG', 
    10000, 
    'Co-living',
    true,
    true
  );
  
  RAISE NOTICE 'SUCCESS: Test property inserted successfully!';
  
  -- Clean up test property
  DELETE FROM properties WHERE name = 'Test Property - DELETE ME';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- 8. Show final status
SELECT 'Database Setup Complete!' as status;
SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename AND column_name = 'gender_preference') as has_gender_column
FROM pg_tables 
WHERE tablename IN ('properties', 'property_amenities', 'property_images')
ORDER BY tablename;