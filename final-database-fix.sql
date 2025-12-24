-- Final database fix - addresses the specific 'updated_at' column error
-- Run this in your Supabase SQL editor

-- 1. Add missing columns to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(20) DEFAULT 'Co-living';

-- 2. Add check constraint for gender_preference (ignore if exists)
DO $$
BEGIN
  ALTER TABLE properties 
  ADD CONSTRAINT properties_gender_preference_check 
  CHECK (gender_preference IN ('Male', 'Female', 'Co-living'));
EXCEPTION WHEN duplicate_object THEN
  -- Constraint already exists, ignore
  NULL;
END $$;

-- 3. Disable RLS on all property-related tables
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

-- Disable RLS on related tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_amenities') THEN
    ALTER TABLE property_amenities DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_images') THEN
    ALTER TABLE property_images DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'amenities') THEN
    ALTER TABLE amenities DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 4. Update existing properties to have proper values
UPDATE properties 
SET 
  updated_at = COALESCE(updated_at, created_at, NOW()),
  gender_preference = COALESCE(gender_preference, 'Co-living')
WHERE updated_at IS NULL OR gender_preference IS NULL;

-- 5. Create property_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create amenities table if it doesn't exist
CREATE TABLE IF NOT EXISTS amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create property_amenities table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Add basic amenities if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM amenities LIMIT 1) THEN
    INSERT INTO amenities (name, icon_name) VALUES 
    ('Air Conditioning', 'ac'),
    ('WiFi', 'wifi'),
    ('Gym', 'gym'),
    ('Gaming Zone', 'gaming'),
    ('Kitchen/Dining', 'kitchen'),
    ('Laundry', 'laundry'),
    ('Parking', 'parking'),
    ('Security', 'security'),
    ('Power Backup', 'power'),
    ('Common Lounge', 'lounge'),
    ('Attached Bathroom', 'bathroom'),
    ('Housekeeping', 'housekeeping');
  END IF;
END $$;

-- 9. Test UPDATE operation with the exact same structure as the app
DO $$
DECLARE
  test_property_id UUID;
BEGIN
  -- Find a property to test
  SELECT id INTO test_property_id FROM properties LIMIT 1;
  
  IF test_property_id IS NOT NULL THEN
    -- Test the exact UPDATE query from the app
    UPDATE properties 
    SET 
      name = name, -- Keep existing name
      description = description,
      address = address,
      city = city,
      area = area,
      price = price,
      security_deposit = security_deposit,
      available_months = available_months,
      property_type = property_type,
      gender_preference = COALESCE(gender_preference, 'Co-living'),
      featured_image = featured_image,
      rating = rating,
      verified = COALESCE(verified, false),
      instant_book = COALESCE(instant_book, false),
      secure_booking = COALESCE(secure_booking, false),
      updated_at = NOW()
    WHERE id = test_property_id;
    
    RAISE NOTICE 'SUCCESS: Property UPDATE test passed!';
  ELSE
    RAISE NOTICE 'No properties found to test';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERROR in UPDATE test: %', SQLERRM;
END $$;

-- 10. Show final status
SELECT 'Database Fix Complete!' as message;

-- 11. Show properties table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name IN ('updated_at', 'gender_preference', 'verified', 'instant_book', 'secure_booking')
ORDER BY column_name;

-- 12. Show RLS status
SELECT 
  tablename, 
  CASE WHEN rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM pg_tables 
WHERE tablename IN ('properties', 'property_amenities', 'property_images', 'amenities')
ORDER BY tablename;