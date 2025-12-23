/*
  # Create Properties Table

  ## New Tables
  
  ### `properties`
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `description` (text)
  - `price` (numeric, not null)
  - `location` (text, not null)
  - `bedrooms` (integer, default 0)
  - `bathrooms` (integer, default 0)
  - `area` (integer) - square footage
  - `property_type` (text) - house, apartment, condo, etc.
  - `image_url` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  
  - Enable RLS
  - Anyone can view properties (public access)
  - Only authenticated users can insert/update/delete
*/

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  location text NOT NULL,
  bedrooms integer DEFAULT 0,
  bathrooms integer DEFAULT 0,
  area integer,
  property_type text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Anyone can view properties"
  ON properties FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete properties"
  ON properties FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on property updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_properties_updated_at'
  ) THEN
    CREATE TRIGGER update_properties_updated_at
      BEFORE UPDATE ON properties
      FOR EACH ROW EXECUTE FUNCTION update_properties_updated_at();
  END IF;
END $$;