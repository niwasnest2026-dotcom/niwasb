-- COMPLETE NIWASNEST DATABASE SETUP
-- This script creates all tables, functions, triggers, policies, and sample data
-- Copy and paste this entire script into your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USER MANAGEMENT TABLES
-- =============================================

-- Create profiles table (extends Supabase auth.users)
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

-- =============================================
-- PROPERTY MANAGEMENT TABLES
-- =============================================

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  property_type TEXT DEFAULT 'PG',
  price INTEGER NOT NULL, -- Base price (will be overridden by room prices)
  original_price INTEGER,
  security_deposit INTEGER, -- Default security deposit
  available_months INTEGER DEFAULT 12,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  instant_book BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT TRUE,
  secure_booking BOOLEAN DEFAULT TRUE,
  featured_image TEXT,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  property_rules TEXT,
  nearby_places TEXT, -- JSON string of nearby places
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create amenities table
CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- 'general', 'room', 'common', 'safety'
  description TEXT,
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
  image_type TEXT DEFAULT 'general', -- 'general', 'room', 'common_area', 'exterior'
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROOM MANAGEMENT TABLES
-- =============================================

-- Create property_rooms table
CREATE TABLE IF NOT EXISTS property_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(100) DEFAULT 'Standard', -- 'Economy', 'Standard', 'Premium', 'Deluxe'
  sharing_type VARCHAR(50) NOT NULL, -- 'Single', '2 Sharing', '3 Sharing', '4 Sharing', etc.
  price_per_person INTEGER NOT NULL,
  security_deposit_per_person INTEGER, -- Room-specific security deposit per person
  total_beds INTEGER NOT NULL,
  available_beds INTEGER NOT NULL,
  floor_number INTEGER,
  room_size_sqft INTEGER,
  has_attached_bathroom BOOLEAN DEFAULT false,
  has_balcony BOOLEAN DEFAULT false,
  has_ac BOOLEAN DEFAULT false,
  has_wifi BOOLEAN DEFAULT true,
  has_study_table BOOLEAN DEFAULT true,
  has_wardrobe BOOLEAN DEFAULT true,
  has_window BOOLEAN DEFAULT true,
  furnishing_type TEXT DEFAULT 'Semi-Furnished', -- 'Unfurnished', 'Semi-Furnished', 'Fully-Furnished'
  description TEXT,
  special_features TEXT, -- JSON string of special features
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
  image_type TEXT DEFAULT 'room', -- 'room', 'bathroom', 'balcony', 'view'
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BOOKING MANAGEMENT TABLES
-- =============================================

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES property_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Guest Information
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(20) NOT NULL,
  guest_emergency_contact VARCHAR(20),
  guest_id_proof_type VARCHAR(50), -- 'Aadhar', 'PAN', 'Passport', 'Driving License'
  guest_id_proof_number VARCHAR(100),
  
  -- Booking Details
  sharing_type VARCHAR(50) NOT NULL,
  price_per_person INTEGER NOT NULL,
  security_deposit_per_person INTEGER NOT NULL,
  total_amount INTEGER NOT NULL, -- Total amount for the booking period
  amount_paid INTEGER NOT NULL, -- 20% upfront payment
  amount_due INTEGER NOT NULL, -- 80% to be paid to owner
  
  -- Payment Information
  payment_method VARCHAR(50) NOT NULL DEFAULT 'online',
  payment_status VARCHAR(50) DEFAULT 'partial', -- 'pending', 'partial', 'completed', 'failed', 'refunded'
  payment_reference VARCHAR(255), -- Payment gateway reference
  booking_status VARCHAR(50) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled', 'completed'
  
  -- Dates
  check_in_date DATE,
  check_out_date DATE,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional Information
  special_requests TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- USER INTERACTION TABLES
-- =============================================

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  pros TEXT,
  cons TEXT,
  is_verified BOOLEAN DEFAULT false, -- True if user actually stayed there
  is_approved BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, user_id) -- One review per user per property
);

-- =============================================
-- SYSTEM CONFIGURATION TABLES
-- =============================================

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  data_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  category TEXT DEFAULT 'general', -- 'general', 'payment', 'email', 'sms'
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Can be accessed by frontend
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification_templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key TEXT UNIQUE NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT,
  body_text TEXT NOT NULL,
  body_html TEXT,
  template_type TEXT NOT NULL, -- 'email', 'sms', 'push'
  variables TEXT, -- JSON array of available variables
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_rating ON properties(rating);
CREATE INDEX IF NOT EXISTS idx_properties_verified ON properties(verified);

-- Rooms indexes
CREATE INDEX IF NOT EXISTS idx_property_rooms_property_id ON property_rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_property_rooms_sharing_type ON property_rooms(sharing_type);
CREATE INDEX IF NOT EXISTS idx_property_rooms_available ON property_rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_property_rooms_price ON property_rooms(price_per_person);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in_date);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

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

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update room availability when booking is made
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
DROP TRIGGER IF EXISTS update_room_availability_trigger ON bookings;
CREATE TRIGGER update_room_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_room_availability();

-- Function to update property rating when review is added/updated
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_count INTEGER;
BEGIN
  -- Calculate new average rating and count
  SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)
  INTO avg_rating, review_count
  FROM reviews 
  WHERE property_id = COALESCE(NEW.property_id, OLD.property_id) 
    AND is_approved = true;
  
  -- Update property with new rating
  UPDATE properties 
  SET rating = COALESCE(avg_rating, 0.0),
      review_count = review_count,
      updated_at = NOW()
  WHERE id = COALESCE(NEW.property_id, OLD.property_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update property rating
DROP TRIGGER IF EXISTS update_property_rating_trigger ON reviews;
CREATE TRIGGER update_property_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_property_rating();

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
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
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
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can manage own reviews" ON reviews;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

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

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can manage own reviews" ON reviews FOR ALL USING (auth.uid() = user_id);

-- Site settings policies (public read for public settings)
CREATE POLICY "Anyone can view public site settings" ON site_settings FOR SELECT USING (is_public = true);

-- =============================================
-- SAMPLE DATA INSERTION
-- =============================================

-- Insert comprehensive amenities
INSERT INTO amenities (name, icon_name, category, description) VALUES
('WiFi', 'wifi', 'general', 'High-speed internet connectivity'),
('Power Backup', 'power', 'general', '24/7 power backup facility'),
('Gym', 'gym', 'common', 'Fully equipped fitness center'),
('Gaming Zone', 'gaming', 'common', 'Recreation area with games'),
('Air Conditioning', 'ac', 'room', 'Individual AC in rooms'),
('Common Lounge', 'lounge', 'common', 'Shared relaxation area'),
('Attached Bathroom', 'FaBath', 'room', 'Private bathroom in room'),
('Kitchen/Dining', 'FaUtensils', 'common', 'Shared cooking and dining area'),
('Housekeeping', 'FaBroom', 'general', 'Regular cleaning service'),
('Laundry', 'FaTshirt', 'general', 'Washing and drying facilities'),
('Parking', 'FaParking', 'general', 'Vehicle parking space'),
('Security', 'FaShieldAlt', 'safety', '24/7 security guard'),
('CCTV', 'camera', 'safety', 'Surveillance cameras'),
('Study Room', 'book', 'common', 'Quiet study area'),
('Balcony', 'balcony', 'room', 'Private or shared balcony'),
('Elevator', 'elevator', 'general', 'Lift facility'),
('Water Purifier', 'water', 'general', 'Clean drinking water'),
('Mess/Food', 'food', 'general', 'Meal service available')
ON CONFLICT (name) DO NOTHING;

-- Insert sample properties with comprehensive data
INSERT INTO properties (
  name, description, address, city, area, price, security_deposit, available_months, 
  rating, review_count, instant_book, verified, featured_image, owner_name, owner_phone, 
  owner_email, property_rules, nearby_places
) VALUES
(
  'Sunrise PG for Students',
  'Modern PG accommodation with all amenities for students and working professionals. Located in prime area with easy access to colleges and IT parks. Features include spacious rooms, high-speed WiFi, nutritious meals, and 24/7 security.',
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
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
  'Rajesh Kumar',
  '+91 98765 43210',
  'rajesh@sunrisepg.com',
  'No smoking, No alcohol, Visitors allowed till 9 PM, Maintain cleanliness',
  '["Metro Station - 0.2km", "City Mall - 0.1km", "Christ University - 2km", "Infosys - 5km", "Restaurants - 0.3km"]'
),
(
  'Elite Residency',
  'Premium PG with luxury amenities and spacious rooms. Perfect for professionals looking for comfort and convenience. Features premium furnishing, gym, gaming zone, and excellent food quality.',
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
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'Priya Sharma',
  '+91 87654 32109',
  'priya@eliteresidency.com',
  'No smoking, No alcohol, Visitors allowed till 10 PM, Professional environment',
  '["Metro Station - 0.1km", "Brigade Road Shopping - 0.2km", "Commercial Street - 0.5km", "TCS - 3km", "Cafes - 0.1km"]'
),
(
  'Green Valley PG',
  'Peaceful accommodation surrounded by greenery. Ideal for students who prefer a quiet study environment. Budget-friendly with all essential amenities and homely atmosphere.',
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
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'Suresh Reddy',
  '+91 76543 21098',
  'suresh@greenvalleypg.com',
  'No smoking, No alcohol, Quiet hours after 10 PM, Study-friendly environment',
  '["Forum Mall - 1km", "Koramangala Social - 0.8km", "NIMHANS - 2km", "Wipro - 4km", "Restaurants - 0.5km"]'
),
(
  'Tech Hub Residency',
  'Located in the heart of tech corridor with modern facilities and high-speed internet. Perfect for IT professionals with easy access to major tech companies.',
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
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
  'Amit Patel',
  '+91 65432 10987',
  'amit@techhubresidency.com',
  'No smoking, No alcohol, Professional environment, Visitors allowed till 9 PM',
  '["Infosys - 2km", "TCS - 1.5km", "Wipro - 3km", "Electronic City Metro - 1km", "Food Court - 0.5km"]'
),
(
  'Campus Connect PG',
  'Budget-friendly accommodation near major colleges and universities. Perfect for students with affordable pricing and student-friendly amenities.',
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
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'Lakshmi Devi',
  '+91 54321 09876',
  'lakshmi@campusconnectpg.com',
  'No smoking, No alcohol, Student-friendly rules, Study groups allowed',
  '["Jayanagar Metro - 0.5km", "BMS College - 1km", "Jayanagar Shopping Complex - 0.3km", "Lalbagh - 2km", "Restaurants - 0.2km"]'
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
      has_ac, has_wifi, has_study_table, has_wardrobe, room_size_sqft, description
    ) VALUES (
      property_record.id, '101', 'Premium', 'Single', 
      CASE WHEN property_record.price > 12000 THEN property_record.price ELSE 15000 END,
      1, 1, 1, true, true, true, true, true, true, 150,
      'Spacious single occupancy room with attached bathroom, balcony, and AC. Perfect for privacy.'
    ) ON CONFLICT (property_id, room_number) DO NOTHING;

    -- 2 Sharing rooms
    INSERT INTO property_rooms (
      property_id, room_number, room_type, sharing_type, price_per_person,
      total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
      has_ac, has_wifi, has_study_table, has_wardrobe, room_size_sqft, description
    ) VALUES 
    (
      property_record.id, '102', 'Standard', '2 Sharing', 
      ROUND(property_record.price * 0.65),
      2, 2, 1, true, false, true, true, true, true, 180,
      'Comfortable 2-sharing room with attached bathroom and AC. Great for friends.'
    ),
    (
      property_record.id, '103', 'Standard', '2 Sharing', 
      ROUND(property_record.price * 0.65),
      2, 1, 1, true, false, true, true, true, true, 180,
      'Comfortable 2-sharing room with attached bathroom and AC. One bed occupied.'
    ) ON CONFLICT (property_id, room_number) DO NOTHING;

    -- 3 Sharing rooms
    INSERT INTO property_rooms (
      property_id, room_number, room_type, sharing_type, price_per_person,
      total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
      has_ac, has_wifi, has_study_table, has_wardrobe, room_size_sqft, description
    ) VALUES 
    (
      property_record.id, '201', 'Standard', '3 Sharing', 
      ROUND(property_record.price * 0.50),
      3, 3, 2, true, true, true, true, true, true, 220,
      'Spacious 3-sharing room on the second floor with balcony and all amenities.'
    ),
    (
      property_record.id, '202', 'Standard', '3 Sharing', 
      ROUND(property_record.price * 0.50),
      3, 2, 2, true, false, true, true, true, true, 220,
      'Well-ventilated 3-sharing room with attached bathroom. Two beds available.'
    ) ON CONFLICT (property_id, room_number) DO NOTHING;

    -- 4 Sharing rooms
    INSERT INTO property_rooms (
      property_id, room_number, room_type, sharing_type, price_per_person,
      total_beds, available_beds, floor_number, has_attached_bathroom, has_balcony,
      has_ac, has_wifi, has_study_table, has_wardrobe, room_size_sqft, description
    ) VALUES 
    (
      property_record.id, '203', 'Economy', '4 Sharing', 
      ROUND(property_record.price * 0.40),
      4, 4, 2, true, false, true, true, true, true, 250,
      'Budget-friendly 4-sharing room with all basic amenities. Perfect for students.'
    ),
    (
      property_record.id, '301', 'Economy', '4 Sharing', 
      ROUND(property_record.price * 0.40),
      4, 3, 3, false, false, false, true, true, true, 240,
      'Affordable 4-sharing room on the third floor. Common bathroom. Three beds available.'
    ) ON CONFLICT (property_id, room_number) DO NOTHING;

  END LOOP;
END $$;

-- Insert property amenities (assign random amenities to properties)
DO $$
DECLARE
  property_record RECORD;
  amenity_record RECORD;
BEGIN
  FOR property_record IN SELECT id FROM properties
  LOOP
    -- Add common amenities to all properties
    FOR amenity_record IN SELECT id FROM amenities WHERE name IN ('WiFi', 'Security', 'Housekeeping', 'Water Purifier')
    LOOP
      INSERT INTO property_amenities (property_id, amenity_id) 
      VALUES (property_record.id, amenity_record.id)
      ON CONFLICT (property_id, amenity_id) DO NOTHING;
    END LOOP;
    
    -- Add some random additional amenities
    FOR amenity_record IN SELECT id FROM amenities WHERE name IN ('Gym', 'Laundry', 'Parking', 'Kitchen/Dining') ORDER BY RANDOM() LIMIT 3
    LOOP
      INSERT INTO property_amenities (property_id, amenity_id) 
      VALUES (property_record.id, amenity_record.id)
      ON CONFLICT (property_id, amenity_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Insert site settings
INSERT INTO site_settings (key, value, data_type, category, description, is_public) VALUES
('site_name', 'NiwasNest', 'string', 'general', 'Website name', true),
('site_tagline', 'Your Perfect Stay Awaits', 'string', 'general', 'Website tagline', true),
('contact_phone', '+91 63048 09598', 'string', 'general', 'Primary contact phone number', true),
('contact_email', 'niwasnest2026@gmail.com', 'string', 'general', 'Primary contact email address', true),
('company_address', 'Bangalore, Karnataka, India', 'string', 'general', 'Company address', true),
('booking_advance_percentage', '20', 'number', 'payment', 'Percentage of advance payment required', false),
('cancellation_policy', 'Free cancellation up to 24 hours before check-in', 'string', 'general', 'Cancellation policy text', true),
('terms_and_conditions', 'By booking with us, you agree to our terms and conditions...', 'string', 'general', 'Terms and conditions', true),
('privacy_policy', 'We respect your privacy and protect your personal information...', 'string', 'general', 'Privacy policy', true),
('support_hours', '9:00 AM - 9:00 PM', 'string', 'general', 'Customer support hours', true),
('whatsapp_number', '+91 63048 09598', 'string', 'general', 'WhatsApp support number', true),
('social_facebook', 'https://facebook.com/niwasnest', 'string', 'general', 'Facebook page URL', true),
('social_instagram', 'https://instagram.com/niwasnest', 'string', 'general', 'Instagram page URL', true),
('social_twitter', 'https://twitter.com/niwasnest', 'string', 'general', 'Twitter page URL', true)
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Insert notification templates
INSERT INTO notification_templates (template_key, template_name, subject, body_text, template_type, variables) VALUES
('booking_confirmation', 'Booking Confirmation', 'Booking Confirmed - {{property_name}}', 
 'Dear {{guest_name}}, Your booking for {{property_name}} has been confirmed. Check-in: {{check_in_date}}. Amount paid: ₹{{amount_paid}}. Remaining: ₹{{amount_due}}. Contact: {{owner_phone}}',
 'email', '["guest_name", "property_name", "check_in_date", "amount_paid", "amount_due", "owner_phone"]'),
('booking_cancelled', 'Booking Cancellation', 'Booking Cancelled - {{property_name}}', 
 'Dear {{guest_name}}, Your booking for {{property_name}} has been cancelled. Refund will be processed within 5-7 business days.',
 'email', '["guest_name", "property_name"]'),
('payment_reminder', 'Payment Reminder', 'Payment Due - {{property_name}}', 
 'Dear {{guest_name}}, This is a reminder that ₹{{amount_due}} is due for your booking at {{property_name}}. Please pay directly to the owner.',
 'email', '["guest_name", "property_name", "amount_due"]')
ON CONFLICT (template_key) DO NOTHING;

-- =============================================
-- FINAL SUCCESS MESSAGE
-- =============================================

SELECT 
  'Database setup completed successfully!' as status,
  (SELECT COUNT(*) FROM properties) as properties_count,
  (SELECT COUNT(*) FROM property_rooms) as rooms_count,
  (SELECT COUNT(*) FROM amenities) as amenities_count,
  (SELECT COUNT(*) FROM site_settings) as settings_count;