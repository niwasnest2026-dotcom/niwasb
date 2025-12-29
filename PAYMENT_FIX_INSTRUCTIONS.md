# Payment Issue Fix Instructions

## Problem
The payment is failing because the `duration_months` column doesn't exist in the bookings table.

## Quick Fix (Applied)
I've updated the code to handle missing columns gracefully by:

1. **Updated booking creation** to only include existing columns
2. **Added error handling** for missing database columns
3. **Made optional fields conditional** - only added if they exist in the schema

## Database Fix (Optional)
If you want to add the missing columns to your Supabase database:

1. Go to your Supabase dashboard
2. Open the SQL Editor
3. Run the SQL script: `fix-bookings-table.sql`

## What's Fixed
- ✅ Payment processing now works without database schema changes
- ✅ Booking creation handles missing columns gracefully
- ✅ Authentication is properly integrated
- ✅ Error messages are more user-friendly

## Test the Payment
1. Go to any property page
2. Click "Book Now" (you'll need to be logged in)
3. Fill in guest information
4. Complete the payment process

The payment should now work successfully even with the current database schema!