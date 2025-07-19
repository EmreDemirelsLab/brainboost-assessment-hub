-- Students tablosuna user_id için unique constraint ekle
ALTER TABLE public.students ADD CONSTRAINT students_user_id_unique UNIQUE (user_id);