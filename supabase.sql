-- Cole tudo no Supabase > SQL Editor > Run
create table site_content(key text primary key, value text not null, updated_at timestamptz default now());
create table treatments(id bigint generated always as identity primary key, pos int not null default 0, title text not null, descr text not null default '');
create table clicks(id bigint generated always as identity primary key, source text not null, created_at timestamptz default now());
alter table site_content enable row level security;
alter table treatments enable row level security;
alter table clicks enable row level security;
create policy "todos leem" on site_content for select using (true);
create policy "admin edita" on site_content for all to authenticated using (true) with check (true);
create policy "todos leem" on treatments for select using (true);
create policy "admin edita" on treatments for all to authenticated using (true) with check (true);
create policy "visitante registra clique" on clicks for insert to anon, authenticated with check (true);
create policy "admin le cliques" on clicks for select to authenticated using (true);
insert into storage.buckets(id,name,public) values('media','media',true) on conflict do nothing;
create policy "midia publica" on storage.objects for select using (bucket_id='media');
create policy "admin envia midia" on storage.objects for insert to authenticated with check (bucket_id='media');
create policy "admin troca midia" on storage.objects for update to authenticated using (bucket_id='media');
create policy "admin apaga midia" on storage.objects for delete to authenticated using (bucket_id='media');
