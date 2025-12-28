-- Update existing properties to have gender preferences
-- This script adds gender preferences to existing properties that don't have them

-- Update properties that contain "male" or "boys" in name/description to Male
UPDATE properties 
SET gender_preference = 'Male'
WHERE gender_preference IS NULL 
  AND (
    LOWER(name) LIKE '%male%' 
    OR LOWER(name) LIKE '%boys%' 
    OR LOWER(name) LIKE '%men%'
    OR LOWER(description) LIKE '%male%' 
    OR LOWER(description) LIKE '%boys%' 
    OR LOWER(description) LIKE '%men%'
  );

-- Update properties that contain "female" or "girls" in name/description to Female
UPDATE properties 
SET gender_preference = 'Female'
WHERE gender_preference IS NULL 
  AND (
    LOWER(name) LIKE '%female%' 
    OR LOWER(name) LIKE '%girls%' 
    OR LOWER(name) LIKE '%women%'
    OR LOWER(description) LIKE '%female%' 
    OR LOWER(description) LIKE '%girls%' 
    OR LOWER(description) LIKE '%women%'
  );

-- Set remaining properties to Co-living (mixed)
UPDATE properties 
SET gender_preference = 'Co-living'
WHERE gender_preference IS NULL;

-- Verify the update
SELECT 
  gender_preference,
  COUNT(*) as count
FROM properties 
GROUP BY gender_preference
ORDER BY gender_preference;