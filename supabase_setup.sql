-- SECURITY FIX: Add missing columns to posts if they don't exist
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reports_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS reported_by UUID[] DEFAULT '{}';

-- SECURITY FIX: Add missing columns to profiles if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rank TEXT DEFAULT 'Newbie';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp_max INTEGER DEFAULT 1000;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Post likes table
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

-- Drop all existing post policies
DROP POLICY IF EXISTS "Users can update own posts." ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts." ON public.posts;
DROP POLICY IF EXISTS "Users can delete posts." ON public.posts;
DROP POLICY IF EXISTS "Users can update posts." ON public.posts;
DROP POLICY IF EXISTS "Admins can delete any post." ON public.posts;

-- SECURITY FIX: Only allow users to update their OWN posts (was: auth.uid() IS NOT NULL which allowed ANYONE)
CREATE POLICY "Users can update own posts." ON public.posts FOR UPDATE USING (auth.uid() = author_id);

-- SECURITY FIX: Only owner or exact admin/owner rank can delete (was: LIKE '%admin%' which could be exploited)
CREATE POLICY "Users can delete own posts." ON public.posts FOR DELETE USING (
    auth.uid() = author_id
    OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND (LOWER(rank) = 'admin' OR LOWER(rank) = 'owner')
    )
);

-- Drop existing profile policies
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- SECURITY FIX: Trigger to prevent non-admin users from setting rank to admin/owner
CREATE OR REPLACE FUNCTION public.prevent_rank_escalation()
RETURNS trigger AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the current user is already an admin/owner
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND (LOWER(rank) = 'admin' OR LOWER(rank) = 'owner')
  ) INTO is_admin;

  -- If user is NOT admin/owner and tries to set rank to admin/owner, block it
  IF NOT is_admin AND NEW.rank IS NOT NULL AND (LOWER(NEW.rank) = 'admin' OR LOWER(NEW.rank) = 'owner') THEN
    IF TG_OP = 'UPDATE' THEN
      NEW.rank := OLD.rank;
    ELSE
      NEW.rank := 'Newbie';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_rank_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_rank_escalation
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_rank_escalation();
