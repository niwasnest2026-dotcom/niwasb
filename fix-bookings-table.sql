-- Fix bookings table by adding missing columns
-- Run this in your Supabase SQL editor

-- Add duration_months column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'duration_months') THEN
        ALTER TABLE bookings ADD COLUMN duration_months INTEGER;
    END IF;
END $$;

-- Add user_id column if it doesn't exist (for authentication)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'user_id') THEN
        ALTER TABLE bookings ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add check_in_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'check_in_date') THEN
        ALTER TABLE bookings ADD COLUMN check_in_date DATE;
    END IF;
END $$;

-- Add check_out_date column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookings' AND column_name = 'check_out_date') THEN
        ALTER TABLE bookings ADD COLUMN check_out_date DATE;
    END IF;
END $$;

-- Update RLS policies (simplified without user_profiles table)
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
CREATE POLICY "Users can view their own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
CREATE POLICY "Users can insert their own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to insert bookings
DROP POLICY IF EXISTS "Authenticated users can insert bookings" ON bookings;
CREATE POLICY "Authenticated users can insert bookings" ON bookings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;