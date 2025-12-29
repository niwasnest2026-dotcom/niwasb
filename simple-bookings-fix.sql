-- Simple fix for bookings table - just add missing columns
-- Run this in your Supabase SQL editor

-- Add duration_months column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_months INTEGER;

-- Add user_id column for authentication
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add date columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_in_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS check_out_date DATE;

-- Enable RLS on bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Simple policy: authenticated users can insert and view their own bookings
CREATE POLICY IF NOT EXISTS "Enable insert for authenticated users" ON bookings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Enable select for users based on user_id" ON bookings
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Show the updated table structure
\d bookings;