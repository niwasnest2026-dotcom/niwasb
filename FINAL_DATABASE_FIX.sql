-- Final database fix - run this in Supabase SQL Editor
-- This will add the missing columns safely

-- Add columns one by one with error handling
DO $$
BEGIN
    -- Add duration_months column
    BEGIN
        ALTER TABLE bookings ADD COLUMN duration_months INTEGER;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, skip
            NULL;
    END;
    
    -- Add user_id column
    BEGIN
        ALTER TABLE bookings ADD COLUMN user_id UUID;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, skip
            NULL;
    END;
    
    -- Add check_in_date column
    BEGIN
        ALTER TABLE bookings ADD COLUMN check_in_date DATE;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, skip
            NULL;
    END;
    
    -- Add check_out_date column
    BEGIN
        ALTER TABLE bookings ADD COLUMN check_out_date DATE;
    EXCEPTION
        WHEN duplicate_column THEN
            -- Column already exists, skip
            NULL;
    END;
END $$;

-- Show success message
SELECT 'Database columns added successfully!' as status;