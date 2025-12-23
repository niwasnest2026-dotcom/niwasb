-- Add sample rooms for existing properties
-- This migration adds various room types with different sharing options

-- First, let's add rooms for properties (assuming properties exist)
-- We'll use a DO block to handle cases where properties might not exist

DO $$
DECLARE
  property_record RECORD;
BEGIN
  -- Loop through all existing properties
  FOR property_record IN SELECT id, name, price FROM properties LIMIT 10
  LOOP
    -- Add Single Occupancy Room
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
    ) VALUES (
      property_record.id,
      '101',
      'Premium',
      'Single',
      property_record.price,
      1,
      1,
      1,
      true,
      true,
      true,
      150,
      'Spacious single occupancy room with attached bathroom, balcony, and AC. Perfect for students who prefer privacy.',
      true
    );

    -- Add 2 Sharing Room
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
    ) VALUES (
      property_record.id,
      '102',
      'Standard',
      '2 Sharing',
      ROUND(property_record.price * 0.65),
      2,
      2,
      1,
      true,
      false,
      true,
      180,
      'Comfortable 2-sharing room with attached bathroom and AC. Great for friends or roommates.',
      true
    );

    -- Add another 2 Sharing Room
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
    ) VALUES (
      property_record.id,
      '103',
      'Standard',
      '2 Sharing',
      ROUND(property_record.price * 0.65),
      2,
      1,
      1,
      true,
      false,
      true,
      180,
      'Comfortable 2-sharing room with attached bathroom and AC. One bed already occupied.',
      true
    );

    -- Add 3 Sharing Room
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
    ) VALUES (
      property_record.id,
      '201',
      'Standard',
      '3 Sharing',
      ROUND(property_record.price * 0.50),
      3,
      3,
      2,
      true,
      true,
      true,
      220,
      'Spacious 3-sharing room on the second floor with balcony, attached bathroom, and AC.',
      true
    );

    -- Add another 3 Sharing Room
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
    ) VALUES (
      property_record.id,
      '202',
      'Standard',
      '3 Sharing',
      ROUND(property_record.price * 0.50),
      3,
      2,
      2,
      true,
      false,
      true,
      220,
      'Well-ventilated 3-sharing room with attached bathroom and AC. Two beds available.',
      true
    );

    -- Add 4 Sharing Room
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
    ) VALUES (
      property_record.id,
      '203',
      'Economy',
      '4 Sharing',
      ROUND(property_record.price * 0.40),
      4,
      4,
      2,
      true,
      false,
      true,
      250,
      'Budget-friendly 4-sharing room with all basic amenities. Perfect for students on a budget.',
      true
    );

    -- Add another 4 Sharing Room
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
    ) VALUES (
      property_record.id,
      '301',
      'Economy',
      '4 Sharing',
      ROUND(property_record.price * 0.40),
      4,
      3,
      3,
      false,
      false,
      false,
      240,
      'Affordable 4-sharing room on the third floor. Common bathroom. Three beds available.',
      true
    );

    -- Add a Deluxe Single Room
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
    ) VALUES (
      property_record.id,
      '401',
      'Deluxe',
      'Single',
      ROUND(property_record.price * 1.2),
      1,
      1,
      4,
      true,
      true,
      true,
      180,
      'Premium deluxe single room with modern furnishing, attached bathroom, balcony with city view, and AC.',
      true
    );

    -- Add a 2 Sharing Deluxe Room
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
    ) VALUES (
      property_record.id,
      '402',
      'Deluxe',
      '2 Sharing',
      ROUND(property_record.price * 0.75),
      2,
      2,
      4,
      true,
      true,
      true,
      200,
      'Deluxe 2-sharing room with premium amenities, attached bathroom, balcony, and AC.',
      true
    );

  END LOOP;
END $$;

-- Add some sample room images (using placeholder images)
-- You can update these URLs with actual room images later
DO $$
DECLARE
  room_record RECORD;
BEGIN
  FOR room_record IN SELECT id FROM property_rooms LIMIT 30
  LOOP
    -- Add 2-3 images per room
    INSERT INTO room_images (room_id, image_url, display_order)
    VALUES 
      (room_record.id, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', 0),
      (room_record.id, 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800', 1),
      (room_record.id, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', 2);
  END LOOP;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_property_rooms_price ON property_rooms(price_per_person);

COMMENT ON COLUMN property_rooms.room_number IS 'Room number or identifier (e.g., 101, 102, A1, B2)';
COMMENT ON COLUMN property_rooms.room_type IS 'Room category: Economy, Standard, Premium, Deluxe';

-- Summary of rooms added
DO $$
DECLARE
  total_rooms INTEGER;
  total_properties INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_rooms FROM property_rooms;
  SELECT COUNT(DISTINCT property_id) INTO total_properties FROM property_rooms;
  
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Total rooms added: %', total_rooms;
  RAISE NOTICE 'Properties with rooms: %', total_properties;
END $$;