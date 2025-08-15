/*
  # Add missing profile fields

  1. New Columns
    - `phone` (text, optional) - User's phone number
    - `location` (text, optional) - User's location/city
    - `bio` (text, optional) - User's biography/description
    - `website` (text, optional) - User's website URL
    - `linkedin` (text, optional) - User's LinkedIn profile URL

  2. Changes
    - Add five new optional columns to the profiles table
    - These fields will allow users to complete their profiles with additional information
*/

-- Add missing columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'website'
  ) THEN
    ALTER TABLE profiles ADD COLUMN website text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linkedin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linkedin text;
  END IF;
END $$;