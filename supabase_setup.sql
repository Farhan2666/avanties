CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public post likes viewable." ON public.post_likes;
DROP POLICY IF EXISTS "Users can like posts." ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike own likes." ON public.post_likes;

CREATE POLICY "Public post likes viewable." ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts." ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own likes." ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

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

DROP TRIGGER IF EXISTS post_likes_count_trigger ON public.post_likes;
CREATE TRIGGER post_likes_count_trigger
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.sync_post_likes_count();

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

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url TEXT;

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

DROP POLICY IF EXISTS "Users can update own posts." ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts." ON public.posts;
DROP POLICY IF EXISTS "Users can delete posts." ON public.posts;
DROP POLICY IF EXISTS "Users can update posts." ON public.posts;

CREATE POLICY "Users can update posts." ON public.posts FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete posts." ON public.posts FOR DELETE USING (
    auth.uid() = author_id 
    OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND (LOWER(rank) LIKE '%admin%' OR LOWER(rank) LIKE '%owner%')
    )
);
