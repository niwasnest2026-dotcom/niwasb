# 🔧 Database Schema Fix - SQL Commands

## Problem
The error "Could not find the payment_id column of 'bookings' in the schema cache" indicates that the `payment_id` column is missing from the bookings table.

## Solution: Run These SQL Commands in Supabase

### 1. Check Current Bookings Table Structure
```sql
-- Check if bookings table exists and see its columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 2. Add Missing payment_id Column (if needed)
```sql
-- Add payment_id column if it doesn't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_id TEXT;
```

### 3. Create Complete Bookings Table (if table doesn't exist)
```sql
-- Create the complete bookings table with all required columns
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID NOT NULL REFERENCES public.properties(id),
    room_id UUID REFERENCES public.property_rooms(id),
    user_id UUID REFERENCES auth.users(id),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    sharing_type TEXT NOT NULL,
    price_per_person NUMERIC NOT NULL,
    security_deposit_per_person NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    amount_paid NUMERIC NOT NULL,
    amount_due NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT,
    booking_status TEXT,
    check_in_date TIMESTAMPTZ,
    check_out_date TIMESTAMPTZ,
    booking_date TIMESTAMPTZ,
    payment_date TIMESTAMPTZ,
    payment_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Create Indexes for Performance
```sql
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_payment_id ON public.bookings(payment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON public.bookings(guest_email);
```

### 5. Enable Row Level Security (RLS)
```sql
-- Enable RLS on bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'email' = guest_email
    );

-- Create policy for authenticated users to insert bookings
CREATE POLICY "Authenticated users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for users to update their own bookings
CREATE POLICY "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'email' = guest_email
    );
```

### 6. Verify the Fix
```sql
-- Test that payment_id column exists
SELECT payment_id FROM public.bookings LIMIT 1;

-- Check table structure
\d public.bookings;
```

## How to Run These Commands

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the SQL commands above
4. Run them one by one or all together

### Option 2: Use the Fix Schema Page
1. Visit `/fix-schema` in your application
2. Click "Migrate Schema" button
3. The system will automatically run these commands

### Option 3: API Endpoints
```bash
# Validate current schema
POST /api/validate-and-repair-schema

# Run migration
POST /api/migrate-bookings-schema

# Fix schema cache
POST /api/fix-schema-cache
```

## Expected Results

After running these commands, you should see:
- ✅ `payment_id` column exists in bookings table
- ✅ All required columns are present
- ✅ Proper indexes are created
- ✅ RLS policies are in place
- ✅ Payment verification works without schema errors

## Troubleshooting

### If you get "relation does not exist" error:
- The bookings table doesn't exist
- Run the "Create Complete Bookings Table" SQL above

### If you get "column already exists" error:
- The column is already there
- Check if there are other issues with the schema

### If you get permission errors:
- Make sure you're using the service role key
- Check that you have admin access to the database

### If payment verification still fails:
1. Restart your Next.js application
2. Clear browser cache
3. Check that environment variables are correct
4. Verify Supabase connection

## Verification Commands

```sql
-- Verify payment_id column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'payment_id';

-- Test insert (will fail on FK constraint, which is expected)
INSERT INTO public.bookings (
    property_id, guest_name, guest_email, guest_phone,
    sharing_type, price_per_person, security_deposit_per_person,
    total_amount, amount_paid, amount_due, payment_method, payment_id
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Test User', 'test@example.com', '9999999999',
    'Single Room', 10000, 20000, 30000, 2000, 28000,
    'razorpay', 'test_payment_id'
);
-- This should fail with FK constraint error, which means the schema is correct
```

---

**After running these fixes, your payment verification should work correctly without schema cache errors!**