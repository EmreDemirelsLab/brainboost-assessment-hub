// Supervisor-Student ilişkisini debug edelim
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gamjzzomkosvqhficabt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbWp6em9ta29zdnFoZmljYWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4ODc3MDAsImV4cCI6MjA2ODQ2MzcwMH0.r8KkywdhNSP1hxzSAlKo8SB5jOEb0KQRUBfZ9Va0p9I';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbWp6em9ta29zdnFoZmljYWJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg4NzcwMCwiZXhwIjoyMDY4NDYzNzAwfQ.9U6pMgVM2Yld51vzMbG9UMpuCDAD3NfocQ9Sq9Tb6vk';

// Admin işlemler için service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Normal işlemler için anon
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugSupervisorStudent() {
  console.log('🔍 DEBUGGING SUPERVISOR-STUDENT İLİŞKİSİ');
  console.log('===============================');

  try {
    // İlk anon key ile dene - supervisor_id ile filtrele
    console.log('🔑 ANON KEY ile test - beyin antrenörü perspektifi...');
    const { data: anonTestUsers, error: anonError } = await supabase
      .from('users')
      .select('id, email, first_name, supervisor_id, roles')
      .contains('roles', '["kullanici"]')
      .eq('supervisor_id', '3b32b5b6-8b22-4ed2-860a-25a26651b6e6');

    console.log('📊 Anon sonuç:', {
      userCount: anonTestUsers?.length || 0,
      error: anonError ? {
        code: anonError.code,
        message: anonError.message,
        details: anonError.details,
        hint: anonError.hint
      } : null
    });

    // Şimdi admin key ile dene (eğer çalışırsa)
    console.log('\n🔑 SERVICE KEY ile test...');
    const { data: testUsers, error: testError } = await supabaseAdmin
      .from('users')
      .select('id');

    if (testError) {
      console.error('❌ Service key test error:', testError);
      console.log('📊 Hata detayları:', {
        code: testError.code,
        message: testError.message,
        details: testError.details,
        hint: testError.hint
      });
      
      // Service key çalışmıyorsa anon ile devam et
      console.log('\n⭐ Service key çalışmıyor, anon key ile devam ediliyor...');
      if (anonError) {
        console.log('❌ Anon key de çalışmıyor, işlem durduruluyor.');
        return;
      }
      // Anon başarılıysa onunla devam et
      console.log(`✅ Anon key ile ${anonTestUsers?.length || 0} kullanıcı bulundu`);
    } else {
      console.log(`✅ Service key ile ${testUsers?.length || 0} kullanıcı bulundu`);
    }

    const userCount = testUsers?.length || 0;
    console.log(`📊 TOPLAM KULLANICI SAYISI: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️ Users tablosu boş! Önce test kullanıcıları oluşturalım...');
      await createTestUsers();
      return;
    }
    // 1. Tüm kullanıcıları listele (Admin ile)
    const { data: allUsers, error: allError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, roles, supervisor_id, created_at')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching users:', allError);
      return;
    }

    console.log('📊 TÜM KULLANICILAR:');
    allUsers.forEach((user, index) => {
      const roles = Array.isArray(user.roles) ? user.roles : ['bilinmiyor'];
      console.log(`${index + 1}. ${user.first_name} ${user.last_name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎭 Roller: ${roles.join(', ')}`);
      console.log(`   👤 ID: ${user.id}`);
      console.log(`   👨‍🏫 Supervisor ID: ${user.supervisor_id || 'YOK'}`);
      console.log(`   📅 Oluşturulma: ${new Date(user.created_at).toLocaleString('tr-TR')}`);
      console.log('   ---');
    });

    // 2. Beyin antrenörlerini bul
    const trainers = allUsers.filter(user => 
      Array.isArray(user.roles) && user.roles.includes('beyin_antrenoru')
    );

    console.log(`\n👨‍🏫 BEYİN ANTRENÖRLERİ (${trainers.length} kişi):`);
    trainers.forEach(trainer => {
      console.log(`   • ${trainer.first_name} ${trainer.last_name} (${trainer.email})`);
      console.log(`     ID: ${trainer.id}`);
    });

    // 3. Her beyin antrenörünün öğrencilerini bul
    for (const trainer of trainers) {
      console.log(`\n🎯 ${trainer.first_name} ${trainer.last_name} ANTRENÖRÜNÜN ÖĞRENCİLERİ:`);
      
      const students = allUsers.filter(user => 
        user.supervisor_id === trainer.id && 
        Array.isArray(user.roles) && 
        user.roles.includes('kullanici')
      );

      if (students.length === 0) {
        console.log('   ❌ Öğrenci bulunamadı!');
        console.log(`   🔍 Kontrollar:`);
        console.log(`      - Antrenör ID: ${trainer.id}`);
        console.log(`      - Bu ID'ye bağlı users: ${allUsers.filter(u => u.supervisor_id === trainer.id).length} kişi`);
        
        // Bu antrenörün supervisor_id'si olan kullanıcıları listele
        const anyStudents = allUsers.filter(u => u.supervisor_id === trainer.id);
        if (anyStudents.length > 0) {
          console.log(`   📝 Supervisor_id eşleşen ama kullanici rolü olmayan kayıtlar:`);
          anyStudents.forEach(s => {
            const roles = Array.isArray(s.roles) ? s.roles : ['bilinmiyor'];
            console.log(`      • ${s.first_name} ${s.last_name} - Roller: ${roles.join(', ')}`);
          });
        }
      } else {
        console.log(`   ✅ ${students.length} öğrenci bulundu:`);
        students.forEach(student => {
          console.log(`      • ${student.first_name} ${student.last_name} (${student.email})`);
          console.log(`        ID: ${student.id}, Oluşturulma: ${new Date(student.created_at).toLocaleString('tr-TR')}`);
        });
      }
    }

    // 4. Yetim öğrencileri bul (supervisor_id null olanlar)
    const orphanStudents = allUsers.filter(user => 
      !user.supervisor_id && 
      Array.isArray(user.roles) && 
      user.roles.includes('kullanici')
    );

    console.log(`\n🏠 YETİM ÖĞRENCİLER (Supervisor ID null, ${orphanStudents.length} kişi):`);
    orphanStudents.forEach(student => {
      console.log(`   • ${student.first_name} ${student.last_name} (${student.email})`);
      console.log(`     Oluşturulma: ${new Date(student.created_at).toLocaleString('tr-TR')}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function createTestUsers() {
  console.log('🔧 TEST KULLANICILARI OLUŞTURULUYOR...');
  
  try {
    console.log('🔍 Mevcut auth kullanıcılarını kontrol ediyor...');
    
    // Service role ile auth.users'ı sorgula (RLS bypass)
    const { data: authUsers, error: authListError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authListError) {
      console.error('❌ Auth list error:', authListError);
      return;
    }
    
    console.log(`📊 Toplam auth kullanıcısı: ${authUsers.users.length}`);
    
    for (const authUser of authUsers.users) {
      console.log(`👤 Processing: ${authUser.email}`);
      
      // Bu auth user'ın users tablosunda kaydı var mı kontrol et
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Check error:', checkError);
        continue;
      }
      
      if (existingUser) {
        console.log(`   ✅ Zaten users tablosunda kayıtlı`);
        continue;
      }
      
      // Users tablosuna ekle - RLS bypass için service role kullan
      const userData = {
        auth_user_id: authUser.id,
        email: authUser.email,
        first_name: authUser.user_metadata?.first_name || 'Test',
        last_name: authUser.user_metadata?.last_name || 'User',
        roles: authUser.email.includes('antrenor') ? ['beyin_antrenoru'] : ['kullanici'],
        supervisor_id: null // İlk oluşturmada null, sonra güncelleriz
      };
      
      console.log(`   🔄 Users tablosuna ekleniyor (Admin ile)...`);
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Admin insert error:', insertError);
        console.log('   📊 Hata detayları:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
      } else {
        console.log(`   ✅ Admin ile eklendi:`, newUser.id);
      }
    }
    
    // Şimdi supervisor ilişkilerini kur
    console.log('\n🔗 SUPERVISOR İLİŞKİLERİNİ KURUYOR...');
    
    // Tüm kullanıcıları tekrar çek
    const { data: allUsers, error: allError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, roles, supervisor_id')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Error fetching users for relationships:', allError);
      return;
    }
    
    console.log(`📊 Users tablosunda toplam: ${allUsers.length} kullanıcı`);
    
    // Beyin antrenörlerini bul
    const trainers = allUsers.filter(u => 
      Array.isArray(u.roles) && u.roles.includes('beyin_antrenoru')
    );
    
    // Öğrencileri bul (supervisor_id null olanlar)
    const unassignedStudents = allUsers.filter(u => 
      Array.isArray(u.roles) && u.roles.includes('kullanici') && !u.supervisor_id
    );
    
    console.log(`👨‍🏫 Antrenör sayısı: ${trainers.length}`);
    console.log(`👤 Atanmamış öğrenci sayısı: ${unassignedStudents.length}`);
    
    // Her antrenöre öğrenci ata
    for (let i = 0; i < trainers.length && i < unassignedStudents.length; i++) {
      const trainer = trainers[i];
      const student = unassignedStudents[i];
      
      console.log(`🔗 ${student.first_name} -> ${trainer.first_name} bağlanıyor...`);
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ supervisor_id: trainer.id })
        .eq('id', student.id);
      
      if (updateError) {
        console.error('❌ Supervisor update error:', updateError);
      } else {
        console.log('   ✅ Bağlantı kuruldu!');
      }
    }
    
    // Final kontrol
    console.log('\n🔍 FİNAL KONTROL...');
    await debugSupervisorStudent();

  } catch (error) {
    console.error('❌ Test user creation error:', error);
  }
}

// debugSupervisorStudent();

// RLS deploy fonksiyonu
async function deployRLSPolicy() {
  console.log('🚀 DEPLOYING NEW RLS POLICY TO PRODUCTION...');
  console.log('===============================================');

  try {
    const rlsCommands = [
      'DROP POLICY IF EXISTS "users_select_policy" ON "public"."users"',
      'DROP POLICY IF EXISTS "users_insert_policy" ON "public"."users"',
      'DROP POLICY IF EXISTS "users_update_policy" ON "public"."users"',
      'DROP POLICY IF EXISTS "users_delete_policy" ON "public"."users"',
      'DROP POLICY IF EXISTS "users_select_simple" ON "public"."users"',
      'DROP POLICY IF EXISTS "users_insert_simple" ON "public"."users"',
      'DROP POLICY IF EXISTS "users_update_simple" ON "public"."users"',
      'DROP POLICY IF EXISTS "users_delete_simple" ON "public"."users"',
      `CREATE POLICY "users_select_simple" ON "public"."users" 
FOR SELECT USING (
    auth_user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM "public"."users" u 
        WHERE u.auth_user_id = auth.uid() 
        AND (
            u.roles ? 'admin' 
            OR u.roles ? 'temsilci' 
            OR u.roles ? 'beyin_antrenoru'
            OR u.roles ? 'trainer'
        )
    )
    OR
    supervisor_id = (
        SELECT u.id FROM "public"."users" u 
        WHERE u.auth_user_id = auth.uid()
    )
)`,
      `CREATE POLICY "users_insert_simple" ON "public"."users" 
FOR INSERT WITH CHECK (
    auth_user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM "public"."users" u 
        WHERE u.auth_user_id = auth.uid() 
        AND (
            u.roles ? 'admin' 
            OR u.roles ? 'temsilci' 
            OR u.roles ? 'beyin_antrenoru'
            OR u.roles ? 'trainer'
        )
    )
)`,
      `CREATE POLICY "users_update_simple" ON "public"."users" 
FOR UPDATE USING (
    auth_user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM "public"."users" u 
        WHERE u.auth_user_id = auth.uid() 
        AND (u.roles ? 'admin' OR u.roles ? 'temsilci')
    )
    OR
    (
        supervisor_id = (
            SELECT u.id FROM "public"."users" u 
            WHERE u.auth_user_id = auth.uid()
        )
        AND EXISTS (
            SELECT 1 FROM "public"."users" u 
            WHERE u.auth_user_id = auth.uid() 
            AND (u.roles ? 'beyin_antrenoru' OR u.roles ? 'trainer')
        )
    )
)`,
      `CREATE POLICY "users_delete_simple" ON "public"."users" 
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM "public"."users" u 
        WHERE u.auth_user_id = auth.uid() 
        AND u.roles ? 'admin'
    )
)`
    ];

    console.log(`📝 Executing ${rlsCommands.length} RLS commands...`);
    
    for (const [index, command] of rlsCommands.entries()) {
      console.log(`📝 Executing command ${index + 1}/${rlsCommands.length}...`);
      
      const { error } = await supabaseAdmin.rpc('sql', { 
        query: command 
      });
      
      if (error) {
        console.error(`❌ Command ${index + 1} error:`, error);
      } else {
        console.log(`✅ Command ${index + 1} success`);
      }
    }

    // Test etmek için tekrar öğrenci sorgusunu çalıştır
    console.log('\n🧪 Testing new RLS policy with anon user...');
    
    const { data: testResults, error: testError } = await supabase
      .from('users')
      .select('id, email, first_name, supervisor_id, roles')
      .contains('roles', '["kullanici"]')
      .eq('supervisor_id', '3b32b5b6-8b22-4ed2-860a-25a26651b6e6');
    
    console.log('🧪 Test Result:', {
      studentCount: testResults?.length || 0,
      error: testError ? {
        code: testError.code,
        message: testError.message
      } : null,
      students: testResults?.map(s => ({
        name: `${s.first_name}`,
        email: s.email
      })) || []
    });

  } catch (error) {
    console.error('❌ Deployment error:', error);
  }
}

// deployRLSPolicy();

// Hızlı auth test
async function quickAuthTest() {
  console.log('🧪 QUICK AUTH TEST');
  console.log('==================');
  
  // Auth user olarak login olmayı simüle et
  console.log('🔑 Auth user olarak login olmayı simüle ediyor...');
  
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'beyin@emre.com',
    password: 'your_password_here' // Bu şifreyi bilmiyoruz
  });
  
  if (loginError) {
    console.log('❌ Login başarısız (normal - şifre bilmiyoruz)');
    console.log('📧 Şifresiz test yapalım...');
    
    // Şifresiz test - sadece session var mı kontrol et
    const { data: session } = await supabase.auth.getSession();
    console.log('🔑 Current session:', {
      hasSession: !!session.session,
      user_id: session.session?.user?.id,
      email: session.session?.user?.email
    });
    
    // Session yoksa manuel test
    if (!session.session) {
      console.log('❌ Session yok - bu yüzden RLS çalışmıyor!');
      console.log('💡 ÇÖZÜM: Frontend\'te login olmadan query yapıyoruz');
    }
  } else {
    console.log('✅ Login başarılı!');
    
    // Login olduktan sonra test
    const { data: testResults, error: testError } = await supabase
      .from('users')
      .select('id, email, first_name, supervisor_id, roles')
      .contains('roles', '["kullanici"]')
      .eq('supervisor_id', '3b32b5b6-8b22-4ed2-860a-25a26651b6e6');
    
    console.log('🧪 Login sonrası test:', {
      studentCount: testResults?.length || 0,
      error: testError,
      students: testResults
    });
  }
}

quickAuthTest();