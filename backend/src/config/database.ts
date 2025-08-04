import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseKey = process.env["SUPABASE_ANON_KEY"];

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database table schemas for reference
export const createTablesSQL = `
-- Users table (managed by Supabase Auth)
-- auth.users is automatically created by Supabase

-- URLs table
CREATE TABLE IF NOT EXISTS urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  visit_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  custom_slug BOOLEAN DEFAULT false
);

-- URL visits table for analytics
CREATE TABLE IF NOT EXISTS url_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url_id UUID REFERENCES urls(id) ON DELETE CASCADE,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referer TEXT
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_user_id ON urls(user_id);
CREATE INDEX IF NOT EXISTS idx_url_visits_url_id ON url_visits(url_id);
CREATE INDEX IF NOT EXISTS idx_url_visits_visited_at ON url_visits(visited_at);

-- Row Level Security (RLS) policies
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_visits ENABLE ROW LEVEL SECURITY;

-- Users can only see their own URLs
CREATE POLICY "Users can view own URLs" ON urls
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow anyone to access active URLs for redirects
CREATE POLICY "Anyone can access active URLs for redirects" ON urls
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can insert URLs" ON urls
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own URLs" ON urls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own URLs" ON urls
  FOR DELETE USING (auth.uid() = user_id);

-- URL visits policies
CREATE POLICY "Anyone can insert visits" ON url_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view visits for own URLs" ON url_visits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM urls 
      WHERE urls.id = url_visits.url_id 
      AND (urls.user_id = auth.uid() OR urls.user_id IS NULL)
    )
  );

-- Function to update visit count
CREATE OR REPLACE FUNCTION increment_visit_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE urls 
  SET visit_count = visit_count + 1, updated_at = NOW()
  WHERE id = NEW.url_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically increment visit count
CREATE TRIGGER trigger_increment_visit_count
  AFTER INSERT ON url_visits
  FOR EACH ROW
  EXECUTE FUNCTION increment_visit_count();
`;
