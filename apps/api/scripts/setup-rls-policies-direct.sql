-- Row Level Security (RLS) Policies for Supabase
-- Run this SQL in Supabase Dashboard → SQL Editor

-- Enable Row Level Security on user tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can manage own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- API keys table policies
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own API keys" ON api_keys
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Notifications table policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies created successfully!';
END $$;

