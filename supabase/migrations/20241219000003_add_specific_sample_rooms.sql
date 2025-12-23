-- Add specific sample rooms for testing
-- This adds rooms to the first few properties with realistic data

-- Sample rooms for Property 1 (if it exists)
INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  '101',
  'Premium',
  'Single',
  15000,
  1,
  1,
  1,
  true,
  true,
  true,
  150,
  'Spacious single occupancy room with attached bathroom, balcony, and AC. Perfect for students who prefer privacy.',
  true
FROM properties p
LIMIT 1;

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  '102',
  'Standard',
  '2 Sharing',
  8500,
  2,
  2,
  1,
  true,
  false,
  true,
  180,
  'Comfortable 2-sharing room with attached bathroom and AC. Great for friends or roommates.',
  true
FROM properties p
LIMIT 1;

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  '103',
  'Standard',
  '2 Sharing',
  8500,
  2,
  1,
  1,
  true,
  false,
  true,
  180,
  'Comfortable 2-sharing room with attached bathroom and AC. One bed already occupied.',
  true
FROM properties p
LIMIT 1;

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  '201',
  'Standard',
  '3 Sharing',
  6000,
  3,
  3,
  2,
  true,
  true,
  true,
  220,
  'Spacious 3-sharing room on the second floor with balcony, attached bathroom, and AC.',
  true
FROM properties p
LIMIT 1;

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  '202',
  'Economy',
  '4 Sharing',
  4500,
  4,
  4,
  2,
  true,
  false,
  true,
  250,
  'Budget-friendly 4-sharing room with all basic amenities. Perfect for students on a budget.',
  true
FROM properties p
LIMIT 1;

-- Add rooms for second property (if it exists)
INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  'A1',
  'Deluxe',
  'Single',
  18000,
  1,
  1,
  1,
  true,
  true,
  true,
  160,
  'Premium deluxe single room with modern furnishing and city view.',
  true
FROM properties p
OFFSET 1
LIMIT 1;

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  'A2',
  'Standard',
  '2 Sharing',
  9000,
  2,
  2,
  1,
  true,
  true,
  true,
  190,
  'Well-appointed 2-sharing room with balcony and all modern amenities.',
  true
FROM properties p
OFFSET 1
LIMIT 1;

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  'B1',
  'Standard',
  '3 Sharing',
  6500,
  3,
  2,
  2,
  true,
  false,
  true,
  230,
  'Spacious 3-sharing room with attached bathroom. Two beds available.',
  true
FROM properties p
OFFSET 1
LIMIT 1;

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  'B2',
  'Economy',
  '4 Sharing',
  5000,
  4,
  3,
  2,
  false,
  false,
  true,
  260,
  'Affordable 4-sharing room with common bathroom. Three beds available.',
  true
FROM properties p
OFFSET 1
LIMIT 1;

-- Add rooms for third property (if it exists)
INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  '1A',
  'Premium',
  'Single',
  16500,
  1,
  1,
  1,
  true,
  true,
  true,
  155,
  'Premium single room with modern amenities and excellent ventilation.',
  true
FROM properties p
OFFSET 2
LIMIT 1;

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  '1B',
  'Standard',
  '2 Sharing',
  8000,
  2,
  1,
  1,
  true,
  false,
  true,
  175,
  'Cozy 2-sharing room with attached bathroom. One bed available.',
  true
FROM properties p
OFFSET 2
LIMIT 1;

INSERT INTO property_rooms (
  property_id,
  room_number,
  room_type,
  sharing_type,
  price_per_person,
  total_beds,
  available_beds,
  floor_number,
  has_attached_bathroom,
  has_balcony,
  has_ac,
  room_size_sqft,
  description,
  is_available
) 
SELECT 
  p.id,
  '2A',
  'Standard',
  '3 Sharing',
  5800,
  3,
  3,
  2,
  true,
  true,
  true,
  210,
  'Bright 3-sharing room with balcony and attached bathroom.',
  true
FROM properties p
OFFSET 2
LIMIT 1;

-- Add sample room images for the rooms we just created
INSERT INTO room_images (room_id, image_url, display_order)
SELECT 
  pr.id,
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
  0
FROM property_rooms pr
WHERE pr.room_number IN ('101', 'A1', '1A');

INSERT INTO room_images (room_id, image_url, display_order)
SELECT 
  pr.id,
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
  1
FROM property_rooms pr
WHERE pr.room_number IN ('101', 'A1', '1A');

INSERT INTO room_images (room_id, image_url, display_order)
SELECT 
  pr.id,
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
  0
FROM property_rooms pr
WHERE pr.sharing_type = '2 Sharing';

INSERT INTO room_images (room_id, image_url, display_order)
SELECT 
  pr.id,
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  0
FROM property_rooms pr
WHERE pr.sharing_type IN ('3 Sharing', '4 Sharing');

-- Log the results
DO $$
DECLARE
  room_count INTEGER;
  image_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO room_count FROM property_rooms;
  SELECT COUNT(*) INTO image_count FROM room_images;
  
  RAISE NOTICE 'Sample rooms migration completed!';
  RAISE NOTICE 'Total rooms in database: %', room_count;
  RAISE NOTICE 'Total room images: %', image_count;
END $$;