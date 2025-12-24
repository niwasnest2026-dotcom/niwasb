-- Fix Row Level Security policies for properties table
-- Run this in your Supabase SQL editor

-- First, let's check current RLS status
SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
FROM pg_tables 
WHERE tablename = 'properties';

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'properties';

-- Disable RLS temporarily to allow admin operations (Option 1 - Simple)
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

-- OR create proper RLS policies (Option 2 - More secure)
-- Uncomment the following if you want to keep RLS enabled with proper policies:

/*
-- Enable RLS if not already enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy for admins to insert properties
CREATE POLICY "Admins can insert properties" ON properties
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Policy for admins to update properties
CREATE POLICY "Admins can update properties" ON properties
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Policy for admins to delete properties
CREATE POLICY "Admins can delete properties" ON properties
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- Policy for everyone to read properties
CREATE POLICY "Everyone can read properties" ON properties
FOR SELECT 
TO anon, authenticated
USING (true);
*/

-- Also fix RLS for related tables
ALTER TABLE property_amenities DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE property_rooms DISABLE ROW LEVEL SECURITY;

-- Check if the fix worked
SELECT 'RLS Status After Fix:' as status;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('properties', 'property_amenities', 'property_images', 'property_rooms');