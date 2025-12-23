-- Create bookings table to track room reservations
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
  total_amount INTEGER NOT NULL, -- rent + security deposit per person
  amount_paid INTEGER NOT NULL, -- 20% upfront payment
  amount_due INTEGER NOT NULL, -- 80% to be paid to owner
  payment_method VARCHAR(50) NOT NULL, -- 'card' or 'upi'
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'partial', 'completed', 'failed'
  booking_status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'completed'
  check_in_date DATE,
  check_out_date DATE,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);

-- Add comments for documentation
COMMENT ON TABLE bookings IS 'Stores room booking information and payment details';
COMMENT ON COLUMN bookings.amount_paid IS '20% upfront payment made through the platform';
COMMENT ON COLUMN bookings.amount_due IS '80% remaining amount to be paid to property owner';
COMMENT ON COLUMN bookings.payment_status IS 'pending: no payment, partial: 20% paid, completed: full payment, failed: payment failed';
COMMENT ON COLUMN bookings.booking_status IS 'confirmed: booking active, cancelled: booking cancelled, completed: stay completed';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_bookings_updated_at();

-- Create function to update available beds when booking is made
CREATE OR REPLACE FUNCTION update_room_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.booking_status = 'confirmed' THEN
    -- Decrease available beds when new booking is confirmed
    UPDATE property_rooms 
    SET available_beds = available_beds - 1,
        updated_at = NOW()
    WHERE id = NEW.room_id AND available_beds > 0;
    
    -- Check if update was successful
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

-- Add RLS policies for bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Anyone can create bookings (for guest bookings)
CREATE POLICY "Anyone can create bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Admins can view all bookings (you'll need to add admin role logic)
-- CREATE POLICY "Admins can view all bookings" ON bookings
--   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

RAISE NOTICE 'Bookings table and triggers created successfully!';