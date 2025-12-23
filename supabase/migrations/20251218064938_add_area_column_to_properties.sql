/*
  # Add Area Column to Properties Table
  
  ## Changes
  
  ### Properties Table Updates
  - Add `area` column (text, nullable) - Stores neighborhood/locality name
  - Add index on area column for faster searching
  
  ## Purpose
  
  This migration separates the location data into three fields:
  - `city` - The city name (e.g., "Bangalore", "Mumbai")
  - `area` - The neighborhood or locality (e.g., "Koramangala", "Andheri")
  - `address` - The full street address
  
  This allows users to search by city alone, area alone, or both independently.
  
  ## Notes
  
  - The area field is nullable to allow existing records without migration issues
  - An index is added to optimize area-based searches
*/

-- Add area column to properties table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'area'
  ) THEN
    ALTER TABLE properties ADD COLUMN area text;
  END IF;
END $$;

-- Add index on area column for faster searching
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);

-- Add index on city column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);