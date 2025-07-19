-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'trainer', 'representative', 'user');

-- Create users table (profiles)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  student_number TEXT UNIQUE,
  birth_date DATE,
  grade_level INTEGER,
  school_name TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tests table
CREATE TABLE public.tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  test_type TEXT NOT NULL, -- 'cognitive', 'attention', 'memory', etc.
  duration_minutes INTEGER,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test_results table
CREATE TABLE public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  conducted_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  percentage DECIMAL(5,2),
  results_data JSONB, -- Detailed test results
  notes TEXT,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  exercise_type TEXT NOT NULL, -- 'attention', 'memory', 'coordination', etc.
  difficulty_level INTEGER DEFAULT 1, -- 1-5 scale
  instructions TEXT,
  exercise_data JSONB, -- Exercise configuration and content
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'assessment', 'progress', 'detailed', etc.
  template_data JSONB, -- Report template configuration
  content_data JSONB, -- Generated report content
  file_url TEXT, -- PDF/Excel file URL
  generated_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = $1 AND ur.role = $2
  );
$$;

-- Create function to get current user
CREATE OR REPLACE FUNCTION public.get_current_user()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid();
$$;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Admins and trainers can view all users" ON public.users
  FOR SELECT USING (
    public.has_role(public.get_current_user(), 'admin') OR
    public.has_role(public.get_current_user(), 'trainer')
  );

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth_user_id = auth.uid());

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = public.get_current_user());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(public.get_current_user(), 'admin'));

-- RLS Policies for students table
CREATE POLICY "Users can view students based on role" ON public.students
  FOR SELECT USING (
    public.has_role(public.get_current_user(), 'admin') OR
    public.has_role(public.get_current_user(), 'trainer') OR
    (public.has_role(public.get_current_user(), 'representative') AND user_id = public.get_current_user())
  );

CREATE POLICY "Trainers and admins can manage students" ON public.students
  FOR ALL USING (
    public.has_role(public.get_current_user(), 'admin') OR
    public.has_role(public.get_current_user(), 'trainer')
  );

-- RLS Policies for tests table
CREATE POLICY "All authenticated users can view active tests" ON public.tests
  FOR SELECT USING (is_active = true);

CREATE POLICY "Trainers and admins can manage tests" ON public.tests
  FOR ALL USING (
    public.has_role(public.get_current_user(), 'admin') OR
    public.has_role(public.get_current_user(), 'trainer')
  );

-- RLS Policies for test_results table
CREATE POLICY "Users can view results based on role" ON public.test_results
  FOR SELECT USING (
    public.has_role(public.get_current_user(), 'admin') OR
    public.has_role(public.get_current_user(), 'trainer') OR
    conducted_by = public.get_current_user()
  );

CREATE POLICY "Trainers and admins can manage test results" ON public.test_results
  FOR ALL USING (
    public.has_role(public.get_current_user(), 'admin') OR
    public.has_role(public.get_current_user(), 'trainer')
  );

-- RLS Policies for exercises table
CREATE POLICY "All authenticated users can view active exercises" ON public.exercises
  FOR SELECT USING (is_active = true);

CREATE POLICY "Trainers and admins can manage exercises" ON public.exercises
  FOR ALL USING (
    public.has_role(public.get_current_user(), 'admin') OR
    public.has_role(public.get_current_user(), 'trainer')
  );

-- RLS Policies for reports table
CREATE POLICY "Users can view reports based on role" ON public.reports
  FOR SELECT USING (
    public.has_role(public.get_current_user(), 'admin') OR
    public.has_role(public.get_current_user(), 'trainer') OR
    created_by = public.get_current_user()
  );

CREATE POLICY "Trainers and admins can manage reports" ON public.reports
  FOR ALL USING (
    public.has_role(public.get_current_user(), 'admin') OR
    public.has_role(public.get_current_user(), 'trainer')
  );

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON public.tests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at
  BEFORE UPDATE ON public.test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
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
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();