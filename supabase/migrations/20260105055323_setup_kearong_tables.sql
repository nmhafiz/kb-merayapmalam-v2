-- Create a table for public profiles within public schema, but namespaced
create table public.kb_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  handle text unique not null,
  nickname text not null,
  avatar_url text,
  role text check (role in ('member', 'marshal', 'admin')) default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for profiles
alter table public.kb_profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.kb_profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.kb_profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.kb_profiles for update
  using ( auth.uid() = id );

alter table public.kb_profiles
  add constraint handle_format check (handle ~* '^[a-z0-9_]+$');

-- EVENTS TABLE
create table public.kb_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  date date not null,
  time time not null,
  location_name text not null,
  location_map_url text, 
  is_cancelled boolean default false,
  created_by uuid references auth.users, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.kb_events enable row level security;

create policy "Events are viewable by everyone"
  on public.kb_events for select
  using ( true );

create policy "Admins/Marshals can manage events"
  on public.kb_events for all
  using ( 
    exists (
      select 1 from public.kb_profiles
      where kb_profiles.id = auth.uid()
      and kb_profiles.role in ('admin', 'marshal')
    )
  );

-- EVENT RSVPS TABLE
create table public.kb_event_rsvps (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.kb_events on delete cascade not null,
  user_id uuid references public.kb_profiles on delete cascade not null,
  status text check (status in ('going', 'maybe', 'not_going')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

alter table public.kb_event_rsvps enable row level security;

create policy "RSVPs are viewable by everyone"
  on public.kb_event_rsvps for select
  using ( true );

create policy "Users can manage own RSVP"
  on public.kb_event_rsvps for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- FEED: POSTS TABLE
create table public.kb_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.kb_profiles on delete cascade not null,
  content text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FEED: COMMENTS TABLE
create table public.kb_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.kb_posts on delete cascade not null,
  user_id uuid references public.kb_profiles on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FEED: LIKES TABLE
create table public.kb_likes (
  post_id uuid references public.kb_posts on delete cascade not null,
  user_id uuid references public.kb_profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

alter table public.kb_posts enable row level security;
alter table public.kb_comments enable row level security;
alter table public.kb_likes enable row level security;

-- Policies for Posts
create policy "Posts are viewable by everyone" on public.kb_posts for select using ( true );
create policy "Users can insert their own posts" on public.kb_posts for insert with check ( auth.uid() = user_id );
create policy "Users can update their own posts" on public.kb_posts for update using ( auth.uid() = user_id );
create policy "Users can delete their own posts" on public.kb_posts for delete using ( auth.uid() = user_id );

-- Policies for Comments
create policy "Comments are viewable by everyone" on public.kb_comments for select using ( true );
create policy "Users can insert their own comments" on public.kb_comments for insert with check ( auth.uid() = user_id );
create policy "Users can delete their own comments" on public.kb_comments for delete using ( auth.uid() = user_id );

-- Policies for Likes
create policy "Likes are viewable by everyone" on public.kb_likes for select using ( true );
create policy "Users can insert their own likes" on public.kb_likes for insert with check ( auth.uid() = user_id );
create policy "Users can delete their own likes" on public.kb_likes for delete using ( auth.uid() = user_id );

-- Mock Data
insert into public.kb_events (title, description, date, time, location_name, location_map_url)
values 
  ('Merayap Malam: Dataran Loop', 'Santai loop sekitar bandar. Pace 7-8.', '2026-01-12', '21:00', 'Dataran KB Checkpoint', 'https://maps.google.com'),
  ('LSD Weekend: Jambatan Sultan Yahya', 'Long run 15km. Bring hydration.', '2026-01-14', '20:30', 'Taman Perbandaran', 'https://maps.google.com');
