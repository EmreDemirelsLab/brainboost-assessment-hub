# Supabase Entegrasyon Rehberi (Bilişsel Testler)

Bu doküman, proje içinde kullanılan Supabase tablo şemaları, RLS politikaları ve istemci tarafı (HTML) kayıt yöntemlerini özetler. Puzzle ve Akıl-Mantık testleri için uygulanan akışlar birebir örneklenmiştir. D2, Burdon vb. diğer testler için de aynı desenle ilerleyebilirsiniz.

İçindekiler:
1. Genel Mimarinin Özeti
2. Puzzle Testi
   - Tablo Şeması
   - RLS Politikaları
   - İstemci (HTML) Kayıt Akışı
3. Akıl-Mantık Testi
   - Tablo Şeması
   - RLS Politikaları
   - İstemci (HTML) Kayıt Akışı
4. Ortak Pratikler ve Notlar
   - Users Eşleşmesi
   - localStorage Ayarları
   - Hata Yönetimi ve Pending/Failed Kuyruğu
   - İndeksler ve Performans
5. Sık Karşılaşılan Problemler ve Çözümler
6. Ekler: Direkt Yapıştırılabilir SQL’ler

---

## 1) Genel Mimarinin Özeti

- Her test sonucu, ilgili public.<test_tablosu> tablosuna yazılır.
- RLS (Row Level Security) aktiftir. Politikalar, oturum açmış kullanıcının (auth.uid()) sadece kendi veya süpervizörü olduğu öğrencilerin sonuçlarını görmesine/yazmasına izin verir.
- İstemci tarafında Supabase UMD (https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js) ile createClient oluşturulur. localStorage’dan sb-url ve sb-anon-key alınır.
- Kayıt akışı:
  1) supabase.auth.getUser() → kullanıcı giriş kontrolü
  2) users tablosunda auth_user_id = user.id satırı çekilir
  3) student_id = userData.id (temel akış), conducted_by = supervisor_id varsa o, yoksa userData.id
  4) mapped payload → supabase.from('<tablo>').insert([payload]).select()

---

## 2) Puzzle Testi

### 2.1 Tablo Şeması (Örnek)
Bu şema proje içinde kullanıma uygun, geniş alan seti içerir.

```
create table if not exists public.puzzle_test_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete restrict,
  conducted_by uuid not null references public.users(id) on delete restrict,
  test_start_time timestamptz not null,
  test_end_time timestamptz not null,
  test_duration_seconds integer not null,
  completion_status text not null check (completion_status in ('completed','timeout','aborted')),
  total_correct integer not null default 0,
  total_wrong integer not null default 0,
  total_missed integer not null default 0,
  accuracy_percentage numeric not null default 0,
  average_response_time_ms integer not null default 0,
  four_piece_score integer not null default 0,
  six_piece_score integer not null default 0,
  nine_piece_score integer not null default 0,
  sixteen_piece_score integer not null default 0,
  spatial_reasoning_score integer not null default 0,
  pattern_recognition_score integer not null default 0,
  problem_solving_score integer not null default 0,
  cognitive_flexibility_score integer not null default 0,
  fastest_response_ms integer not null default 0,
  slowest_response_ms integer not null default 0,
  response_time_variance numeric not null default 0,
  detailed_responses jsonb not null default '{}'::jsonb,
  time_series_analysis jsonb not null default '{}'::jsonb,
  performance_trends jsonb not null default '{}'::jsonb,
  error_patterns jsonb not null default '{}'::jsonb,
  notes text null,
  browser_info jsonb null,
  device_info jsonb null,
  ip_address text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Not: created_at ve updated_at alanları için trigger ile updated_at güncellemesi ekleyebilirsiniz.

### 2.2 RLS Politikaları

```
alter table public.puzzle_test_results enable row level security;

create policy "insert_own_or_supervised_puzzle"
on public.puzzle_test_results for insert to authenticated
with check (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (
        u.id = puzzle_test_results.student_id
        or puzzle_test_results.conducted_by = u.id
        or (puzzle_test_results.student_id in (select s.id from public.users s where s.supervisor_id = u.id))
      )
  )
);

create policy "select_own_or_supervised_puzzle"
on public.puzzle_test_results for select to authenticated
using (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (
        u.id = puzzle_test_results.student_id
        or puzzle_test_results.conducted_by = u.id
        or (puzzle_test_results.student_id in (select s.id from public.users s where s.supervisor_id = u.id))
      )
  )
);
```

### 2.3 İstemci (HTML) Kayıt Akışı

- public/cognitive-tests/puzzle/puzzle.html dosyasında:
  - UMD script ile supabase client oluşturma: onload + güvenli retry
  - Test tamamlanınca displayTestResults → mappedData hazırla → saveToSupabaseProduction(mappedData)
  - saveToSupabaseProduction:
    - supabase.auth.getUser()
    - users tablosundan auth_user_id = user.id ile satır
    - conducted_by/ student_id belirle
    - supabase.from('puzzle_test_results').insert([finalData]).select()

- Olası hatalar ve yönetimi:
  - RLS: 42501 code
  - Foreign key: 23503
  - Tablo yok: 42P01
  - Bağlantı/Init yok: pendingPuzzleResults veya failedPuzzleResults localStorage anahtarları

---

## 3) Akıl-Mantık Testi

### 3.1 Tablo Şeması (Bölüm İsimli Alanlarla)
Bu tablo adlandırmaları, raporlama isteklerine uygun şekilde bölüm isimlerini kolon adlarına taşır.

```
create table if not exists public.akil_mantik_test_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete restrict,
  conducted_by uuid not null references public.users(id) on delete restrict,
  test_start_time timestamptz not null,
  test_end_time timestamptz not null,
  test_duration_seconds integer not null check (test_duration_seconds >= 0),
  total_questions integer not null default 23 check (total_questions > 0),
  answered_questions integer not null default 0 check (answered_questions >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  wrong_answers integer not null default 0 check (wrong_answers >= 0),
  unanswered_questions integer not null default 0 check (unanswered_questions >= 0),
  success_rate numeric(5,2) not null default 0,
  speed_score numeric(5,2) not null default 0,
  avg_response_time_ms integer not null default 0,
  total_response_time_ms integer not null default 0,

  dortlu_yatay_correct integer not null default 0,
  dortlu_yatay_wrong integer not null default 0,
  dortlu_yatay_total integer not null default 8,
  dortlu_yatay_accuracy_percentage numeric(5,2) not null default 0,
  dortlu_yatay_avg_response_time_ms integer not null default 0,
  dortlu_yatay_completion_time_seconds integer not null default 0,

  dortlu_kare_correct integer not null default 0,
  dortlu_kare_wrong integer not null default 0,
  dortlu_kare_total integer not null default 6,
  dortlu_kare_accuracy_percentage numeric(5,2) not null default 0,
  dortlu_kare_avg_response_time_ms integer not null default 0,
  dortlu_kare_completion_time_seconds integer not null default 0,

  altili_kare_correct integer not null default 0,
  altili_kare_wrong integer not null default 0,
  altili_kare_total integer not null default 3,
  altili_kare_accuracy_percentage numeric(5,2) not null default 0,
  altili_kare_avg_response_time_ms integer not null default 0,
  altili_kare_completion_time_seconds integer not null default 0,

  l_format_correct integer not null default 0,
  l_format_wrong integer not null default 0,
  l_format_total integer not null default 3,
  l_format_accuracy_percentage numeric(5,2) not null default 0,
  l_format_avg_response_time_ms integer not null default 0,
  l_format_completion_time_seconds integer not null default 0,

  dokuzlu_format_correct integer not null default 0,
  dokuzlu_format_wrong integer not null default 0,
  dokuzlu_format_total integer not null default 3,
  dokuzlu_format_accuracy_percentage numeric(5,2) not null default 0,
  dokuzlu_format_avg_response_time_ms integer not null default 0,
  dokuzlu_format_completion_time_seconds integer not null default 0,

  last_question_reached integer not null default 0,
  example_attempts integer not null default 0,
  example_correct_count integer not null default 0,

  section_results jsonb not null default '{}'::jsonb,
  detailed_answers jsonb not null default '[]'::jsonb,
  impulsivity_analysis jsonb not null default '{}'::jsonb,
  detailed_statistics jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);
```

### 3.2 RLS Politikaları

```
alter table public.akil_mantik_test_results enable row level security;

create policy "insert_own_or_supervised_akil_mantik"
on public.akil_mantik_test_results
for insert
to authenticated
with check (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (
        u.id = akil_mantik_test_results.student_id
        or akil_mantik_test_results.conducted_by = u.id
        or akil_mantik_test_results.student_id in (
          select s.id from public.users s where s.supervisor_id = u.id
        )
      )
  )
);

create policy "select_own_or_supervised_akil_mantik"
on public.akil_mantik_test_results
for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (
        u.id = akil_mantik_test_results.student_id
        or akil_mantik_test_results.conducted_by = u.id
        or akil_mantik_test_results.student_id in (
          select s.id from public.users s where s.supervisor_id = u.id
        )
      )
  )
);
```

### 3.3 İstemci (HTML) Kayıt Akışı

- public/cognitive-tests/akil-mantik/akil-mantik.html dosyasında:
  - UMD script ile supabase client oluşturma (retry ile)
  - Test bitince saveTestResults(results) → Supabase insert
  - Mapping:
    - Zamanlar: test_start_time (ISO), test_end_time (ISO), test_duration_seconds
    - Genel: total_questions=23, answered/correct/wrong/unanswered, success_rate, hız skorları
    - Bölümler: sectionResults[1..5] → dortlu_yatay_*, dortlu_kare_*, altili_kare_*, l_format_*, dokuzlu_format_*
    - JSONB: section_results, detailed_answers, impulsivity_analysis, detailed_statistics
  - Hata durumunda: pendingAkilMantik, failedAkilMantik localStorage anahtarları

---

## 4) Ortak Pratikler ve Notlar

- Users Eşleşmesi:
  - users tablosunda auth_user_id = auth.uid() eşleşmesi zorunlu. Öğrenci kimliği (student_id) ve conducted_by için kritik.

- localStorage Ayarları:
  - sb-url = Supabase Project URL (ör: https://xxxxx.supabase.co)
  - sb-anon-key = Supabase ANON KEY
  - Bu değerler login akışında veya dashboard → test açılışı sırasında set edilmelidir.

- Hata Yönetimi ve Kuyruk:
  - Oturum/Init eksikliği: pendingPuzzleResults / pendingAkilMantik
  - Insert hatası: failedPuzzleResults / failedAkilMantik
  - Konsolda insertError.code 42501 (RLS), 23503 (FK), 42P01 (table) gibi kodlar görülür.

- İndeksler:
  - student_id, conducted_by, created_at üzerinde indeks açın.
  - Örnek:
    ```
    create index if not exists idx_puzzle_student_id on public.puzzle_test_results(student_id);
    create index if not exists idx_puzzle_conducted_by on public.puzzle_test_results(conducted_by);
    create index if not exists idx_puzzle_created_at on public.puzzle_test_results(created_at);

    create index if not exists idx_akm_student_id on public.akil_mantik_test_results(student_id);
    create index if not exists idx_akm_conducted_by on public.akil_mantik_test_results(conducted_by);
    create index if not exists idx_akm_created_at on public.akil_mantik_test_results(created_at);
    ```

---

## 5) Sık Karşılaşılan Problemler ve Çözümler

- UMD global bulunamadı:
  - Çözüm: UMD src olarak /dist/umd/supabase.js kullanın ve onload + retry uygulayın.

- Auth yok:
  - getUser() null döner → pending kuyruğuna yazın ve kullanıcıyı login’e yönlendirin.

- users eşleşmesi yok:
  - users.auth_user_id = auth.uid() satırı eklenmeli (giriş yapan kullanıcı için).

- RLS/Policy hatası (42501):
  - conducted_by ve student_id ilişkilerini ve policy koşullarını doğrulayın.

- Tablo yok (42P01):
  - SQL şemalarını uygulayın. Migration repo’da tutun.

---

## 6) Ekler: Direkt Yapıştırılabilir SQL’ler

### 6.1 Akıl-Mantık Tablosu + RLS + İndeksler

```
create table if not exists public.akil_mantik_test_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete restrict,
  conducted_by uuid not null references public.users(id) on delete restrict,
  test_start_time timestamptz not null,
  test_end_time timestamptz not null,
  test_duration_seconds integer not null check (test_duration_seconds >= 0),
  total_questions integer not null default 23 check (total_questions > 0),
  answered_questions integer not null default 0 check (answered_questions >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  wrong_answers integer not null default 0 check (wrong_answers >= 0),
  unanswered_questions integer not null default 0 check (unanswered_questions >= 0),
  success_rate numeric(5,2) not null default 0,
  speed_score numeric(5,2) not null default 0,
  avg_response_time_ms integer not null default 0,
  total_response_time_ms integer not null default 0,
  dortlu_yatay_correct integer not null default 0,
  dortlu_yatay_wrong integer not null default 0,
  dortlu_yatay_total integer not null default 8,
  dortlu_yatay_accuracy_percentage numeric(5,2) not null default 0,
  dortlu_yatay_avg_response_time_ms integer not null default 0,
  dortlu_yatay_completion_time_seconds integer not null default 0,
  dortlu_kare_correct integer not null default 0,
  dortlu_kare_wrong integer not null default 0,
  dortlu_kare_total integer not null default 6,
  dortlu_kare_accuracy_percentage numeric(5,2) not null default 0,
  dortlu_kare_avg_response_time_ms integer not null default 0,
  dortlu_kare_completion_time_seconds integer not null default 0,
  altili_kare_correct integer not null default 0,
  altili_kare_wrong integer not null default 0,
  altili_kare_total integer not null default 3,
  altili_kare_accuracy_percentage numeric(5,2) not null default 0,
  altili_kare_avg_response_time_ms integer not null default 0,
  altili_kare_completion_time_seconds integer not null default 0,
  l_format_correct integer not null default 0,
  l_format_wrong integer not null default 0,
  l_format_total integer not null default 3,
  l_format_accuracy_percentage numeric(5,2) not null default 0,
  l_format_avg_response_time_ms integer not null default 0,
  l_format_completion_time_seconds integer not null default 0,
  dokuzlu_format_correct integer not null default 0,
  dokuzlu_format_wrong integer not null default 0,
  dokuzlu_format_total integer not null default 3,
  dokuzlu_format_accuracy_percentage numeric(5,2) not null default 0,
  dokuzlu_format_avg_response_time_ms integer not null default 0,
  dokuzlu_format_completion_time_seconds integer not null default 0,
  last_question_reached integer not null default 0,
  example_attempts integer not null default 0,
  example_correct_count integer not null default 0,
  section_results jsonb not null default '{}'::jsonb,
  detailed_answers jsonb not null default '[]'::jsonb,
  impulsivity_analysis jsonb not null default '{}'::jsonb,
  detailed_statistics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.akil_mantik_test_results enable row level security;

create policy "insert_own_or_supervised_akil_mantik"
on public.akil_mantik_test_results
for insert
to authenticated
with check (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (
        u.id = akil_mantik_test_results.student_id
        or akil_mantik_test_results.conducted_by = u.id
        or akil_mantik_test_results.student_id in (
          select s.id from public.users s where s.supervisor_id = u.id
        )
      )
  )
);

create policy "select_own_or_supervised_akil_mantik"
on public.akil_mantik_test_results
for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (
        u.id = akil_mantik_test_results.student_id
        or akil_mantik_test_results.conducted_by = u.id
        or akil_mantik_test_results.student_id in (
          select s.id from public.users s where s.supervisor_id = u.id
        )
      )
  )
);

create index if not exists idx_akm_student_id on public.akil_mantik_test_results(student_id);
create index if not exists idx_akm_conducted_by on public.akil_mantik_test_results(conducted_by);
create index if not exists idx_akm_created_at on public.akil_mantik_test_results(created_at);
```

### 6.2 Puzzle Tablosu İçin Örnek RLS (Şema sizde mevcutsa)
```
alter table public.puzzle_test_results enable row level security;

create policy "insert_own_or_supervised_puzzle"
on public.puzzle_test_results for insert to authenticated
with check (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (
        u.id = puzzle_test_results.student_id
        or puzzle_test_results.conducted_by = u.id
        or (puzzle_test_results.student_id in (select s.id from public.users s where s.supervisor_id = u.id))
      )
  )
);

create policy "select_own_or_supervised_puzzle"
on public.puzzle_test_results for select to authenticated
using (
  exists (
    select 1 from public.users u
    where u.auth_user_id = auth.uid()
      and (
        u.id = puzzle_test_results.student_id
        or puzzle_test_results.conducted_by = u.id
        or (puzzle_test_results.student_id in (select s.id from public.users s where s.supervisor_id = u.id))
      )
  )
);
```

---

Bu rehberdeki desen, diğer testler (Dikkat, Hafıza, Stroop vb.) için de aynı şekilde uygulanabilir:
- Uygun tablo şeması + RLS
- İstemci tarafında UMD + auth + users eşleşmesi + insert akışı
- Hata durumunda localStorage kuyruklama (pending/failed)
- Konsol logları ile izlenebilirlik
