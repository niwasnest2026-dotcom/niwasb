-- Add gender preference field to properties table
ALTER TABLE properties 
ADD COLUMN gender_preference VARCHAR(20) DEFAULT 'Co-living' CHECK (gender_preference IN ('Male', 'Female', 'Co-living'));

-- Update existing properties to have Co-living as default
UPDATE properties SET gender_preference = 'Co-living' WHERE gender_preference IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN properties.gender_preference IS 'Gender preference for the property: Male, Female, or Co-living';