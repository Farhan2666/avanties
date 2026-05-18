/**
 * Jalankan sekali untuk menambah tabel post_likes + trigger like/komentar:
 *   SUPABASE_DB_PASSWORD=xxx node migrate-likes.mjs
 */
import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { lookup } from 'dns/promises';

const { Client } = pg;

async function resolveDbHost(host) {
  try {
    const v6 = await lookup(host, { family: 6 });
    return { host: v6.address, servername: host };
  } catch {
    const v4 = await lookup(host, { family: 4 });
    return { host: v4.address, servername: host };
  }
}

if (existsSync('.env')) {
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

const dbHost = process.env.SUPABASE_DB_HOST || 'db.uaxzumwybijfjvfnnvbs.supabase.co';

const sql = `
CREATE TABLE IF NOT EXISTS post_likes (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public post likes viewable." ON post_likes;
DROP POLICY IF EXISTS "Users can like posts." ON post_likes;
DROP POLICY IF EXISTS "Users can unlike own likes." ON post_likes;

CREATE POLICY "Public post likes viewable." ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts." ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike own likes." ON post_likes FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION sync_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes = likes + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS post_likes_count_trigger ON post_likes;
CREATE TRIGGER post_likes_count_trigger
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION sync_post_likes_count();

CREATE OR REPLACE FUNCTION decrement_likes(post_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

async function main() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!password) {
    console.error('Set SUPABASE_DB_PASSWORD in .env');
    process.exit(1);
  }

  const { host, servername } = await resolveDbHost(dbHost);
  const client = new Client({
    host,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password,
    ssl: { rejectUnauthorized: false, servername },
  });

  await client.connect();
  await client.query(sql);
  console.log('Migration OK: post_likes + triggers ready');
  await client.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
