-- ============================================
-- SUPABASE TABLE: chat_memory
-- For LifeAid AI Chat + Admin Dashboard
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MAIN TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_memory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add comment
COMMENT ON TABLE chat_memory IS 'Table to store chat history for n8n AI Agent memory and Admin Dashboard';

-- ============================================
-- INDEXES (for performance)
-- ============================================

-- Index on session_id for fetching chat history
CREATE INDEX IF NOT EXISTS idx_chat_memory_session_id 
ON chat_memory(session_id);

-- Index on created_at for sorting and filtering by date
CREATE INDEX IF NOT EXISTS idx_chat_memory_created_at 
ON chat_memory(created_at DESC);

-- Composite index for common admin queries
CREATE INDEX IF NOT EXISTS idx_chat_memory_session_created 
ON chat_memory(session_id, created_at DESC);

-- GIN index on metadata for faster JSONB queries (email search, etc)
CREATE INDEX IF NOT EXISTS idx_chat_memory_metadata 
ON chat_memory USING GIN(metadata);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Optional
-- ============================================

-- Enable RLS (uncomment if needed)
-- ALTER TABLE chat_memory ENABLE ROW LEVEL SECURITY;

-- Policy for anon users to read all (for admin dashboard)
-- CREATE POLICY "Allow anon read" ON chat_memory
--   FOR SELECT USING (true);

-- Policy for anon users to insert (for n8n webhook)
-- CREATE POLICY "Allow anon insert" ON chat_memory
--   FOR INSERT WITH CHECK (true);

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Uncomment to insert sample data:
/*
INSERT INTO chat_memory (session_id, role, content, metadata, created_at) VALUES
  ('test-session-001', 'user', 'Halo, saya ingin bertanya tentang produk Patient Lifter', 
   '{"name": "Budi Santoso", "email": "budi@example.com", "phone": "081234567890"}'::jsonb,
   NOW() - INTERVAL '2 hours'),
  ('test-session-001', 'assistant', 'Halo Budi! Terima kasih telah menghubungi LifeAid. Saya dengan senang hati akan membantu Anda. Kami memiliki SmartCare Electric Patient Lifter dengan kapasitas 180kg. Ada yang ingin Anda ketahui lebih lanjut?', 
   '{}'::jsonb,
   NOW() - INTERVAL '1 hour 59 minutes'),
  ('test-session-001', 'user', 'Berapa harganya?', 
   '{"name": "Budi Santoso", "email": "budi@example.com"}'::jsonb,
   NOW() - INTERVAL '1 hour 55 minutes'),
  ('test-session-001', 'assistant', 'Untuk harga SmartCare Electric Patient Lifter, silakan hubungi tim sales kami di 0812-1975-1605 atau email ke sales@lifeaidstore.com. Mereka dapat memberikan penawaran terbaik untuk Anda.', 
   '{}'::jsonb,
   NOW() - INTERVAL '1 hour 54 minutes'),
  ('test-session-002', 'user', 'Apakah ada garansi untuk produk?', 
   '{"name": "Siti Rahayu", "email": "siti@example.com"}'::jsonb,
   NOW() - INTERVAL '30 minutes'),
  ('test-session-002', 'assistant', 'Ya, semua produk LifeAid dilengkapi dengan garansi. SmartCare Electric Patient Lifter memiliki garansi motor 1 tahun dan garansi rangka 2 tahun.', 
   '{}'::jsonb,
   NOW() - INTERVAL '29 minutes');
*/

-- ============================================
-- USEFUL QUERIES FOR ADMIN DASHBOARD
-- ============================================

-- 1. Get all unique sessions with latest message
-- SELECT DISTINCT ON (session_id) 
--   session_id, 
--   metadata, 
--   content,
--   created_at
-- FROM chat_memory
-- ORDER BY session_id, created_at DESC;

-- 2. Get all messages for a specific session
-- SELECT * FROM chat_memory 
-- WHERE session_id = 'your-session-id' 
-- ORDER BY created_at ASC;

-- 3. Count unique sessions (Total Conversations)
-- SELECT COUNT(DISTINCT session_id) AS total_conversations 
-- FROM chat_memory;

-- 4. Count unique emails (Total Leads)
-- SELECT COUNT(DISTINCT metadata->>'email') AS total_leads 
-- FROM chat_memory 
-- WHERE metadata->>'email' IS NOT NULL;

-- 5. Count today's messages
-- SELECT COUNT(*) AS today_messages 
-- FROM chat_memory 
-- WHERE created_at >= CURRENT_DATE;

-- 6. Search by user email
-- SELECT * FROM chat_memory 
-- WHERE metadata->>'email' ILIKE '%example.com%';

-- ============================================
-- n8n WEBHOOK INSTRUCTIONS
-- ============================================
-- 
-- To SAVE messages (Insert):
--   Operation: Insert
--   Schema: public
--   Table: chat_memory
--   Columns: session_id, role, content, metadata
--
-- To LOAD context (Select):
--   SELECT role, content 
--   FROM chat_memory 
--   WHERE session_id = $1 
--   ORDER BY created_at ASC 
--   LIMIT 20;
