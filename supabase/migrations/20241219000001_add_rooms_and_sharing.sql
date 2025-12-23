-- Create rooms table for properties
CREATE TABLE IF NOT EXISTS property_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(100), -- e.g., "Standard", "Deluxe", "Premium"
  sharing_type VARCHAR(50) NOT NULL, -- e.g., "Single", "2 Sharing", "3 Sharing", "4 Sharing"
  price_per_person INTEGER NOT NULL,
  security_deposit_per_person INTEGER, -- Room-specific security deposit per person
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

-- Create room images table
CREATE TABLE IF NOT EXISTS room_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES property_rooms(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_property_rooms_property_id ON property_rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_property_rooms_sharing_type ON property_rooms(sharing_type);
CREATE INDEX IF NOT EXISTS idx_property_rooms_available ON property_rooms(is_available);
CREATE INDEX IF NOT EXISTS idx_room_images_room_id ON room_images(room_id);

-- Add comments for documentation
COMMENT ON TABLE property_rooms IS 'Stores individual rooms within properties with sharing options';
COMMENT ON COLUMN property_rooms.sharing_type IS 'Type of sharing: Single, 2 Sharing, 3 Sharing, 4 Sharing, etc.';
COMMENT ON COLUMN property_rooms.price_per_person IS 'Price per person per month in the room';
COMMENT ON COLUMN property_rooms.security_deposit_per_person IS 'Security deposit per person for this room (if null, defaults to 2x price_per_person)';
COMMENT ON COLUMN property_rooms.total_beds IS 'Total number of beds in the room';
COMMENT ON COLUMN property_rooms.available_beds IS 'Number of beds currently available for booking';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_property_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER property_rooms_updated_at
  BEFORE UPDATE ON property_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_property_rooms_updated_at();