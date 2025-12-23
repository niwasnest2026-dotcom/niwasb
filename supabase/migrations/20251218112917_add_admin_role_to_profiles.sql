/*
  # Add Admin Role to Profiles

  ## Changes
  1. Add `is_admin` column to `profiles` table
    - Boolean field to identify admin users
    - Defaults to false for security
  
  2. Security
    - Update RLS policies to allow admins to manage properties
    - Ensure only admins can modify the is_admin field
*/

-- Add is_admin column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update properties RLS policies to allow admin management
CREATE POLICY "Admins can insert properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete properties"
  ON properties FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Update property_images RLS policies for admin management
CREATE POLICY "Admins can insert property images"
  ON property_images FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update property images"
  ON property_images FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete property images"
  ON property_images FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Update property_amenities RLS policies for admin management
CREATE POLICY "Admins can insert property amenities"
  ON property_amenities FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete property amenities"
  ON property_amenities FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));