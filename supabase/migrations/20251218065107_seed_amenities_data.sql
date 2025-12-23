/*
  # Seed Amenities Data
  
  ## Description
  
  This migration adds common amenities to the amenities table that can be assigned to properties.
  
  ## New Data
  
  ### Amenities
  - WiFi
  - Air Conditioning
  - Laundry
  - Parking
  - Gym
  - Security
  - Power Backup
  - Housekeeping
  - Food Included
  - Attached Bathroom
  
  ## Notes
  
  - Uses conditional INSERT to prevent duplicate entries
  - Each amenity has a name and icon identifier
*/

-- Insert common amenities only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'WiFi') THEN
    INSERT INTO amenities (name, icon_name) VALUES ('WiFi', 'FaWifi');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Air Conditioning') THEN
    INSERT INTO amenities (name, icon_name) VALUES ('Air Conditioning', 'FaSnowflake');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Laundry') THEN
    INSERT INTO amenities (name, icon_name) VALUES ('Laundry', 'FaTshirt');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Parking') THEN
    INSERT INTO amenities (name, icon_name) VALUES ('Parking', 'FaParking');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Gym') THEN
    INSERT INTO amenities (name, icon_name) VALUES ('Gym', 'FaDumbbell');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Security') THEN
    INSERT INTO amenities (name, icon_name) VALUES ('Security', 'FaShieldAlt');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Power Backup') THEN
    INSERT INTO amenities (name, icon_name) VALUES ('Power Backup', 'FaBolt');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Housekeeping') THEN
    INSERT INTO amenities (name, icon_name) VALUES ('Housekeeping', 'FaBroom');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Food Included') THEN
    INSERT INTO amenities (name, icon_name) VALUES ('Food Included', 'FaUtensils');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Attached Bathroom') THEN
    INSERT INTO amenities (name, icon_name) VALUES ('Attached Bathroom', 'FaBath');
  END IF;
END $$;