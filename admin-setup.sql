-- ADMIN SETUP SCRIPT
-- Run this after your basic database setup

-- Function to automatically make first user admin
CREATE OR REPLACE FUNCTION make_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first user in profiles table, make them admin
  IF (SELECT COUNT(*) FROM profiles) = 0 THEN
    NEW.is_admin = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to make first user admin
DROP TRIGGER IF EXISTS make_first_user_admin_trigger ON profiles;
CREATE TRIGGER make_first_user_admin_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION make_first_user_admin();

-- If you want to make a specific user admin right now, uncomment and modify this:
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';

SELECT 'Admin setup completed! First user to sign up will be admin.' as status;