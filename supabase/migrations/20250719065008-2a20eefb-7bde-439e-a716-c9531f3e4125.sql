-- Burdon Dikkat Testi için özel tablo oluştur
CREATE TABLE public.burdon_test_results (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Kullanıcı bilgileri
    user_id UUID NOT NULL REFERENCES public.users(id),
    student_id UUID REFERENCES public.students(id),
    conducted_by UUID NOT NULL REFERENCES public.users(id),
    
    -- Test zamanlaması
    test_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    test_end_time TIMESTAMP WITH TIME ZONE,
    test_elapsed_time_seconds INTEGER NOT NULL,
    test_auto_completed BOOLEAN DEFAULT false,
    
    -- Toplam sonuçlar
    total_correct INTEGER NOT NULL DEFAULT 0,
    total_missed INTEGER NOT NULL DEFAULT 0,
    total_wrong INTEGER NOT NULL DEFAULT 0,
    total_score INTEGER NOT NULL DEFAULT 0,
    attention_ratio NUMERIC(10,6) NOT NULL DEFAULT 0,
    
    -- Bölüm 1 sonuçları
    section1_correct INTEGER NOT NULL DEFAULT 0,
    section1_missed INTEGER NOT NULL DEFAULT 0,
    section1_wrong INTEGER NOT NULL DEFAULT 0,
    section1_score INTEGER NOT NULL DEFAULT 0,
    
    -- Bölüm 2 sonuçları
    section2_correct INTEGER NOT NULL DEFAULT 0,
    section2_missed INTEGER NOT NULL DEFAULT 0,
    section2_wrong INTEGER NOT NULL DEFAULT 0,
    section2_score INTEGER NOT NULL DEFAULT 0,
    
    -- Bölüm 3 sonuçları
    section3_correct INTEGER NOT NULL DEFAULT 0,
    section3_missed INTEGER NOT NULL DEFAULT 0,
    section3_wrong INTEGER NOT NULL DEFAULT 0,
    section3_score INTEGER NOT NULL DEFAULT 0,
    
    -- Detaylı veri (markedChars, timing gibi ek bilgiler)
    detailed_results JSONB,
    
    -- Meta bilgiler
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS politikaları
ALTER TABLE public.burdon_test_results ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi test sonuçlarını görebilir
CREATE POLICY "Users can view their own burdon test results" 
ON public.burdon_test_results 
FOR SELECT 
USING (user_id = auth.uid() OR conducted_by = auth.uid());

-- Kullanıcılar kendi test sonuçlarını ekleyebilir
CREATE POLICY "Users can insert their own burdon test results" 
ON public.burdon_test_results 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR conducted_by = auth.uid());

-- Eğitmenler ve adminler tüm sonuçları görebilir
CREATE POLICY "Trainers and admins can view all burdon test results" 
ON public.burdon_test_results 
FOR SELECT 
USING (has_role(get_current_user(), 'admin'::user_role) OR has_role(get_current_user(), 'trainer'::user_role));

-- Eğitmenler ve adminler tüm sonuçları yönetebilir
CREATE POLICY "Trainers and admins can manage all burdon test results" 
ON public.burdon_test_results 
FOR ALL 
USING (has_role(get_current_user(), 'admin'::user_role) OR has_role(get_current_user(), 'trainer'::user_role));

-- Updated at trigger
CREATE TRIGGER update_burdon_test_results_updated_at
    BEFORE UPDATE ON public.burdon_test_results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();