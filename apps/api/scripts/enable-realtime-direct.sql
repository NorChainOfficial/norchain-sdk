-- Enable Real-time for Supabase Tables
-- Run this SQL in Supabase Dashboard → SQL Editor

-- Enable real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS token_transfers;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS notifications;

-- Verify tables are in publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Real-time enabled for blocks, transactions, token_transfers, notifications';
  RAISE NOTICE '📊 Verify in Dashboard → Database → Replication';
END $$;

