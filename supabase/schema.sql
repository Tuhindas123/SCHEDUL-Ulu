-- Schedul-Ulu ERP: Institutional Schema
-- Version: 1.1.0
-- Description: Role-based ERP for TUMBA, Tezpur University

create extension if not exists "pgcrypto";

-- ============ 1. PROFILES & ROLES ============
-- Profiles table stores the actual user data after they log in.
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  role text check (role in ('student', 'teacher', 'admin')) not null,
  email text unique not null,
  avatar_url text,
  department text default 'TUMBA',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_profiles_role on profiles(role);

-- Role Directory for pre-registration. 
-- Admin adds emails here BEFORE users sign up.
create table if not exists role_directory (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text check (role in ('student', 'teacher', 'admin')) not null,
  full_name text,
  created_at timestamptz default now()
);

-- ============ 2. ACADEMIC STRUCTURE ============
create table if not exists sections (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- e.g., "BBA Semester 3 - Section A"
  department text default 'TUMBA',
  teacher_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references sections(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  enrolled_at timestamptz default now(),
  unique(section_id, user_id)
);

-- ============ 3. ATTENDANCE & NOTIFICATIONS ============
create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade, -- The student
  section_id uuid references sections(id) on delete cascade,
  date date not null default current_date,
  status text check (status in ('present', 'absent', 'late', 'excused')) not null,
  marked_by uuid references profiles(id), -- The teacher
  session_title text, -- e.g., "Marketing Management - Lecture 4"
  created_at timestamptz default now()
);

create index if not exists idx_attendance_section_date on attendance_records(section_id, date);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============ 4. ROW LEVEL SECURITY (RLS) ============

alter table profiles enable row level security;
alter table role_directory enable row level security;
alter table sections enable row level security;
alter table enrollments enable row level security;
alter table attendance_records enable row level security;
alter table notifications enable row level security;

-- Profiles: Everyone can read profiles, but only Admins can edit them.
create policy "Profiles are viewable by authenticated users" on profiles for select to authenticated using (true);
create policy "Admins manage profiles" on profiles for all to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Role Directory: Only Admins can see or edit.
create policy "Admins manage role directory" on role_directory for all to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Sections: Everyone can view, only Admins manage.
create policy "Sections are viewable by all" on sections for select to authenticated using (true);
create policy "Admins manage sections" on sections for all to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Enrollments: Students view their own, Teachers view their sections, Admins manage.
create policy "View own enrollments" on enrollments for select to authenticated using (user_id = auth.uid());
create policy "Teachers view section enrollments" on enrollments for select to authenticated using (
  exists (select 1 from sections where id = enrollments.section_id and teacher_id = auth.uid())
);
create policy "Admins manage enrollments" on enrollments for all to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Attendance: Students view own, Teachers mark their sections, Admins manage all.
create policy "Students view own attendance" on attendance_records for select to authenticated using (user_id = auth.uid());
create policy "Teachers manage attendance for their sections" on attendance_records for all to authenticated using (
  exists (select 1 from sections where id = attendance_records.section_id and teacher_id = auth.uid())
);
create policy "Admins manage all attendance" on attendance_records for all to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Notifications: Only the recipient can see/read their notifications.
create policy "Users view own notifications" on notifications for select to authenticated using (user_id = auth.uid());
create policy "Users mark notifications as read" on notifications for update to authenticated using (user_id = auth.uid());
create policy "Admins/Teachers can create notifications" on notifications for insert to authenticated using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'teacher'))
);

-- ============ 5. AUTOMATION (TRIGGERS) ============

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  dir_role text;
  dir_name text;
begin
  -- 1. Check if the email exists in the role_directory
  select role, full_name into dir_role, dir_name 
  from public.role_directory 
  where email = new.email;

  -- 2. If found, use the pre-assigned role. Otherwise, default to 'student'.
  insert into public.profiles (id, full_name, role, email, avatar_url)
  values (
    new.id, 
    coalesce(dir_name, new.raw_user_meta_data->>'full_name'), 
    coalesce(dir_role, 'student'), 
    new.email, 
    new.raw_user_meta_data->>'avatar_url'
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to automatically create notification when attendance is marked
create or replace function public.notify_attendance_marked()
returns trigger as $$
begin
  insert into public.notifications (user_id, title, body)
  values (
    new.user_id, 
    'Attendance Marked', 
    'Your attendance for ' || coalesce(new.session_title, 'the session') || ' on ' || new.date || ' has been marked as ' || new.status
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_attendance_marked
  after insert on attendance_records
  for each row execute procedure public.notify_attendance_marked();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
    before update on profiles
    for each row execute procedure update_updated_at_column();

-- ============ 6. REPORTING & VIEWS ============

-- View for Attendance Summary by Section
create or replace view attendance_summary_by_section as
select 
    s.name as section_name,
    a.date,
    count(*) filter (where a.status = 'present') as present_count,
    count(*) filter (where a.status = 'absent') as absent_count,
    count(*) filter (where a.status = 'late') as late_count,
    count(*) filter (where a.status = 'excused') as excused_count,
    count(*) as total_students
from attendance_records a
join sections s on a.section_id = s.id
group by s.name, a.date;
