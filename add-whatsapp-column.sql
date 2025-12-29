-- Add WhatsApp number column to bookings table
-- Run this in your Supabase SQL Editor

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_whatsapp VARCHAR(20);

-- Update existing records to use phone number as WhatsApp if needed
UPDATE bookings 
SET guest_whatsapp = guest_phone 
WHERE guest_whatsapp IS NULL AND guest_phone IS NOT NULL;

-- Show success
SELECT 'WhatsApp column added successfully!' as status;