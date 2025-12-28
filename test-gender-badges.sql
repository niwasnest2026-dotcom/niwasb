-- Test script to verify gender badges are working
-- This will show current gender preferences for all properties

SELECT 
  id,
  name,
  property_type,
  gender_preference,
  rating,
  verified,
  secure_booking
FROM properties 
ORDER BY created_at DESC
LIMIT 10;

-- Update a few properties to test different gender preferences
-- (Replace the IDs with actual property IDs from your database)

-- Example updates (uncomment and use actual property IDs):
-- UPDATE properties SET gender_preference = 'Male' WHERE name LIKE '%Kushal%';
-- UPDATE properties SET gender_preference = 'Female' WHERE name LIKE '%Sunrise%';
-- UPDATE properties SET gender_preference = 'Co-living' WHERE name LIKE '%Niwas%';

-- Verify the updates
SELECT 
  name,
  property_type,
  gender_preference,
  CASE 
    WHEN gender_preference = 'Male' THEN 'Should show: MALE PG (Blue badge)'
    WHEN gender_preference = 'Female' THEN 'Should show: FEMALE PG (Pink badge)'
    WHEN gender_preference = 'Co-living' THEN 'Should show: CO-LIVING (Teal badge)'
    ELSE 'No badge shown'
  END as badge_display
FROM properties 
WHERE gender_preference IS NOT NULL
ORDER BY name;