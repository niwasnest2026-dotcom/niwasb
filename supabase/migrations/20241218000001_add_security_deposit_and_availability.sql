-- Add security_deposit and available_months columns to properties table
ALTER TABLE properties 
ADD COLUMN security_deposit INTEGER,
ADD COLUMN available_months INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN properties.security_deposit IS 'Security deposit amount set by admin (if null, defaults to 2x monthly rent)';
COMMENT ON COLUMN properties.available_months IS 'Number of months the property is available for booking';

-- Update existing properties with default values if needed
-- You can run these updates manually based on your requirements:
-- UPDATE properties SET security_deposit = price * 2 WHERE security_deposit IS NULL;
-- UPDATE properties SET available_months = 12 WHERE available_months IS NULL;