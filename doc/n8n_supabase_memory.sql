-- Enable UUID extension (optional but recommended)
create extension if not exists "uuid-ossp";

-- Create the table for chat messages
create table if not exists chat_memory (
  id uuid default uuid_generate_v4() primary key,
  session_id text not null,
  role text not null, -- 'user', 'assistant', or 'system'
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on session_id for faster retrieval of chat history
create index if not exists idx_chat_memory_session_id on chat_memory(session_id);

-- Check valid roles (Optional: enforces data integrity)
alter table chat_memory add constraint check_role check (role in ('user', 'assistant', 'system'));

-- Comment for documentation
comment on table chat_memory is 'Table to store chat history for n8n AI Agent memory';

-- INSTRUCTIONS FOR n8n:
-- 1. Use the "Postgres" node.
-- 2. To SAVE (Insert):
--    Operation: Insert
--    Schema: public
--    Table: chat_memory
--    Columns: session_id, role, content, created_at
--
-- 3. To LOAD (Select) for context window:
--    Operation: Execute Query
--    Query: 
--      SELECT role, content 
--      FROM chat_memory 
--      WHERE session_id = $1 
--      ORDER BY created_at ASC 
--      LIMIT 10;
