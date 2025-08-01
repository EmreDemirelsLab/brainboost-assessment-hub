// Users tablosu düzeldi mi test et
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gamjzzomkosvqhficabt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbWp6em9ta29zdnFoZmljYWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4ODc3MDAsImV4cCI6MjA2ODQ2MzcwMH0.r8KkywdhNSP1hxzSAlKo8SB5jOEb0KQRUBfZ9Va0p9I";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUsersTable() {
    console.log('🧪 USERS TABLOSU TEST EDİLİYOR...');
    
    try {
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
            
        if (error) {
            console.log(`❌ Users tablo hatası: ${error.message}`);
        } else {
            console.log(`✅ Users tablosu çalışıyor! (${count || 0} kayıt)`);
        }
    } catch (err) {
        console.log(`❌ Test hatası: ${err.message}`);
    }
}

testUsersTable().catch(console.error);