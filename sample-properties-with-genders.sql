-- Insert sample properties with different gender preferences
-- This script adds new sample properties if needed

-- First ensure the gender_preference column exists
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(20) DEFAULT 'Co-living' 
CHECK (gender_preference IN ('Male', 'Female', 'Co-living'));

-- Insert sample Male-only properties
INSERT INTO properties (
  name, description, address, city, area, property_type, price, 
  security_deposit, available_months, gender_preference, verified, secure_booking, rating, review_count
) VALUES 
(
  'Kings PG for Men', 
  'Comfortable accommodation exclusively for working professionals and students. Clean rooms, home-cooked meals, and all modern amenities.',
  '123 MG Road', 'Bangalore', 'MG Road', 'PG', 12000,
  24000, 12, 'Male', true, true, 4.2, 28
),
(
  'Elite Boys Hostel', 
  'Premium hostel facility for male students and professionals. AC rooms, gym, and study areas available.',
  '456 Brigade Road', 'Bangalore', 'Brigade Road', 'Hostel', 15000,
  30000, 6, 'Male', true, true, 4.5, 42
),
(
  'Gents Paradise PG', 
  'Affordable PG accommodation for men with all basic amenities. Near IT parks and metro station.',
  '789 Whitefield', 'Bangalore', 'Whitefield', 'PG', 10000,
  20000, 12, 'Male', true, false, 4.0, 15
);

-- Insert sample Female-only properties  
INSERT INTO properties (
  name, description, address, city, area, property_type, price,
  security_deposit, available_months, gender_preference, verified, secure_booking, rating, review_count
) VALUES
(
  'Queens PG for Women', 
  'Safe and secure accommodation for working women. 24/7 security, CCTV surveillance, and female staff.',
  '321 Koramangala', 'Bangalore', 'Koramangala', 'PG', 13000,
  26000, 12, 'Female', true, true, 4.6, 35
),
(
  'Ladies Comfort Zone', 
  'Premium PG facility exclusively for women. Modern amenities, nutritious meals, and friendly environment.',
  '654 Indiranagar', 'Bangalore', 'Indiranagar', 'PG', 16000,
  32000, 6, 'Female', true, true, 4.4, 29
),
(
  'Womens Haven Hostel', 
  'Budget-friendly hostel for female students and professionals. Safe location with easy transport access.',
  '987 Electronic City', 'Bangalore', 'Electronic City', 'Hostel', 11000,
  22000, 12, 'Female', true, false, 4.1, 18
);

-- Insert sample Co-living properties
INSERT INTO properties (
  name, description, address, city, area, property_type, price,
  security_deposit, available_months, gender_preference, verified, secure_booking, rating, review_count
) VALUES
(
  'Urban Co-living Space', 
  'Modern co-living space for professionals of all genders. Shared common areas, events, and networking opportunities.',
  '111 HSR Layout', 'Bangalore', 'HSR Layout', 'Flat', 18000,
  36000, 12, 'Co-living', true, true, 4.7, 52
),
(
  'Mixed Gender PG Hub', 
  'Contemporary PG accommodation welcoming all genders. Separate floors, common dining, and recreational facilities.',
  '222 Marathahalli', 'Bangalore', 'Marathahalli', 'PG', 14000,
  28000, 6, 'Co-living', true, true, 4.3, 31
),
(
  'Unity Living Spaces', 
  'Inclusive living space for diverse professionals. Modern amenities, flexible stays, and community events.',
  '333 Bellandur', 'Bangalore', 'Bellandur', 'Flat', 17000,
  34000, 12, 'Co-living', true, false, 4.5, 24
);

-- Add some properties in other cities too
INSERT INTO properties (
  name, description, address, city, area, property_type, price,
  security_deposit, available_months, gender_preference, verified, secure_booking, rating, review_count
) VALUES
(
  'Mumbai Male PG', 
  'Affordable PG for men in Mumbai. Close to railway station and business districts.',
  '444 Andheri West', 'Mumbai', 'Andheri West', 'PG', 20000,
  40000, 12, 'Male', true, true, 4.1, 22
),
(
  'Delhi Girls Hostel', 
  'Secure hostel for women in Delhi. Modern facilities and excellent connectivity.',
  '555 Connaught Place', 'New Delhi', 'Connaught Place', 'Hostel', 18000,
  36000, 6, 'Female', true, true, 4.4, 38
),
(
  'Pune Co-living Hub', 
  'Vibrant co-living space in Pune for all genders. Tech-friendly environment.',
  '666 Hinjewadi', 'Pune', 'Hinjewadi', 'Flat', 15000,
  30000, 12, 'Co-living', true, true, 4.6, 45
);

-- Verify the inserted data
SELECT 
  gender_preference, 
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM properties), 2) as percentage
FROM properties 
GROUP BY gender_preference
ORDER BY gender_preference;

-- Show sample of properties by gender preference
SELECT name, city, area, price, gender_preference, rating 
FROM properties 
ORDER BY gender_preference, city, name;