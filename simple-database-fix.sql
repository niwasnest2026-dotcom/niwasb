-- Simple database fix script without ON CONFLICT issues
-- Run this in your Supabase SQL editor

-- 1. Add gender_preference column if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(20) DEFAULT 'Co-living';

-- 2. Add check constraint for gender_preference (ignore if already exists)
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

-- Check if other tables exist before disabling RLS
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_amenities') THEN
    ALTER TABLE property_amenities DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_images') THEN
    ALTER TABLE property_images DISABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_rooms') THEN
    ALTER TABLE property_rooms DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 4. Create property_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create amenities table if it doesn't exist
CREATE TABLE IF NOT EXISTS amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create property_amenities table if it doesn't exist
CREATE TABLE IF NOT EXISTS property_amenities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Add basic amenities (only if amenities table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM amenities LIMIT 1) THEN
    INSERT INTO amenities (name, icon_name) VALUES 
    ('WiFi', 'wifi'),
    ('Power Backup', 'power'),
    ('Gym', 'gym'),
    ('Gaming Zone', 'gaming'),
    ('AC', 'ac'),
    ('Lounge', 'lounge'),
    ('Kitchen/Dining', 'kitchen'),
    ('Laundry', 'laundry'),
    ('Parking', 'parking'),
    ('Security', 'security');
  END IF;
END $$;

-- 8. Update existing properties to have gender_preference if null
UPDATE properties 
SET gender_preference = 'Co-living' 
WHERE gender_preference IS NULL;

-- 9. Show final status
SELECT 'Database Setup Complete!' as message;

-- 10. Show table status
SELECT 
  t.table_name,
  CASE WHEN pt.rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name AND column_name = 'gender_preference') as has_gender_column
FROM information_schema.tables t
LEFT JOIN pg_tables pt ON pt.tablename = t.table_name
WHERE t.table_name IN ('properties', 'property_amenities', 'property_images', 'amenities')
  AND t.table_schema = 'public'
ORDER BY t.table_name;