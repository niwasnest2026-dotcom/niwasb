/*
  # Seed Sample Properties with Duplicate Areas
  
  ## Description
  
  This migration adds 10 sample properties across multiple cities with duplicate areas
  to demonstrate the filtering functionality.
  
  ## New Data
  
  ### Properties
  - 10 properties across Bangalore, Mumbai, Delhi, and Pune
  - Multiple properties in popular areas (Koramangala, Andheri, HSR Layout, etc.)
  - Mix of PGs and Hostels
  - Different price ranges (₹8,000 - ₹25,000)
  - Various ratings and review counts
  
  ### Property Images
  - Multiple images per property from Pexels
  
  ### Property Amenities
  - Links properties to relevant amenities
  
  ## Notes
  
  - Uses generated UUIDs for property IDs
  - Amenities are linked by name lookup
  - Images use actual Pexels URLs for room/accommodation photos
*/

-- Insert 10 sample properties
DO $$
DECLARE
  prop1_id uuid := gen_random_uuid();
  prop2_id uuid := gen_random_uuid();
  prop3_id uuid := gen_random_uuid();
  prop4_id uuid := gen_random_uuid();
  prop5_id uuid := gen_random_uuid();
  prop6_id uuid := gen_random_uuid();
  prop7_id uuid := gen_random_uuid();
  prop8_id uuid := gen_random_uuid();
  prop9_id uuid := gen_random_uuid();
  prop10_id uuid := gen_random_uuid();
BEGIN
  -- Property 1: Koramangala, Bangalore
  INSERT INTO properties (id, name, description, property_type, price, address, city, area, original_price, rating, review_count, instant_book, verified, secure_booking, featured_image)
  VALUES (
    prop1_id,
    'Modern PG in Koramangala',
    'Spacious rooms with modern amenities in the heart of Koramangala. Perfect for working professionals.',
    'PG',
    12000,
    '5th Block, Koramangala',
    'Bangalore',
    'Koramangala',
    15000,
    4.5,
    128,
    true,
    true,
    true,
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'
  );

  -- Property 2: Koramangala, Bangalore (duplicate area)
  INSERT INTO properties (id, name, description, property_type, price, address, city, area, original_price, rating, review_count, instant_book, verified, secure_booking, featured_image)
  VALUES (
    prop2_id,
    'Comfort Stay Koramangala',
    'Affordable PG with all basic amenities. Great food and housekeeping services.',
    'PG',
    10000,
    '6th Block, Koramangala',
    'Bangalore',
    'Koramangala',
    12000,
    4.2,
    95,
    false,
    true,
    true,
    'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'
  );

  -- Property 3: HSR Layout, Bangalore
  INSERT INTO properties (id, name, description, property_type, price, address, city, area, original_price, rating, review_count, instant_book, verified, secure_booking, featured_image)
  VALUES (
    prop3_id,
    'Elite Hostel HSR',
    'Premium hostel with gym and common areas. Perfect for students and young professionals.',
    'Hostel',
    8500,
    'Sector 1, HSR Layout',
    'Bangalore',
    'HSR Layout',
    10000,
    4.7,
    156,
    true,
    true,
    true,
    'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg'
  );

  -- Property 4: HSR Layout, Bangalore (duplicate area)
  INSERT INTO properties (id, name, description, property_type, price, address, city, area, original_price, rating, review_count, instant_book, verified, secure_booking, featured_image)
  VALUES (
    prop4_id,
    'Sunrise PG HSR Layout',
    'Comfortable living space with excellent connectivity. Food and WiFi included.',
    'PG',
    11500,
    'Sector 2, HSR Layout',
    'Bangalore',
    'HSR Layout',
    13000,
    4.3,
    87,
    true,
    true,
    true,
    'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg'
  );

  -- Property 5: Andheri, Mumbai
  INSERT INTO properties (id, name, description, property_type, price, address, city, area, original_price, rating, review_count, instant_book, verified, secure_booking, featured_image)
  VALUES (
    prop5_id,
    'Urban Nest Andheri',
    'Well-furnished rooms near metro station. Perfect location for IT professionals.',
    'PG',
    15000,
    'Andheri East',
    'Mumbai',
    'Andheri',
    18000,
    4.6,
    142,
    true,
    true,
    true,
    'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg'
  );

  -- Property 6: Andheri, Mumbai (duplicate area)
  INSERT INTO properties (id, name, description, property_type, price, address, city, area, original_price, rating, review_count, instant_book, verified, secure_booking, featured_image)
  VALUES (
    prop6_id,
    'Skyline Residency Andheri',
    'Luxury PG with AC rooms and premium facilities. 24/7 security and power backup.',
    'PG',
    18000,
    'Andheri West',
    'Mumbai',
    'Andheri',
    22000,
    4.8,
    203,
    true,
    true,
    true,
    'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg'
  );

  -- Property 7: Powai, Mumbai
  INSERT INTO properties (id, name, description, property_type, price, address, city, area, original_price, rating, review_count, instant_book, verified, secure_booking, featured_image)
  VALUES (
    prop7_id,
    'Lake View Hostel Powai',
    'Beautiful hostel with lake views. Community kitchen and common areas available.',
    'Hostel',
    13000,
    'Hiranandani, Powai',
    'Mumbai',
    'Powai',
    16000,
    4.4,
    78,
    false,
    true,
    true,
    'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg'
  );

  -- Property 8: Connaught Place, Delhi
  INSERT INTO properties (id, name, description, property_type, price, address, city, area, original_price, rating, review_count, instant_book, verified, secure_booking, featured_image)
  VALUES (
    prop8_id,
    'Central Hub CP',
    'Prime location in the heart of Delhi. Walking distance to metro and shopping.',
    'PG',
    14000,
    'Near Rajiv Chowk',
    'Delhi',
    'Connaught Place',
    17000,
    4.1,
    92,
    true,
    true,
    true,
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
  );

  -- Property 9: Kothrud, Pune
  INSERT INTO properties (id, name, description, property_type, price, address, city, area, original_price, rating, review_count, instant_book, verified, secure_booking, featured_image)
  VALUES (
    prop9_id,
    'Student Paradise Kothrud',
    'Budget-friendly PG near colleges. WiFi and food included in rent.',
    'PG',
    9000,
    'Near MIT College, Kothrud',
    'Pune',
    'Kothrud',
    11000,
    4.0,
    67,
    false,
    true,
    true,
    'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg'
  );

  -- Property 10: Hinjewadi, Pune
  INSERT INTO properties (id, name, description, property_type, price, address, city, area, original_price, rating, review_count, instant_book, verified, secure_booking, featured_image)
  VALUES (
    prop10_id,
    'Tech Park Residency',
    'Premium PG near IT parks. Fully furnished with modern amenities and housekeeping.',
    'PG',
    16000,
    'Rajiv Gandhi Infotech Park, Hinjewadi',
    'Pune',
    'Hinjewadi',
    20000,
    4.9,
    234,
    true,
    true,
    true,
    'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg'
  );

  -- Insert property images (3-4 images per property)
  INSERT INTO property_images (property_id, image_url, display_order) VALUES
    -- Property 1 images
    (prop1_id, 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg', 1),
    (prop1_id, 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg', 2),
    (prop1_id, 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg', 3),
    
    -- Property 2 images
    (prop2_id, 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg', 1),
    (prop2_id, 'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg', 2),
    (prop2_id, 'https://images.pexels.com/photos/1457846/pexels-photo-1457846.jpeg', 3),
    
    -- Property 3 images
    (prop3_id, 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg', 1),
    (prop3_id, 'https://images.pexels.com/photos/276671/pexels-photo-276671.jpeg', 2),
    (prop3_id, 'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg', 3),
    
    -- Property 4 images
    (prop4_id, 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg', 1),
    (prop4_id, 'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg', 2),
    (prop4_id, 'https://images.pexels.com/photos/1743366/pexels-photo-1743366.jpeg', 3),
    
    -- Property 5 images
    (prop5_id, 'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg', 1),
    (prop5_id, 'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg', 2),
    (prop5_id, 'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg', 3),
    
    -- Property 6 images
    (prop6_id, 'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg', 1),
    (prop6_id, 'https://images.pexels.com/photos/2635038/pexels-photo-2635038.jpeg', 2),
    (prop6_id, 'https://images.pexels.com/photos/2647714/pexels-photo-2647714.jpeg', 3),
    
    -- Property 7 images
    (prop7_id, 'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg', 1),
    (prop7_id, 'https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg', 2),
    (prop7_id, 'https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg', 3),
    
    -- Property 8 images
    (prop8_id, 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', 1),
    (prop8_id, 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg', 2),
    (prop8_id, 'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg', 3),
    
    -- Property 9 images
    (prop9_id, 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg', 1),
    (prop9_id, 'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg', 2),
    (prop9_id, 'https://images.pexels.com/photos/1080693/pexels-photo-1080693.jpeg', 3),
    
    -- Property 10 images
    (prop10_id, 'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg', 1),
    (prop10_id, 'https://images.pexels.com/photos/1457849/pexels-photo-1457849.jpeg', 2),
    (prop10_id, 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg', 3);

  -- Link properties to amenities
  -- Property 1: WiFi, AC, Laundry, Security, Food
  INSERT INTO property_amenities (property_id, amenity_id)
  SELECT prop1_id, id FROM amenities WHERE name IN ('WiFi', 'Air Conditioning', 'Laundry', 'Security', 'Food Included');

  -- Property 2: WiFi, Laundry, Security, Food, Housekeeping
  INSERT INTO property_amenities (property_id, amenity_id)
  SELECT prop2_id, id FROM amenities WHERE name IN ('WiFi', 'Laundry', 'Security', 'Food Included', 'Housekeeping');

  -- Property 3: WiFi, Gym, Security, Laundry, Power Backup
  INSERT INTO property_amenities (property_id, amenity_id)
  SELECT prop3_id, id FROM amenities WHERE name IN ('WiFi', 'Gym', 'Security', 'Laundry', 'Power Backup');

  -- Property 4: WiFi, AC, Food, Security, Power Backup
  INSERT INTO property_amenities (property_id, amenity_id)
  SELECT prop4_id, id FROM amenities WHERE name IN ('WiFi', 'Air Conditioning', 'Food Included', 'Security', 'Power Backup');

  -- Property 5: WiFi, AC, Parking, Security, Housekeeping, Attached Bathroom
  INSERT INTO property_amenities (property_id, amenity_id)
  SELECT prop5_id, id FROM amenities WHERE name IN ('WiFi', 'Air Conditioning', 'Parking', 'Security', 'Housekeeping', 'Attached Bathroom');

  -- Property 6: All amenities (luxury)
  INSERT INTO property_amenities (property_id, amenity_id)
  SELECT prop6_id, id FROM amenities;

  -- Property 7: WiFi, Laundry, Security, Gym, Parking
  INSERT INTO property_amenities (property_id, amenity_id)
  SELECT prop7_id, id FROM amenities WHERE name IN ('WiFi', 'Laundry', 'Security', 'Gym', 'Parking');

  -- Property 8: WiFi, AC, Security, Power Backup, Attached Bathroom
  INSERT INTO property_amenities (property_id, amenity_id)
  SELECT prop8_id, id FROM amenities WHERE name IN ('WiFi', 'Air Conditioning', 'Security', 'Power Backup', 'Attached Bathroom');

  -- Property 9: WiFi, Food, Security, Laundry
  INSERT INTO property_amenities (property_id, amenity_id)
  SELECT prop9_id, id FROM amenities WHERE name IN ('WiFi', 'Food Included', 'Security', 'Laundry');

  -- Property 10: WiFi, AC, Gym, Parking, Housekeeping, Security, Power Backup, Attached Bathroom
  INSERT INTO property_amenities (property_id, amenity_id)
  SELECT prop10_id, id FROM amenities WHERE name IN ('WiFi', 'Air Conditioning', 'Gym', 'Parking', 'Housekeeping', 'Security', 'Power Backup', 'Attached Bathroom');

END $$;