-- Chat messages storage for AI chat with Eugene clone
-- Using correlation_id from lead_results as copy identifier (copy_id)

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  copy_id text not null, -- references lead_results.correlation_id (logical relation)
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  message_correlation_id text null, -- for async n8n tracking
  status text null, -- 'pending'|'ready'|'error'
  created_at timestamptz not null default now()
) TABLESPACE pg_default;

create index if not exists idx_chat_messages_copy_id_created_at on public.chat_messages (copy_id, created_at desc);
create index if not exists idx_chat_messages_message_corr on public.chat_messages (message_correlation_id);


