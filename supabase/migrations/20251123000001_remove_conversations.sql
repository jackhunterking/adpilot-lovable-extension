-- Migration: Remove Conversations Infrastructure
-- Date: 2025-11-23
-- Reason: Project uses Lovable's AI Chat directly, custom conversation system is unused

-- Drop conversation_messages table (drop first due to foreign key to conversations)
DROP TABLE IF EXISTS conversation_messages CASCADE;

-- Drop conversations table
DROP TABLE IF EXISTS conversations CASCADE;

-- Note: RLS policies are automatically dropped with CASCADE
-- Note: Indexes are automatically dropped with CASCADE
-- Note: Foreign keys are automatically dropped with CASCADE

-- Verification query (should return 0 rows)
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('conversations', 'conversation_messages');

