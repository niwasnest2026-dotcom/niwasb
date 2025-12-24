-- Quick script to add gender preferences to existing properties
-- Run this in your Supabase SQL editor

-- Add the gender_preference column if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(20) DEFAULT 'Co-living' 
CHECK (gender_preference IN ('Male', 'Female', 'Co-living'));

-- Update existing properties with random gender preferences
-- This will give you a good mix for testing

-- Method 1: Update by property ID pattern (if you know specific IDs)
-- Replace these with actual property IDs from your database

-- Example updates (replace with your actual property IDs):
-- UPDATE properties SET gender_preference = 'Male' WHERE id = 'your-property-id-1';
-- UPDATE properties SET gender_preference = 'Female' WHERE id = 'your-property-id-2';
-- UPDATE properties SET gender_preference = 'Co-living' WHERE id = 'your-property-id-3';

-- Method 2: Update based on property names (if they contain gender hints)
UPDATE properties SET gender_preference = 'Male' 
WHERE LOWER(name) LIKE '%boy%' 
   OR LOWER(name) LIKE '%men%' 
   OR LOWER(name) LIKE '%male%' 
   OR LOWER(name) LIKE '%gents%'
   OR LOWER(name) LIKE '%king%';

UPDATE properties SET gender_preference = 'Female' 
WHERE LOWER(name) LIKE '%girl%' 
   OR LOWER(name) LIKE '%women%' 
   OR LOWER(name) LIKE '%female%' 
   OR LOWER(name) LIKE '%ladies%'
   OR LOWER(name) LIKE '%queen%';

-- Method 3: Distribute remaining properties evenly
WITH numbered_properties AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM properties 
  WHERE gender_preference = 'Co-living'  -- Only update those still set to default
)
UPDATE properties 
SET gender_preference = CASE 
  WHEN np.rn % 3 = 1 THEN 'Male'
  WHEN np.rn % 3 = 2 THEN 'Female'
  ELSE 'Co-living'
END
FROM numbered_properties np
WHERE properties.id = np.id;

-- Check the results
SELECT 
  gender_preference, 
  COUNT(*) as count,
  STRING_AGG(name, ', ') as sample_properties
FROM properties 
GROUP BY gender_preference
ORDER BY gender_preference;