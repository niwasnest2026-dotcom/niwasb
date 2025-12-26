-- Blog Database Setup
-- Run this in your Supabase SQL Editor to create blog tables

-- 1. Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  author TEXT NOT NULL,
  published_date DATE,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  read_time INTEGER DEFAULT 5,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Create blog_categories table (optional - for better category management)
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3AAFA9',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert default categories
INSERT INTO blog_categories (name, description, color) VALUES
  ('PG Tips', 'Tips and guides for PG accommodation', '#3AAFA9'),
  ('Co-living', 'Modern co-living space insights', '#2B7A78'),
  ('City Guides', 'Area-specific accommodation guides', '#17252A'),
  ('Safety', 'Safety tips and guidelines', '#DEF2F1'),
  ('Lifestyle', 'Living tips and lifestyle advice', '#FEFFFF'),
  ('Legal', 'Legal aspects and tenant rights', '#3AAFA9')
ON CONFLICT (name) DO NOTHING;

-- 4. Create blog_likes table (for tracking user likes)
CREATE TABLE IF NOT EXISTS blog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blog_post_id, user_id)
);

-- 5. Create blog_views table (for tracking views)
CREATE TABLE IF NOT EXISTS blog_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_date ON blog_posts(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_likes_post_id ON blog_likes(blog_post_id);
CREATE INDEX IF NOT EXISTS idx_blog_views_post_id ON blog_views(blog_post_id);

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trigger_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at();

-- 9. Create function to increment view count
CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID, user_ip INET DEFAULT NULL, user_agent_string TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  -- Insert view record
  INSERT INTO blog_views (blog_post_id, ip_address, user_agent)
  VALUES (post_id, user_ip, user_agent_string);
  
  -- Update view count in blog_posts
  UPDATE blog_posts 
  SET views = views + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to toggle like
CREATE OR REPLACE FUNCTION toggle_blog_like(post_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM blog_likes 
    WHERE blog_post_id = post_id AND user_id = user_id
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM blog_likes 
    WHERE blog_post_id = post_id AND user_id = user_id;
    
    -- Decrease like count
    UPDATE blog_posts 
    SET likes = GREATEST(0, likes - 1) 
    WHERE id = post_id;
    
    RETURN FALSE;
  ELSE
    -- Add like
    INSERT INTO blog_likes (blog_post_id, user_id) 
    VALUES (post_id, user_id);
    
    -- Increase like count
    UPDATE blog_posts 
    SET likes = likes + 1 
    WHERE id = post_id;
    
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 11. Insert sample blog posts
INSERT INTO blog_posts (
  title, excerpt, content, featured_image, author, published_date, 
  category, tags, read_time, views, likes, status
) VALUES
(
  'Top 10 Things to Consider When Choosing Your First PG',
  'Moving to a new city for work or studies? Here are the essential factors you should consider when selecting the perfect paying guest accommodation.',
  '<h2>Introduction</h2><p>Moving to a new city for work or studies can be both exciting and overwhelming. One of the most crucial decisions you''ll make is choosing the right paying guest (PG) accommodation.</p><h2>1. Location and Connectivity</h2><p>The location of your PG should be your top priority. Consider proximity to your workplace, public transportation, and essential amenities.</p><h2>2. Safety and Security</h2><p>Your safety should never be compromised. Look for 24/7 security, CCTV surveillance, and secure entry points.</p>',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=400&fit=crop',
  'Priya Sharma',
  '2024-12-20',
  'PG Tips',
  ARRAY['PG', 'Accommodation', 'Tips', 'First Time'],
  5,
  1250,
  89,
  'published'
),
(
  'Co-living vs Traditional PG: Which is Right for You?',
  'Explore the differences between modern co-living spaces and traditional PG accommodations to make the best choice for your lifestyle.',
  '<h2>Understanding Co-living</h2><p>Co-living represents a modern approach to shared living, emphasizing community and convenience.</p><h2>Traditional PG Benefits</h2><p>Traditional PGs offer affordability and simplicity, making them ideal for budget-conscious individuals.</p>',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=400&fit=crop',
  'Rahul Verma',
  '2024-12-18',
  'Co-living',
  ARRAY['Co-living', 'PG', 'Comparison', 'Lifestyle'],
  7,
  980,
  67,
  'published'
),
(
  'Safety Tips for Women in PG Accommodations',
  'Essential safety guidelines and red flags to watch out for when choosing and living in PG accommodations as a woman.',
  '<h2>Choosing a Safe PG</h2><p>Research the neighborhood, check security measures, and trust your instincts during visits.</p><h2>Daily Safety Practices</h2><p>Maintain awareness of your surroundings and establish safety routines.</p>',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=400&fit=crop',
  'Meera Joshi',
  '2024-12-12',
  'Safety',
  ARRAY['Safety', 'Women', 'PG', 'Security'],
  6,
  2100,
  156,
  'published'
);

-- 12. Enable Row Level Security (RLS) - Optional
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_views ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS policies (uncomment if you want to enable RLS)
-- CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (true);
-- CREATE POLICY "Only admins can manage blog posts" ON blog_posts FOR ALL USING (
--   EXISTS (
--     SELECT 1 FROM profiles 
--     WHERE profiles.id = auth.uid() AND profiles.is_admin = true
--   )
-- );

-- 14. Grant permissions
GRANT SELECT ON blog_posts TO anon, authenticated;
GRANT SELECT ON blog_categories TO anon, authenticated;
GRANT ALL ON blog_posts TO authenticated;
GRANT ALL ON blog_categories TO authenticated;
GRANT ALL ON blog_likes TO authenticated;
GRANT ALL ON blog_views TO authenticated;

-- 15. Show final status
SELECT 
  'BLOG DATABASE SETUP COMPLETE!' as message,
  COUNT(*) as sample_posts_created
FROM blog_posts;

-- 16. Show table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('blog_posts', 'blog_categories', 'blog_likes', 'blog_views')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;