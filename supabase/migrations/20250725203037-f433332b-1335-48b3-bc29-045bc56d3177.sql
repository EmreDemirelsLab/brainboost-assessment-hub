-- FINAL SECURITY FIX: Enable RLS on remaining test tables and fix function security
-- This completes all critical security vulnerabilities

-- Enable RLS on all remaining test tables that still have issues
ALTER TABLE test_sonuclari ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_oturumlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE dikkat_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE hafiza_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE akil_mantik_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzle_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE stroop_testi_detaylari ENABLE ROW LEVEL SECURITY;
ALTER TABLE soru_cevaplari ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilissel_beceri_skorlari ENABLE ROW LEVEL SECURITY;

-- Fix remaining function security issue  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Verify all tables now have RLS enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;