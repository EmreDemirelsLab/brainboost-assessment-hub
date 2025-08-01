-- 🔧 D2 TEST RLS POLICIES FIX
-- Auth.uid() ile users.id arasındaki mapping sorunu çözümü

-- Önce mevcut policy'leri kaldır
DROP POLICY IF EXISTS "Users can view their own d2 test results" ON d2_test_results;
DROP POLICY IF EXISTS "Trainers can view their students' d2 test results" ON d2_test_results;
DROP POLICY IF EXISTS "Trainers can insert d2 test results" ON d2_test_results;
DROP POLICY IF EXISTS "Trainers can update d2 test results" ON d2_test_results;

-- 🔐 DÜZELTILMIŞ RLS POLICIES
-- student_id ve conducted_by users.id kullanıyor, auth.uid() değil

CREATE POLICY "Users can view their own d2 test results" 
    ON d2_test_results FOR SELECT 
    USING (
        student_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Trainers can view their students' d2 test results" 
    ON d2_test_results FOR SELECT 
    USING (
        conducted_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        ) OR 
        student_id IN (
            SELECT u.id FROM users u 
            WHERE u.supervisor_id IN (
                SELECT id FROM users WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Trainers can insert d2 test results" 
    ON d2_test_results FOR INSERT 
    WITH CHECK (
        conducted_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Trainers can update d2 test results" 
    ON d2_test_results FOR UPDATE 
    USING (
        conducted_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- 📝 Policy açıklamaları
COMMENT ON POLICY "Users can view their own d2 test results" ON d2_test_results 
    IS 'Users can only view D2 test results where they are the student (using auth_user_id mapping)';

COMMENT ON POLICY "Trainers can insert d2 test results" ON d2_test_results 
    IS 'Users can only insert D2 test results where they are the conductor (using auth_user_id mapping)'; 