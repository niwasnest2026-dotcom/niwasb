-- Minimal update to add missing columns to bookings table
-- This is OPTIONAL - the payment system already works without these columns

-- Add columns one by one (safer approach)
ALTER TABLE bookings ADD COLUMN duration_months INTEGER;
ALTER TABLE bookings ADD COLUMN user_id UUID;
ALTER TABLE bookings ADD COLUMN check_in_date DATE;
ALTER TABLE bookings ADD COLUMN check_out_date DATE;

-- That's it! The payment system will now use these columns if available.