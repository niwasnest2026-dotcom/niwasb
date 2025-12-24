-- BASIC NIWASNEST DATABASE SETUP
-- This script will work without any errors
-- Copy and paste this entire script into your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CREATE TABLES
-- =============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  property_type TEXT DEFAULT 'PG',
  price INTEGER NOT NULL,
  original_price INTEGER,
  security_deposit INTEGER,
  available_months INTEGER DEFAULT 12,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  instant_book BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT TRUE,
  secure_booking BOOLEAN DEFAULT TRUE,
  featured_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create amenities table
CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_amenities junction table
CREATE TABLE IF NOT EXISTS property_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_rooms table
CREATE TABLE IF NOT EXISTS property_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(100) DEFAULT 'Standard',
  sharing_type VARCHAR(50) NOT NULL,
  price_per_person INTEGER NOT NULL,
  security_deposit_per_person INTEGER,
  total_beds INTEGER NOT NULL,
  available_beds INTEGER NOT NULL,
  floor_number INTEGER,
  room_size_sqft INTEGER,
  has_attached_bathroom BOOLEAN DEFAULT false,
  has_balcony BOOLEAN DEFAULT false,
  has_ac BOOLEAN DEFAULT false,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_images table
CREATE TABLE IF NOT EXISTS room_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES property_rooms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES property_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(20) NOT NULL,
  sharing_type VARCHAR(50) NOT NULL,
  price_per_person INTEGER NOT NULL,
  security_deposit_per_person INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL,
  amount_due INTEGER NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'online',
  payment_status VARCHAR(50) DEFAULT 'partial',
  booking_status VARCHAR(50) DEFAULT 'confirmed',
  check_in_date DATE,
  check_out_date DATE,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Anyone can view properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Anyone can view amenities" ON amenities FOR SELECT USING (true);
CREATE POLICY "Anyone can view property amenities" ON property_amenities FOR SELECT USING (true);
CREATE POLICY "Anyone can view property images" ON property_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view property rooms" ON property_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can view room images" ON room_images FOR SELECT USING (true);
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT USING (true);

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert amenities
INSERT INTO amenities (name, icon_name) VALUES
('WiFi', 'wifi'),
('Power Backup', 'power'),
('Gym', 'gym'),
('Gaming Zone', 'gaming'),
('Air Conditioning', 'ac'),
('Common Lounge', 'lounge'),
('Attached Bathroom', 'FaBath'),
('Kitchen/Dining', 'FaUtensils'),
('Housekeeping', 'FaBroom'),
('Laundry', 'FaTshirt'),
('Parking', 'FaParking'),
('Security', 'FaShieldAlt');

-- Insert sample properties
INSERT INTO properties (
  name, description, address, city, area, price, security_deposit, available_months, 
  rating, review_count, instant_book, verified, featured_image
) VALUES
(
  'Sunrise PG for Students',
  'Modern PG accommodation with all amenities for students and working professionals.',
  '123 MG Road, Near City Mall',
  'Bangalore',
  'MG Road',
  12000,
  24000,
  12,
  4.5,
  28,
  true,
  true,
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'
),
(
  'Elite Residency',
  'Premium PG with luxury amenities and spacious rooms.',
  '456 Brigade Road, Opposite Metro Station',
  'Bangalore',
  'Brigade Road',
  15000,
  30000,
  6,
  4.7,
  42,
  true,
  true,
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80'
),
(
  'Green Valley PG',
  'Peaceful accommodation surrounded by greenery.',
  '789 Koramangala 5th Block',
  'Bangalore',
  'Koramangala',
  10000,
  20000,
  12,
  4.2,
  15,
  false,
  true,
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'
);

-- Insert sample rooms for first property
INSERT INTO property_rooms (
  property_id, room_number, room_type, sharing_type, price_per_person,
  total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
  has_ac, room_size_sqft, description
) 
SELECT 
  p.id, '101', 'Premium', 'Single', 15000,
  1, 1, 1, true, true, true, 150,
  'Spacious single occupancy room with attached bathroom, balcony, and AC.'
FROM properties p WHERE p.name = 'Sunrise PG for Students';

INSERT INTO property_rooms (
  property_id, room_number, room_type, sharing_type, price_per_person,
  total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
  has_ac, room_size_sqft, description
) 
SELECT 
  p.id, '102', 'Standard', '2 Sharing', 8500,
  2, 2, 1, true, false, true, 180,
  'Comfortable 2-sharing room with attached bathroom and AC.'
FROM properties p WHERE p.name = 'Sunrise PG for Students';

INSERT INTO property_rooms (
  property_id, room_number, room_type, sharing_type, price_per_person,
  total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
  has_ac, room_size_sqft, description
) 
SELECT 
  p.id, '103', 'Standard', '2 Sharing', 8500,
  2, 1, 1, true, false, true, 180,
  'Comfortable 2-sharing room. One bed occupied.'
FROM properties p WHERE p.name = 'Sunrise PG for Students';

INSERT INTO property_rooms (
  property_id, room_number, room_type, sharing_type, price_per_person,
  total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
  has_ac, room_size_sqft, description
) 
SELECT 
  p.id, '201', 'Standard', '3 Sharing', 6000,
  3, 3, 2, true, true, true, 220,
  'Spacious 3-sharing room on the second floor with balcony.'
FROM properties p WHERE p.name = 'Sunrise PG for Students';

INSERT INTO property_rooms (
  property_id, room_number, room_type, sharing_type, price_per_person,
  total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
  has_ac, room_size_sqft, description
) 
SELECT 
  p.id, '202', 'Economy', '4 Sharing', 4500,
  4, 4, 2, true, false, true, 250,
  'Budget-friendly 4-sharing room with all basic amenities.'
FROM properties p WHERE p.name = 'Sunrise PG for Students';

-- Insert some property amenities
INSERT INTO property_amenities (property_id, amenity_id)
SELECT p.id, a.id 
FROM properties p, amenities a 
WHERE p.name = 'Sunrise PG for Students' 
AND a.name IN ('WiFi', 'Security', 'Housekeeping', 'Gym', 'Laundry');

-- Insert site settings
INSERT INTO site_settings (key, value, description) VALUES
('site_name', 'NiwasNest', 'Website name'),
('site_tagline', 'Your Perfect Stay Awaits', 'Website tagline'),
('contact_phone', '+91 63048 09598', 'Primary contact phone number'),
('contact_email', 'niwasnest2026@gmail.com', 'Primary contact email address'),
('booking_advance_percentage', '20', 'Percentage of advance payment required'),
('support_hours', '9:00 AM - 9:00 PM', 'Customer support hours');

-- =============================================
-- SUCCESS MESSAGE
-- =============================================

SELECT 
  'Database setup completed successfully!' as status,
  (SELECT COUNT(*) FROM properties) as properties_count,
  (SELECT COUNT(*) FROM property_rooms) as rooms_count,
  (SELECT COUNT(*) FROM amenities) as amenities_count;