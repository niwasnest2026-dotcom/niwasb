/*
  # Update Properties Table and Create Amenities Tables
  
  ## Changes
  
  ### Properties Table Updates
  - Drop old columns (title, location, bedrooms, bathrooms, area, image_url)
  - Add new columns:
    - `name` (text, not null) - Property name
    - `address` (text, not null) - Full address
    - `city` (text, not null) - City name
    - `original_price` (numeric) - Original price before discount
    - `rating` (numeric) - Average rating (0-5)
    - `review_count` (integer) - Number of reviews
    - `instant_book` (boolean) - Can be instantly booked
    - `verified` (boolean) - Verified property
    - `secure_booking` (boolean) - Has secure booking
    - `featured_image` (text) - Main image URL
  
  ## New Tables
  
  ### `amenities`
  - `id` (uuid, primary key)
  - `name` (text, not null) - Amenity name (e.g., "WiFi")
  - `icon_name` (text, not null) - Icon identifier
  - `created_at` (timestamptz)
  
  ### `property_amenities`
  - `id` (uuid, primary key)
  - `property_id` (uuid, references properties)
  - `amenity_id` (uuid, references amenities)
  - `created_at` (timestamptz)
  - Unique constraint on (property_id, amenity_id)
  
  ### `property_images`
  - `id` (uuid, primary key)
  - `property_id` (uuid, references properties)
  - `image_url` (text, not null)
  - `display_order` (integer) - Order for display
  - `created_at` (timestamptz)
  
  ## Security
  
  - Enable RLS on all new tables
  - Public read access for amenities, property_amenities, and property_images
  - Authenticated users can insert/update/delete
*/

-- Update properties table
ALTER TABLE properties 
  DROP COLUMN IF EXISTS title,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS bedrooms,
  DROP COLUMN IF EXISTS bathrooms,
  DROP COLUMN IF EXISTS area,
  DROP COLUMN IF EXISTS image_url;

-- Add new columns to properties table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'name') THEN
    ALTER TABLE properties ADD COLUMN name text NOT NULL DEFAULT 'Unnamed Property';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'address') THEN
    ALTER TABLE properties ADD COLUMN address text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'city') THEN
    ALTER TABLE properties ADD COLUMN city text NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'original_price') THEN
    ALTER TABLE properties ADD COLUMN original_price numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'rating') THEN
    ALTER TABLE properties ADD COLUMN rating numeric;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'review_count') THEN
    ALTER TABLE properties ADD COLUMN review_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'instant_book') THEN
    ALTER TABLE properties ADD COLUMN instant_book boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'verified') THEN
    ALTER TABLE properties ADD COLUMN verified boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'secure_booking') THEN
    ALTER TABLE properties ADD COLUMN secure_booking boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'featured_image') THEN
    ALTER TABLE properties ADD COLUMN featured_image text;
  END IF;
END $$;

-- Remove default constraints
ALTER TABLE properties ALTER COLUMN name DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN address DROP DEFAULT;
ALTER TABLE properties ALTER COLUMN city DROP DEFAULT;

-- Create amenities table
CREATE TABLE IF NOT EXISTS amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create property_amenities junction table
CREATE TABLE IF NOT EXISTS property_amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id uuid NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(property_id, amenity_id)
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;

-- Amenities policies
CREATE POLICY "Anyone can view amenities"
  ON amenities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert amenities"
  ON amenities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update amenities"
  ON amenities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete amenities"
  ON amenities FOR DELETE
  TO authenticated
  USING (true);

-- Property_amenities policies
CREATE POLICY "Anyone can view property amenities"
  ON property_amenities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert property amenities"
  ON property_amenities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete property amenities"
  ON property_amenities FOR DELETE
  TO authenticated
  USING (true);

-- Property_images policies
CREATE POLICY "Anyone can view property images"
  ON property_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert property images"
  ON property_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update property images"
  ON property_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete property images"
  ON property_images FOR DELETE
  TO authenticated
  USING (true);