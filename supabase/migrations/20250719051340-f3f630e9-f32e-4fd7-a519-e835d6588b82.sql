-- Add admin and trainer roles to the current user (emre@forbrainacademy.com)
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES 
  ('a02fb2b2-cca4-4f7c-924d-a149f2e60a77'::uuid, 'admin', now()),
  ('a02fb2b2-cca4-4f7c-924d-a149f2e60a77'::uuid, 'trainer', now())
ON CONFLICT (user_id, role) DO NOTHING;