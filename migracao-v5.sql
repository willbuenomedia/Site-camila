-- ============================================================
-- v5 · Gestão da clínica (pacientes, lembretes, espera, financeiro,
--      orçamentos, termos, fotos, funil de anúncios, relatórios)
-- Rode UMA vez no SQL Editor do Supabase da Camila. Pode rodar de novo sem problema.
-- Requer: migracao-agendamento.sql já rodada (tabelas appointments, staff, is_staff()).
-- ============================================================

-- 1) Cliques do WhatsApp agora guardam a campanha
alter table clicks add column if not exists campaign text check(char_length(campaign)<=80);
alter table clicks add column if not exists utm_source text check(char_length(utm_source)<=80);
alter table clicks add column if not exists utm_medium text check(char_length(utm_medium)<=80);
alter table clicks add column if not exists cid text check(char_length(cid)<=12);
drop policy if exists "staff le cliques" on clicks;
create policy "staff le cliques" on clicks for select to authenticated using (public.is_staff());

-- 2) Pacientes
create table if not exists patients(
  id uuid primary key default gen_random_uuid(),
  name text not null check(char_length(name) between 2 and 100),
  phone text not null check(phone ~ '^[0-9]{10,13}$'),
  birthday date, email text check(char_length(email)<=120),
  notes text check(char_length(notes)<=2000),
  source text check(char_length(source)<=60), campaign text check(char_length(campaign)<=80),
  created_at timestamptz not null default now());
create unique index if not exists patients_phone_uq on patients(phone);

-- 3) Agendamentos: origem, comparecimento, valor, lembretes
alter table appointments add column if not exists patient_id uuid references patients(id) on delete set null;
alter table appointments add column if not exists campaign text check(char_length(campaign)<=80);
alter table appointments add column if not exists attendance text check(attendance in ('came','missed'));
alter table appointments add column if not exists reminded_at timestamptz;
alter table appointments add column if not exists review_asked_at timestamptz;
-- intervalo de retorno por procedimento (dias)
alter table booking_procedures add column if not exists return_days int check(return_days between 7 and 730);
drop policy if exists "staff ajusta retorno" on booking_procedures;
create policy "staff ajusta retorno" on booking_procedures for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- 4) Lista de espera
create table if not exists waitlist(
  id uuid primary key default gen_random_uuid(),
  name text not null check(char_length(name) between 2 and 100),
  phone text not null check(phone ~ '^[0-9]{10,13}$'),
  procedure_name text check(char_length(procedure_name)<=80),
  note text check(char_length(note)<=300),
  status text not null default 'waiting' check(status in ('waiting','contacted','done')),
  created_at timestamptz not null default now());

-- 5) Contatos/conversas (funil)
create table if not exists leads(
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check(char_length(name) between 2 and 100),
  phone text check(phone ~ '^[0-9]{10,13}$'),
  source text check(char_length(source)<=60), campaign text check(char_length(campaign)<=80),
  ref text check(char_length(ref)<=12),
  stage text not null default 'conversou' check(stage in ('conversou','agendou','compareceu','fechou','perdido')),
  note text check(char_length(note)<=500));
create table if not exists campaign_spend(
  campaign text not null check(char_length(campaign)<=80), month text not null check(month ~ '^[0-9]{4}-[0-9]{2}$'),
  spend_cents int not null check(spend_cents>=0), primary key(campaign,month));

-- 6) Financeiro
create table if not exists payments(
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete set null,
  patient_name text not null check(char_length(patient_name) between 2 and 100),
  description text check(char_length(description)<=200),
  amount_cents int not null check(amount_cents>0),
  method text check(method in ('pix','cartao','dinheiro','outro')),
  status text not null default 'pending' check(status in ('pending','paid')),
  campaign text check(char_length(campaign)<=80),
  due_date date, paid_at timestamptz, created_at timestamptz not null default now());

-- 7) Orçamentos com link e aceite
create table if not exists quotes(
  id uuid primary key default gen_random_uuid(),
  token text not null unique default replace(gen_random_uuid()::text,'-',''),
  patient_name text not null check(char_length(patient_name) between 2 and 100),
  phone text check(phone ~ '^[0-9]{10,13}$'),
  title text not null check(char_length(title) between 2 and 120),
  items jsonb not null default '[]', total_cents int not null check(total_cents>=0),
  note text check(char_length(note)<=600), valid_until date,
  status text not null default 'sent' check(status in ('sent','accepted','refused')),
  answered_at timestamptz, accepted_name text check(char_length(accepted_name)<=100),
  created_at timestamptz not null default now());

-- 8) Termos de consentimento digitais
create table if not exists consent_forms(
  id uuid primary key default gen_random_uuid(),
  token text not null unique default replace(gen_random_uuid()::text,'-',''),
  patient_id uuid references patients(id) on delete set null,
  patient_name text not null check(char_length(patient_name) between 2 and 100),
  phone text check(phone ~ '^[0-9]{10,13}$'),
  title text not null check(char_length(title) between 2 and 120),
  body text not null check(char_length(body)<=8000),
  status text not null default 'pending' check(status in ('pending','signed')),
  signed_name text check(char_length(signed_name)<=100),
  signature text check(char_length(signature)<=200000),
  signed_at timestamptz, created_at timestamptz not null default now());

-- 9) Fotos antes/depois (arquivo privado)
create table if not exists patient_photos(
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  kind text not null check(kind in ('antes','depois')),
  path text not null check(char_length(path)<=300),
  taken_on date not null default current_date,
  allow_marketing boolean not null default false,
  created_at timestamptz not null default now());
insert into storage.buckets(id,name,public) values('prontuario','prontuario',false) on conflict(id) do nothing;
drop policy if exists "staff prontuario" on storage.objects;
create policy "staff prontuario" on storage.objects for all to authenticated
  using (bucket_id='prontuario' and public.is_staff()) with check (bucket_id='prontuario' and public.is_staff());

-- 10) Segurança: só a equipe (staff) lê e grava
do $$ declare t text; begin
  foreach t in array array['patients','waitlist','leads','campaign_spend','payments','quotes','consent_forms','patient_photos'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "staff total" on %I', t);
    execute format('create policy "staff total" on %I for all to authenticated using (public.is_staff()) with check (public.is_staff())', t);
  end loop; end $$;

-- 11) Funções públicas (sem expor tabelas)
-- marca a origem (campanha) de um pedido recém-criado no site
create or replace function tag_appointment(p_id uuid, p_campaign text) returns void
language sql security definer set search_path=public as $$
  update appointments set campaign=left(nullif(trim(p_campaign),''),80)
  where id=p_id and campaign is null and created_at>now()-interval '10 minutes' $$;
grant execute on function tag_appointment(uuid,text) to anon, authenticated;

-- orçamento por link
create or replace function get_quote(p_token text) returns json
language sql security definer stable set search_path=public as $$
  select json_build_object('patient_name',patient_name,'title',title,'items',items,'total_cents',total_cents,'note',note,'valid_until',valid_until,'status',status)
  from quotes where token=p_token $$;
create or replace function answer_quote(p_token text, p_accept boolean, p_name text) returns text
language plpgsql security definer set search_path=public as $$
declare s text; begin
  select status into s from quotes where token=p_token; if s is null then raise exception 'link inválido'; end if;
  if s<>'sent' then return s; end if;
  if p_accept and char_length(trim(coalesce(p_name,''))) not between 2 and 100 then raise exception 'nome inválido'; end if;
  update quotes set status=case when p_accept then 'accepted' else 'refused' end, answered_at=now(), accepted_name=case when p_accept then trim(p_name) end where token=p_token;
  return case when p_accept then 'accepted' else 'refused' end; end $$;
grant execute on function get_quote(text), answer_quote(text,boolean,text) to anon, authenticated;

-- termo por link
create or replace function get_consent(p_token text) returns json
language sql security definer stable set search_path=public as $$
  select json_build_object('patient_name',patient_name,'title',title,'body',body,'status',status,'signed_at',signed_at)
  from consent_forms where token=p_token $$;
create or replace function sign_consent(p_token text, p_name text, p_signature text) returns void
language plpgsql security definer set search_path=public as $$
begin
  if char_length(trim(coalesce(p_name,''))) not between 2 and 100 then raise exception 'nome inválido'; end if;
  if p_signature is null or char_length(p_signature) not between 200 and 200000 or p_signature not like 'data:image/png;base64,%' then raise exception 'assinatura inválida'; end if;
  update consent_forms set status='signed', signed_name=trim(p_name), signature=p_signature, signed_at=now() where token=p_token and status='pending';
  if not found then raise exception 'link inválido ou já assinado'; end if; end $$;
grant execute on function get_consent(text), sign_consent(text,text,text) to anon, authenticated;
