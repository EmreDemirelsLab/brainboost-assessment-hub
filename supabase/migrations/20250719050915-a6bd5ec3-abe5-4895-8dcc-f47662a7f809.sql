-- Create first admin user manually
-- Note: This is a one-time setup for the initial admin user

-- Insert auth user first (this simulates what would happen through Supabase auth)
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'admin@forbrainacademy.com',
  crypt('123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Insert into our users table
INSERT INTO public.users (
  id,
  auth_user_id,
  email,
  first_name,
  last_name,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin@forbrainacademy.com',
  'Sistem',
  'Yöneticisi',
  true,
  now(),
  now()
);

-- Add admin role
INSERT INTO public.user_roles (
  user_id,
  role,
  created_at
) VALUES (
  (SELECT id FROM public.users WHERE email = 'admin@forbrainacademy.com'),
  'admin',
  now()
);

-- Add trainer role as well (so admin can also do trainer tasks)
INSERT INTO public.user_roles (
  user_id,
  role,
  created_at
) VALUES (
  (SELECT id FROM public.users WHERE email = 'admin@forbrainacademy.com'),
  'trainer',
  now()
);