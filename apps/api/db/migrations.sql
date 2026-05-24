-- Run this in Supabase SQL editor to initialise the schema.

create extension if not exists "uuid-ossp";

create table if not exists documents (
    id            text primary key,
    title         text not null,
    classification text not null default 'public',
    source_tier   text not null default 'open',
    language      text not null default 'en',
    tags          text[] default '{}',
    storage_key   text not null,
    storage_url   text not null,
    status        text not null default 'queued',
    chunk_count   integer default 0,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create table if not exists chunks (
    id            text primary key,
    document_id   text not null references documents(id) on delete cascade,
    chunk_index   integer not null,
    text          text not null,
    metadata      jsonb default '{}',
    created_at    timestamptz not null default now()
);

create table if not exists audit_log (
    id                  uuid primary key default uuid_generate_v4(),
    user_id             text not null,
    clearance           text not null,
    question            text not null,
    retrieved_chunk_ids text[] default '{}',
    model_used          text not null,
    response_summary    text,
    latency_ms          integer,
    created_at          timestamptz not null default now()
);

-- Indexes for common query patterns
create index if not exists idx_chunks_document_id on chunks(document_id);
create index if not exists idx_audit_log_user_id on audit_log(user_id);
create index if not exists idx_audit_log_created_at on audit_log(created_at desc);
create index if not exists idx_documents_status on documents(status);
