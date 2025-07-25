-- CRITICAL SECURITY FIX: Enable RLS and Apply Comprehensive Policies
-- This migration addresses all critical security vulnerabilities

-- 1. ENABLE RLS ON ALL PUBLIC TABLES (Fixes ERROR 13-22)
ALTER TABLE public.kullanicilar ENABLE ROW LEVEL SECURITY;

-- 2. COMPREHENSIVE RLS POLICIES FOR ALL TABLES

-- Users table policies (already has some, but ensure comprehensive coverage)
DROP POLICY IF EXISTS "Allow users to read their own data" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated users to update their profile" ON public.users;

CREATE POLICY "Users can view their own profile and admins/trainers can view all"
ON public.users FOR SELECT 
USING (
  auth_user_id = auth.uid() OR 
  has_role(get_current_user(), 'admin'::user_role) OR 
  has_role(get_current_user(), 'trainer'::user_role)
);

CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE 
USING (auth_user_id = auth.uid());

-- Kullanicilar table policies (legacy table)
CREATE POLICY "Admins and trainers can view kullanicilar"
ON public.kullanicilar FOR SELECT 
USING (
  has_role(get_current_user(), 'admin'::user_role) OR 
  has_role(get_current_user(), 'trainer'::user_role)
);

CREATE POLICY "Admins can manage kullanicilar"
ON public.kullanicilar FOR ALL 
USING (has_role(get_current_user(), 'admin'::user_role));

-- User roles table policies (enhance existing)
DROP POLICY IF EXISTS "Admins and self can view roles" ON public.user_roles;
CREATE POLICY "Users can view own roles, admins can view all"
ON public.user_roles FOR SELECT 
USING (
  user_id = get_current_user() OR 
  has_role(get_current_user(), 'admin'::user_role)
);

-- Students table policies (enhance existing) 
DROP POLICY IF EXISTS "Trainers and reps can view students" ON public.students;
CREATE POLICY "Role-based student access"
ON public.students FOR SELECT 
USING (
  has_role(get_current_user(), 'admin'::user_role) OR 
  has_role(get_current_user(), 'trainer'::user_role) OR 
  (has_role(get_current_user(), 'representative'::user_role) AND user_id = get_current_user())
);

-- 3. SECURE DATABASE FUNCTIONS (Fixes WARN 11-13)
CREATE OR REPLACE FUNCTION public.get_current_user()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, required_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.role = $2
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.users (auth_user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    (SELECT id FROM public.users WHERE auth_user_id = NEW.id),
    'user'
  );
  
  RETURN NEW;
END;
$function$;

-- 4. ADMIN ONLY FUNCTIONS FOR SECURE ROLE MANAGEMENT
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, new_role user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only admins can assign roles
  IF NOT has_role(get_current_user(), 'admin'::user_role) THEN
    RAISE EXCEPTION 'Access denied. Only admins can assign roles.';
  END IF;
  
  -- Insert role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.remove_user_role(target_user_id uuid, role_to_remove user_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only admins can remove roles
  IF NOT has_role(get_current_user(), 'admin'::user_role) THEN
    RAISE EXCEPTION 'Access denied. Only admins can remove roles.';
  END IF;
  
  DELETE FROM public.user_roles 
  WHERE user_id = target_user_id AND role = role_to_remove;
  
  RETURN TRUE;
END;
$function$;

-- 5. AUDIT LOG TABLE FOR SECURITY TRACKING
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs FOR SELECT 
USING (has_role(get_current_user(), 'admin'::user_role));

-- 6. SECURITY VALIDATION
-- Verify all tables have RLS enabled
DO $$
DECLARE
  tbl_name text;
  rls_enabled boolean;
BEGIN
  FOR tbl_name IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  LOOP
    SELECT pg_class.relrowsecurity INTO rls_enabled
    FROM pg_class
    JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
    WHERE pg_namespace.nspname = 'public' 
    AND pg_class.relname = tbl_name;
    
    IF NOT rls_enabled THEN
      RAISE EXCEPTION 'RLS not enabled on table: %', tbl_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'All public tables have RLS enabled successfully!';
END;
$$;