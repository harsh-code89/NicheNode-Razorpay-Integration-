/*
  # Add trigger for automatic profile creation on user signup

  1. New Functions
    - `handle_new_user()` - Creates a profile record when a new user signs up
  
  2. New Triggers
    - Trigger on `auth.users` table to call `handle_new_user()` on INSERT
  
  3. Security
    - Ensures new users get a profile record automatically
    - Uses the user's auth data to populate profile fields
*/

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();