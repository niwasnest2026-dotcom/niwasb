/*
  # Add phone number to profiles table

  1. Changes
    - Add `phone_number` column to `profiles` table
      - Type: text (allows international formats with + and spaces)
      - Optional field (nullable)
    
  2. Notes
    - Phone numbers are optional for user profiles
    - No validation constraints to allow various international formats
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;
END $$;
