-- Enable Real-time for NorChain API Tables
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)

-- Enable real-time for blocks
ALTER PUBLICATION supabase_realtime ADD TABLE blocks;

-- Enable real-time for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Enable real-time for token_transfers
ALTER PUBLICATION supabase_realtime ADD TABLE token_transfers;

-- Enable real-time for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Verify real-time is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Real-time enabled for blocks, transactions, token_transfers, notifications';
END $$;

