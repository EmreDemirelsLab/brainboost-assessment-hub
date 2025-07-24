-- Create cognitive assessment results table
CREATE TABLE public.cognitive_assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  student_id UUID,
  conducted_by UUID NOT NULL,
  
  -- Overall test information
  test_start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  test_end_time TIMESTAMP WITH TIME ZONE,
  total_test_duration_seconds INTEGER,
  current_test_step INTEGER DEFAULT 1,
  test_status TEXT DEFAULT 'in_progress' CHECK (test_status IN ('in_progress', 'completed', 'abandoned')),
  
  -- Individual test results
  dikkat_test_results JSONB,
  dikkat_test_score NUMERIC,
  dikkat_test_completed_at TIMESTAMP WITH TIME ZONE,
  
  hafiza_test_results JSONB,
  hafiza_test_score NUMERIC,
  hafiza_test_completed_at TIMESTAMP WITH TIME ZONE,
  
  stroop_test_results JSONB,
  stroop_test_score NUMERIC,
  stroop_test_completed_at TIMESTAMP WITH TIME ZONE,
  
  puzzle_test_results JSONB,
  puzzle_test_score NUMERIC,
  puzzle_test_completed_at TIMESTAMP WITH TIME ZONE,
  
  akil_mantik_test_results JSONB,
  akil_mantik_test_score NUMERIC,
  akil_mantik_test_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Overall assessment results
  overall_cognitive_score NUMERIC,
  cognitive_assessment_summary JSONB,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cognitive_assessment_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cognitive assessment results" 
ON public.cognitive_assessment_results 
FOR SELECT 
USING ((user_id = auth.uid()) OR (conducted_by = auth.uid()));

CREATE POLICY "Users can insert their own cognitive assessment results" 
ON public.cognitive_assessment_results 
FOR INSERT 
WITH CHECK ((user_id = auth.uid()) OR (conducted_by = auth.uid()));

CREATE POLICY "Users can update their own cognitive assessment results" 
ON public.cognitive_assessment_results 
FOR UPDATE 
USING ((user_id = auth.uid()) OR (conducted_by = auth.uid()));

CREATE POLICY "Trainers and admins can manage all cognitive assessment results" 
ON public.cognitive_assessment_results 
FOR ALL 
USING (has_role(get_current_user(), 'admin'::user_role) OR has_role(get_current_user(), 'trainer'::user_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_cognitive_assessment_results_updated_at
BEFORE UPDATE ON public.cognitive_assessment_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();