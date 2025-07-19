-- Create test users for the system
-- First, let's create admin user through Supabase signup simulation

-- Since we cannot directly insert into auth.users, let's create a workaround
-- We'll insert sample data and then use Supabase dashboard to create the actual auth user

-- Insert sample user data that will be linked when admin signs up
INSERT INTO public.users (
  id,
  auth_user_id,
  email,
  first_name,
  last_name,
  is_active
) VALUES (
  '10000000-1000-1000-1000-100000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,  -- This will be updated when real user signs up
  'admin@forbrainacademy.com',
  'Admin',
  'Kullanıcı',
  true
) ON CONFLICT (email) DO NOTHING;

-- Add admin and trainer roles
INSERT INTO public.user_roles (user_id, role) 
VALUES 
  ('10000000-1000-1000-1000-100000000001'::uuid, 'admin'),
  ('10000000-1000-1000-1000-100000000001'::uuid, 'trainer')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create a trainer user as well
INSERT INTO public.users (
  id,
  auth_user_id,
  email,
  first_name,
  last_name,
  is_active
) VALUES (
  '10000000-1000-1000-1000-100000000002'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  'trainer@forbrainacademy.com',
  'Beyin',
  'Antrenörü',
  true
) ON CONFLICT (email) DO NOTHING;

-- Add trainer role
INSERT INTO public.user_roles (user_id, role) 
VALUES 
  ('10000000-1000-1000-1000-100000000002'::uuid, 'trainer')
ON CONFLICT (user_id, role) DO NOTHING;