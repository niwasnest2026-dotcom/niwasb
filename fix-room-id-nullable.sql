-- Fix room_id to be nullable for Room type properties
-- This allows bookings for properties that don't have specific rooms

-- Make room_id nullable
ALTER TABLE bookings ALTER COLUMN room_id DROP NOT NULL;

-- Add a comment to explain the change
COMMENT ON COLUMN bookings.room_id IS 'Room ID - nullable for Room type properties where entire property is booked';

-- Show success message
SELECT 'room_id column is now nullable - bookings can be created for Room type properties' as status;