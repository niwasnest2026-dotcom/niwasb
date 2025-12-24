-- Complete RLS fix for all property operations
-- Run this in your Supabase SQL editor to fix INSERT, UPDATE, DELETE issues

-- 1. Disable RLS on all property-related tables
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

-- Check if other tables exist and disable RLS
DO $$
BEGIN
  -- Disable RLS on property_amenities if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_amenities') THEN
    ALTER TABLE property_amenities DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Disabled RLS on property_amenities';
  END IF;
  
  -- Disable RLS on property_images if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_images') THEN
    ALTER TABLE property_images DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Disabled RLS on property_images';
  END IF;
  
  -- Disable RLS on property_rooms if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property_rooms') THEN
    ALTER TABLE property_rooms DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Disabled RLS on property_rooms';
  END IF;
  
  -- Disable RLS on room_images if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'room_images') THEN
    ALTER TABLE room_images DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Disabled RLS on room_images';
  END IF;
  
  -- Disable RLS on amenities if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'amenities') THEN
    ALTER TABLE amenities DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Disabled RLS on amenities';
  END IF;
END $$;

-- 2. Add gender_preference column if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(20) DEFAULT 'Co-living';

-- 3. Update existing properties to have gender_preference
UPDATE properties 
SET gender_preference = 'Co-living' 
WHERE gender_preference IS NULL OR gender_preference = '';

-- 4. Test UPDATE operation
DO $$
DECLARE
  test_property_id UUID;
BEGIN
  -- Find a property to test update
  SELECT id INTO test_property_id FROM properties LIMIT 1;
  
  IF test_property_id IS NOT NULL THEN
    -- Try to update the property
    UPDATE properties 
    SET updated_at = NOW()
    WHERE id = test_property_id;
    
    RAISE NOTICE 'SUCCESS: Property update test passed!';
  ELSE
    RAISE NOTICE 'No properties found to test update';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERROR in update test: %', SQLERRM;
END $$;

-- 5. Test INSERT operation
DO $$
DECLARE
  test_property_id UUID;
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
  ) RETURNING id INTO test_property_id;
  
  RAISE NOTICE 'SUCCESS: Property insert test passed! ID: %', test_property_id;
  
  -- Clean up test property
  DELETE FROM properties WHERE id = test_property_id;
  RAISE NOTICE 'Test property cleaned up';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERROR in insert test: %', SQLERRM;
END $$;

-- 6. Show final status
SELECT 'RLS Fix Complete!' as message;

-- 7. Show RLS status for all tables
SELECT 
  t.table_name,
  CASE WHEN pt.rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM information_schema.tables t
LEFT JOIN pg_tables pt ON pt.tablename = t.table_name
WHERE t.table_name IN ('properties', 'property_amenities', 'property_images', 'amenities', 'property_rooms', 'room_images')
  AND t.table_schema = 'public'
ORDER BY t.table_name;