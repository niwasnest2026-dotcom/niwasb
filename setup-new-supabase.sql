-- NIWASNEST Database Setup Script for New Supabase Project
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  available_months INTEGER,
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  instant_book BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  secure_booking BOOLEAN DEFAULT TRUE,
  featured_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  room_type VARCHAR(100),
  sharing_type VARCHAR(50) NOT NULL,
  price_per_person INTEGER NOT NULL,
  security_deposit_per_person INTEGER,
  total_beds INTEGER NOT NULL,
  available_beds INTEGER NOT NULL,
  floor_number INTEGER,
  has_attached_bathroom BOOLEAN DEFAULT false,
  has_balcony BOOLEAN DEFAULT false,
  has_ac BOOLEAN DEFAULT false,
  room_size_sqft INTEGER,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_room_per_property UNIQUE(property_id, room_number)
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
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  booking_status VARCHAR(50) DEFAULT 'confirmed',
  check_in_date DATE,
  check_out_date DATE,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_date TIMESTAMP WITH TIME ZONE,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_property_rooms_property_id ON property_rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_property_rooms_sharing_type ON property_rooms(sharing_type);
CREATE INDEX IF NOT EXISTS idx_property_rooms_available ON property_rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_rooms_updated_at BEFORE UPDATE ON property_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update room availability when booking is made
CREATE OR REPLACE FUNCTION update_room_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.booking_status = 'confirmed' THEN
    -- Decrease available beds when new booking is confirmed
    UPDATE property_rooms 
    SET available_beds = available_beds - 1,
        updated_at = NOW()
    WHERE id = NEW.room_id AND available_beds > 0;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No available beds in room or room not found';
    END IF;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.booking_status = 'confirmed' AND NEW.booking_status = 'cancelled' THEN
      -- Increase available beds when booking is cancelled
      UPDATE property_rooms 
      SET available_beds = available_beds + 1,
          updated_at = NOW()
      WHERE id = NEW.room_id;
      
    ELSIF OLD.booking_status = 'cancelled' AND NEW.booking_status = 'confirmed' THEN
      -- Decrease available beds when cancelled booking is reconfirmed
      UPDATE property_rooms 
      SET available_beds = available_beds - 1,
          updated_at = NOW()
      WHERE id = NEW.room_id AND available_beds > 0;
      
      IF NOT FOUND THEN
        RAISE EXCEPTION 'No available beds in room for reconfirmation';
      END IF;
    END IF;
    
  ELSIF TG_OP = 'DELETE' AND OLD.booking_status = 'confirmed' THEN
    -- Increase available beds when confirmed booking is deleted
    UPDATE property_rooms 
    SET available_beds = available_beds + 1,
        updated_at = NOW()
    WHERE id = OLD.room_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update room availability
CREATE TRIGGER update_room_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_room_availability();

-- Enable Row Level Security
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

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Properties policies (public read)
CREATE POLICY "Anyone can view properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Anyone can view amenities" ON amenities FOR SELECT USING (true);
CREATE POLICY "Anyone can view property amenities" ON property_amenities FOR SELECT USING (true);
CREATE POLICY "Anyone can view property images" ON property_images FOR SELECT USING (true);
CREATE POLICY "Anyone can view property rooms" ON property_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can view room images" ON room_images FOR SELECT USING (true);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (auth.uid() = user_id);

-- Site settings policies (public read)
CREATE POLICY "Anyone can view site settings" ON site_settings FOR SELECT USING (true);

-- Insert sample amenities
INSERT INTO amenities (name, icon_name) 
SELECT 'WiFi', 'wifi' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'WiFi')
UNION ALL
SELECT 'Power Backup', 'power' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Power Backup')
UNION ALL
SELECT 'Gym', 'gym' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Gym')
UNION ALL
SELECT 'Gaming Zone', 'gaming' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Gaming Zone')
UNION ALL
SELECT 'Air Conditioning', 'ac' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Air Conditioning')
UNION ALL
SELECT 'Common Lounge', 'lounge' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Common Lounge')
UNION ALL
SELECT 'Attached Bathroom', 'FaBath' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Attached Bathroom')
UNION ALL
SELECT 'Kitchen/Dining', 'FaUtensils' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Kitchen/Dining')
UNION ALL
SELECT 'Housekeeping', 'FaBroom' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Housekeeping')
UNION ALL
SELECT 'Laundry', 'FaTshirt' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Laundry')
UNION ALL
SELECT 'Parking', 'FaParking' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Parking')
UNION ALL
SELECT 'Security', 'FaShieldAlt' WHERE NOT EXISTS (SELECT 1 FROM amenities WHERE name = 'Security');

-- Insert sample properties
INSERT INTO properties (name, description, address, city, area, price, security_deposit, available_months, rating, review_count, instant_book, verified, featured_image)
SELECT 
  'Sunrise PG for Students',
  'Modern PG accommodation with all amenities for students and working professionals. Located in prime area with easy access to colleges and IT parks.',
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
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Sunrise PG for Students')
UNION ALL
SELECT 
  'Elite Residency',
  'Premium PG with luxury amenities and spacious rooms. Perfect for professionals looking for comfort and convenience.',
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
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Elite Residency')
UNION ALL
SELECT 
  'Green Valley PG',
  'Peaceful accommodation surrounded by greenery. Ideal for students who prefer a quiet study environment.',
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
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Green Valley PG')
UNION ALL
SELECT 
  'Tech Hub Residency',
  'Located in the heart of tech corridor with modern facilities and high-speed internet.',
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
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Tech Hub Residency')
UNION ALL
SELECT 
  'Campus Connect PG',
  'Budget-friendly accommodation near major colleges and universities.',
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
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE name = 'Campus Connect PG');

-- Insert sample site settings
INSERT INTO site_settings (key, value, description)
SELECT 'contact_phone', '+91 63048 09598', 'Primary contact phone number'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'contact_phone')
UNION ALL
SELECT 'contact_email', 'niwasnest2026@gmail.com', 'Primary contact email address'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'contact_email')
UNION ALL
SELECT 'company_name', 'NIWASNEST', 'Company name'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'company_name')
UNION ALL
SELECT 'company_tagline', 'Your Perfect Stay Awaits', 'Company tagline'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE key = 'company_tagline');

-- Add sample rooms for the first property
INSERT INTO property_rooms (property_id, room_number, room_type, sharing_type, price_per_person, total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony, has_ac, room_size_sqft, description, is_available)
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
  'Spacious single occupancy room with attached bathroom, balcony, and AC.',
  true
FROM properties p 
WHERE p.name = 'Sunrise PG for Students' 
AND NOT EXISTS (SELECT 1 FROM property_rooms WHERE property_id = p.id AND room_number = '101')
UNION ALL
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
  'Comfortable 2-sharing room with attached bathroom and AC.',
  true
FROM properties p 
WHERE p.name = 'Sunrise PG for Students' 
AND NOT EXISTS (SELECT 1 FROM property_rooms WHERE property_id = p.id AND room_number = '102')
UNION ALL
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
  'Comfortable 2-sharing room with attached bathroom and AC. One bed occupied.',
  true
FROM properties p 
WHERE p.name = 'Sunrise PG for Students' 
AND NOT EXISTS (SELECT 1 FROM property_rooms WHERE property_id = p.id AND room_number = '103')
UNION ALL
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
  'Spacious 3-sharing room on the second floor with balcony.',
  true
FROM properties p 
WHERE p.name = 'Sunrise PG for Students' 
AND NOT EXISTS (SELECT 1 FROM property_rooms WHERE property_id = p.id AND room_number = '201')
UNION ALL
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
  'Budget-friendly 4-sharing room with all basic amenities.',
  true
FROM properties p 
WHERE p.name = 'Sunrise PG for Students' 
AND NOT EXISTS (SELECT 1 FROM property_rooms WHERE property_id = p.id AND room_number = '202');

-- Success message
SELECT 'Database setup completed successfully! All tables, functions, and sample data have been created.' as status;