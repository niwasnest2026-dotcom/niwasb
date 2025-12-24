-- Add sample gender preferences to existing properties
-- This script updates existing properties with different gender preferences

-- First, let's see what properties exist and add the gender_preference column if it doesn't exist
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(20) DEFAULT 'Co-living' 
CHECK (gender_preference IN ('Male', 'Female', 'Co-living'));

-- Update existing properties with sample gender preferences
-- We'll distribute them across different gender preferences

-- Update properties to have Male preference (every 3rd property starting from 1st)
UPDATE properties 
SET gender_preference = 'Male' 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn 
    FROM properties
  ) t 
  WHERE rn % 3 = 1
);

-- Update properties to have Female preference (every 3rd property starting from 2nd)
UPDATE properties 
SET gender_preference = 'Female' 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn 
    FROM properties
  ) t 
  WHERE rn % 3 = 2
);

-- Update properties to have Co-living preference (every 3rd property starting from 3rd)
UPDATE properties 
SET gender_preference = 'Co-living' 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn 
    FROM properties
  ) t 
  WHERE rn % 3 = 0
);

-- If you want to manually set specific properties, you can use these examples:
-- UPDATE properties SET gender_preference = 'Male' WHERE name ILIKE '%boys%' OR name ILIKE '%men%' OR name ILIKE '%male%';
-- UPDATE properties SET gender_preference = 'Female' WHERE name ILIKE '%girls%' OR name ILIKE '%women%' OR name ILIKE '%female%' OR name ILIKE '%ladies%';
-- UPDATE properties SET gender_preference = 'Co-living' WHERE name ILIKE '%co-living%' OR name ILIKE '%mixed%' OR name ILIKE '%unisex%';

-- Verify the distribution
SELECT 
  gender_preference, 
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM properties), 2) as percentage
FROM properties 
GROUP BY gender_preference
ORDER BY gender_preference;

-- Show sample of updated properties
SELECT id, name, city, gender_preference, created_at 
FROM properties 
ORDER BY created_at 
LIMIT 10;