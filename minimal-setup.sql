-- MINIMAL SETUP - Run this first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create properties table (basic version)
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  price INTEGER NOT NULL,
  security_deposit INTEGER,
  available_months INTEGER,
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  featured_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and create basic policy
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view properties" ON properties FOR SELECT USING (true);

-- Insert one test property
INSERT INTO properties (name, description, address, city, area, price, security_deposit, available_months, rating, review_count, featured_image) 
VALUES (
  'Test PG', 
  'Test property for debugging', 
  '123 Test Street', 
  'Bangalore', 
  'Test Area', 
  10000, 
  20000, 
  12, 
  4.0, 
  5, 
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'
);

SELECT 'Minimal setup completed!' as status;