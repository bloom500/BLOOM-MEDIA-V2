-- Rulează în Supabase → SQL Editor (proiectul wiwmvgbgvcxewxmxncaz).
-- Creează tabela leads folosită de /api/audit și /api/leads + worker-ul FERAL.
-- Status flow: received → audit_queued → audit_done / audit_failed / no_target

create table if not exists public.leads (
  id                bigint generated always as identity primary key,
  created_at        timestamptz not null default now(),
  source            text not null,                    -- 'audit' | 'configurator'
  lead_id           uuid,                             -- UUID generat de site; worker face PATCH pe el
  status            text not null default 'received',
  name              text not null,
  email             text not null,
  phone             text not null,
  website           text,
  social            text,
  message           text,
  selected_services text[],
  monthly_total     numeric,
  one_time_total    numeric
);

create index if not exists leads_lead_id_idx on public.leads (lead_id);
create index if not exists leads_status_idx  on public.leads (status);

-- RLS pornit, fără politici publice: doar cheia secret (service role) are
-- acces — exact ce folosesc site-ul și worker-ul. Anon nu vede nimic.
alter table public.leads enable row level security;
