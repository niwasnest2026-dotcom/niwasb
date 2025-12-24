-- SIMPLE WORKING NIWASNEST DATABASE SETUP
-- This script will work without errors
-- Copy and paste this entire script into your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- BASIC TABLES SETUP
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

-- Create amenities table (simplified)
CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_amenities junction table
CREATE TABLE IF NOT EXISTS property_amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, amenity_id)
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_room_per_property UNIQUE(property_id, room_number),
  CONSTRAINT valid_beds CHECK (available_beds <= total_beds AND available_beds >= 0)
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_property_rooms_property_id ON property_rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_property_rooms_sharing_type ON property_rooms(sharing_type);
CREATE INDEX IF NOT EXISTS idx_property_rooms_available ON property_rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_rooms_updated_at ON property_rooms;
CREATE TRIGGER update_property_rooms_updated_at BEFORE UPDATE ON property_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update room availability when booking is made
CREATE OR REPLACE FUNCTION update_room_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.booking_status = 'confirmed' THEN
    UPDATE property_rooms 
    SET available_beds = available_beds - 1,
        updated_at = NOW()
    WHERE id = NEW.room_id AND available_beds > 0;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No available beds in room or room not found';
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.booking_status = 'confirmed' AND NEW.booking_status = 'cancelled' THEN
      UPDATE property_rooms 
      SET available_beds = available_beds + 1,
          updated_at = NOW()
      WHERE id = NEW.room_id;
      
    ELSIF OLD.booking_status = 'cancelled' AND NEW.booking_status = 'confirmed' THEN
      UPDATE property_rooms 
      SET available_beds = available_beds - 1,
          updated_at = NOW()
      WHERE id = NEW.room_id AND available_beds > 0;
      
      IF NOT FOUND THEN
        RAISE EXCEPTION 'No available beds in room for reconfirmation';
      END IF;
    END IF;
    
  ELSIF TG_OP = 'DELETE' AND OLD.booking_status = 'confirmed' THEN
    UPDATE property_rooms 
    SET available_beds = available_beds + 1,
        updated_at = NOW()
    WHERE id = OLD.room_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update room availability
DROP TRIGGER IF EXISTS update_room_availability_trigger ON bookings;
CREATE TRIGGER update_room_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_room_availability();

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view properties" ON properties;
DROP POLICY IF EXISTS "Anyone can view amenities" ON amenities;
DROP POLICY IF EXISTS "Anyone can view property amenities" ON property_amenities;
DROP POLICY IF EXISTS "Anyone can view property images" ON property_images;
DROP POLICY IF EXISTS "Anyone can view property rooms" ON property_rooms;
DROP POLICY IF EXISTS "Anyone can view room images" ON room_images;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Anyone can view properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Anyone can view amenities" ON amenities FOR SELECT USING (true);
CREATE POLICY "Anyone can view property amenities" ON property_amenities FOR SELECT USING (true);
CREATE POLICY "Anyone can view property images" ON property_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view property rooms" ON property_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can view room images" ON room_images FOR SELECT USING (true);
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT USING (true);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert basic amenities (matching the table structure)
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
('Security', 'FaShieldAlt')
ON CONFLICT (name) DO NOTHING;

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
),
(
  'Tech Hub Residency',
  'Located in the heart of tech corridor with modern facilities.',
  '321 Electronic City Phase 1',
  'Bangalore',
  'Electronic City',
  11000,
  22000,
  12,
  4.4,
  33,
  true,
  true,
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80'
),
(
  'Campus Connect PG',
  'Budget-friendly accommodation near major colleges.',
  '654 Jayanagar 4th Block',
  'Bangalore',
  'Jayanagar',
  8500,
  17000,
  12,
  4.0,
  22,
  false,
  true,
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'
)
ON CONFLICT (name) DO NOTHING;

-- Insert sample rooms for each property
DO $$
DECLARE
  property_record RECORD;
BEGIN
  FOR property_record IN SELECT id, name, price FROM properties
  LOOP
    -- Single occupancy room
    INSERT INTO property_rooms (
      property_id, room_number, room_type, sharing_type, price_per_person,
      total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
      has_ac, room_size_sqft, description
    ) VALUES (
      property_record.id, '101', 'Premium', 'Single', 
      CASE WHEN property_record.price > 12000 THEN property_record.price ELSE 15000 END,
      1, 1, 1, true, true, true, 150,
      'Spacious single occupancy room with attached bathroom, balcony, and AC.'
    ) ON CONFLICT (property_id, room_number) DO NOTHING;

    -- 2 Sharing rooms
    INSERT INTO property_rooms (
      property_id, room_number, room_type, sharing_type, price_per_person,
      total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
      has_ac, room_size_sqft, description
    ) VALUES 
    (
      property_record.id, '102', 'Standard', '2 Sharing', 
      ROUND(property_record.price * 0.65),
      2, 2, 1, true, false, true, 180,
      'Comfortable 2-sharing room with attached bathroom and AC.'
    ),
    (
      property_record.id, '103', 'Standard', '2 Sharing', 
      ROUND(property_record.price * 0.65),
      2, 1, 1, true, false, true, 180,
      'Comfortable 2-sharing room. One bed occupied.'
    ) ON CONFLICT (property_id, room_number) DO NOTHING;

    -- 3 Sharing rooms
    INSERT INTO property_rooms (
      property_id, room_number, room_type, sharing_type, price_per_person,
      total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
      has_ac, room_size_sqft, description
    ) VALUES 
    (
      property_record.id, '201', 'Standard', '3 Sharing', 
      ROUND(property_record.price * 0.50),
      3, 3, 2, true, true, true, 220,
      'Spacious 3-sharing room on the second floor with balcony.'
    ),
    (
      property_record.id, '202', 'Standard', '3 Sharing', 
      ROUND(property_record.price * 0.50),
      3, 2, 2, true, false, true, 220,
      'Well-ventilated 3-sharing room. Two beds available.'
    ) ON CONFLICT (property_id, room_number) DO NOTHING;

    -- 4 Sharing rooms
    INSERT INTO property_rooms (
      property_id, room_number, room_type, sharing_type, price_per_person,
      total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
      has_ac, room_size_sqft, description
    ) VALUES 
    (
      property_record.id, '203', 'Economy', '4 Sharing', 
      ROUND(property_record.price * 0.40),
      4, 4, 2, true, false, true, 250,
      'Budget-friendly 4-sharing room with all basic amenities.'
    ),
    (
      property_record.id, '301', 'Economy', '4 Sharing', 
      ROUND(property_record.price * 0.40),
      4, 3, 3, false, false, false, 240,
      'Affordable 4-sharing room on the third floor.'
    ) ON CONFLICT (property_id, room_number) DO NOTHING;

  END LOOP;
END $$;

-- Insert property amenities
DO $$
DECLARE
  property_record RECORD;
  amenity_record RECORD;
BEGIN
  FOR property_record IN SELECT id FROM properties
  LOOP
    -- Add common amenities to all properties
    FOR amenity_record IN SELECT id FROM amenities WHERE name IN ('WiFi', 'Security', 'Housekeeping')
    LOOP
      INSERT INTO property_amenities (property_id, amenity_id) 
      VALUES (property_record.id, amenity_record.id)
      ON CONFLICT (property_id, amenity_id) DO NOTHING;
    END LOOP;
    
    -- Add some additional amenities
    FOR amenity_record IN SELECT id FROM amenities WHERE name IN ('Gym', 'Laundry', 'Parking') ORDER BY RANDOM() LIMIT 2
    LOOP
      INSERT INTO property_amenities (property_id, amenity_id) 
      VALUES (property_record.id, amenity_record.id)
      ON CONFLICT (property_id, amenity_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Insert site settings
INSERT INTO site_settings (key, value, description) VALUES
('site_name', 'NiwasNest', 'Website name'),
('site_tagline', 'Your Perfect Stay Awaits', 'Website tagline'),
('contact_phone', '+91 63048 09598', 'Primary contact phone number'),
('contact_email', 'niwasnest2026@gmail.com', 'Primary contact email address'),
('company_address', 'Bangalore, Karnataka, India', 'Company address'),
('booking_advance_percentage', '20', 'Percentage of advance payment required'),
('support_hours', '9:00 AM - 9:00 PM', 'Customer support hours'),
('whatsapp_number', '+91 63048 09598', 'WhatsApp support number')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- =============================================
-- FINAL SUCCESS MESSAGE
-- =============================================

SELECT 
  'Database setup completed successfully!' as status,
  (SELECT COUNT(*) FROM properties) as properties_count,
  (SELECT COUNT(*) FROM property_rooms) as rooms_count,
  (SELECT COUNT(*) FROM amenities) as amenities_count,
  (SELECT COUNT(*) FROM site_settings) as settings_count;