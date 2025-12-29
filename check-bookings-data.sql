-- Check existing bookings to see if there are any email mismatches
SELECT 
  id,
  guest_name,
  guest_email,
  user_id,
  booking_status,
  payment_status,
  created_at
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are any bookings with user_id but different guest_email
-- This would help identify the mismatch issue
SELECT 
  b.id,
  b.guest_name,
  b.guest_email,
  b.user_id,
  u.email as user_auth_email,
  CASE 
    WHEN b.guest_email = u.email THEN 'MATCH'
    ELSE 'MISMATCH'
  END as email_status
FROM bookings b
LEFT JOIN auth.users u ON b.user_id = u.id
WHERE b.user_id IS NOT NULL
ORDER BY b.created_at DESC;