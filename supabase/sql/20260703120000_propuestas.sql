create table if not exists public.proposals (
  slug text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.proposal_intents (
  id uuid primary key default gen_random_uuid(),
  proposal_slug text not null,
  action text not null,
  contacto text,
  created_at timestamptz not null default now()
);

create index if not exists proposal_intents_proposal_slug_idx
  on public.proposal_intents (proposal_slug);

alter table public.proposals enable row level security;

alter table public.proposal_intents enable row level security;
