
create table if not exists class_sessions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references sections(id) on delete cascade,
  day text not null,
  start_time text not null,
  end_time text not null,
  subject text not null,
  room text,
  created_at timestamptz default now()
);

alter table class_sessions enable row level security;

create policy "Sessions are viewable by all" on class_sessions for select to authenticated using (true);
create policy "Admins manage sessions" on class_sessions for all to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
