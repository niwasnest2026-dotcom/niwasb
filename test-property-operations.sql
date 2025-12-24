-- Test both INSERT and UPDATE operations
-- Run this after running complete-rls-fix.sql

-- Test 1: INSERT a new property
DO $$
DECLARE
  new_property_id UUID;
BEGIN
  INSERT INTO properties (
    name, 
    description,
    address, 
    city, 
    area,
    property_type, 
    price, 
    gender_preference,
    verified,
    secure_booking
  ) VALUES (
    'Test Property for Operations', 
    'This is a test property to verify INSERT and UPDATE work',
    'Test Address 123', 
    'Test City', 
    'Test Area',
    'PG', 
    15000, 
    'Male',
    true,
    true
  ) RETURNING id INTO new_property_id;
  
  RAISE NOTICE 'SUCCESS: INSERT test passed! Property ID: %', new_property_id;
  
  -- Test 2: UPDATE the property we just created
  UPDATE properties 
  SET 
    name = 'Updated Test Property',
    price = 16000,
    gender_preference = 'Female',
    updated_at = NOW()
  WHERE id = new_property_id;
  
  RAISE NOTICE 'SUCCESS: UPDATE test passed!';
  
  -- Test 3: Verify the update worked
  IF EXISTS (
    SELECT 1 FROM properties 
    WHERE id = new_property_id 
    AND name = 'Updated Test Property' 
    AND price = 16000 
    AND gender_preference = 'Female'
  ) THEN
    RAISE NOTICE 'SUCCESS: Update verification passed!';
  ELSE
    RAISE NOTICE 'ERROR: Update verification failed!';
  END IF;
  
  -- Clean up: DELETE the test property
  DELETE FROM properties WHERE id = new_property_id;
  RAISE NOTICE 'Test property cleaned up';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Show summary
SELECT 'Property Operations Test Complete!' as result;