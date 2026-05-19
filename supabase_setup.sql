-- ==========================================
-- AVANTIES DATABASE MIGRATION & SETUP SCRIPT
-- ==========================================
-- Jalankan script ini di Supabase Dashboard Anda:
-- Project Anda -> SQL Editor -> New Query -> Paste script ini -> Klik RUN!

-- 1. Membuat tabel post_likes jika belum ada
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- 2. Mengaktifkan Row Level Security (RLS) pada post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- 3. Menghapus policy lama jika ada untuk menghindari konflik
DROP POLICY IF EXISTS "Public post likes viewable." ON public.post_likes;
DROP POLICY IF EXISTS "Users can like posts." ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike own likes." ON public.post_likes;

-- 4. Membuat policy baru yang aman
CREATE POLICY "Public post likes viewable." ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts." ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes." ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Membuat/memperbarui function trigger untuk mensinkronisasi jumlah like otomatis di tabel posts
CREATE OR REPLACE FUNCTION public.sync_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET likes = COALESCE(likes, 0) + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Menghubungkan function trigger ke tabel post_likes
DROP TRIGGER IF EXISTS post_likes_count_trigger ON public.post_likes;
CREATE TRIGGER post_likes_count_trigger
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.sync_post_likes_count();

-- 7. Membuat fungsi decrement_likes & increment_likes untuk fallback/kecocokan sistem lama
CREATE OR REPLACE FUNCTION public.increment_likes(post_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE public.posts SET likes = COALESCE(likes, 0) + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_likes(post_id BIGINT)
RETURNS void AS $$
BEGIN
    UPDATE public.posts SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Menambahkan kolom image_url pada tabel posts jika belum ada (untuk upload foto)
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 9. (Tambahan Opsional) Sinkronisasi komentar jika diperlukan
CREATE OR REPLACE FUNCTION public.sync_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET comments = COALESCE(comments, 0) + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET comments = GREATEST(COALESCE(comments, 0) - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS comments_count_trigger ON public.comments;
CREATE TRIGGER comments_count_trigger
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.sync_post_comments_count();
