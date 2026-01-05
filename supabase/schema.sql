-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  handle text unique not null,
  nickname text not null,
  avatar_url text,
  role text check (role in ('member', 'marshal', 'admin')) default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Policy: Anyone can view profiles
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

-- Policy: Users can insert their own profile
create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Policy: Users can update their own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Optional: Create a function to handle new user signups (if not using anon auth exclusively)
-- For now, we rely on the manual profile creation flow.

-- Add a constraint to ensure handle format (e.g., lowercase alphanumeric)
alter table profiles
  add constraint handle_format check (handle ~* '^[a-z0-9_]+$');

-- EVENTS TABLE
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  date date not null,
  time time not null,
  location_name text not null,
  location_map_url text, /* e.g. Google Maps Link */
  is_cancelled boolean default false,
  created_by uuid references auth.users, /* Optional: track who created it */
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for events
alter table events enable row level security;

-- Policy: Everyone can view events
create policy "Events are viewable by everyone"
  on events for select
  using ( true );

-- Policy: Only admins can manage events (Placeholder: currently anyone authenticated or just admins)
-- For simplicity in this demo, we'll allow Authenticated Users with role 'admin' or 'marshal' to insert/update.
-- But since we haven't implemented role checks in SQL perfectly yet, we might temporarily allow inserts for testing
-- OR just rely on manual inserts via SQL Editor for now.
create policy "Admins/Marshals can manage events"
  on events for all
  using ( 
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'marshal')
    )
  );

-- EVENT RSVPS TABLE
create table event_rsvps (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  status text check (status in ('going', 'maybe', 'not_going')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id) -- One RSVP per user per event
);

-- Enable RLS for RSVPs
alter table event_rsvps enable row level security;

-- Policy: Everyone can view RSVPs (to see who is going)
create policy "RSVPs are viewable by everyone"
  on event_rsvps for select
  using ( true );

-- Policy: Users can manage their own RSVP
create policy "Users can manage own RSVP"
  on event_rsvps for all
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );


-- MOCK DATA (Optional: Run this to seed data)
-- Note: User IDs in 'created_by' won't match real users, so we leave it null for mocks.
insert into events (title, description, date, time, location_name, location_map_url)
values 
  ('Merayap Malam: Dataran Loop', 'Santai loop sekitar bandar. Pace 7-8.', '2026-01-12', '21:00', 'Dataran KB Checkpoint', 'https://maps.google.com'),
  ('LSD Weekend: Jambatan Sultan Yahya', 'Long run 15km. Bring hydration.', '2026-01-14', '20:30', 'Taman Perbandaran', 'https://maps.google.com');

-- FEED: POSTS TABLE
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles on delete cascade not null,
  content text not null,
  image_url text, -- Optional image
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FEED: COMMENTS TABLE
create table comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FEED: LIKES TABLE (Simple toggle)
create table likes (
  post_id uuid references posts on delete cascade not null,
  user_id uuid references profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

-- Enable RLS
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;

-- Policies for Posts
create policy "Posts are viewable by everyone" on posts for select using ( true );
create policy "Users can insert their own posts" on posts for insert with check ( auth.uid() = user_id );
create policy "Users can update their own posts" on posts for update using ( auth.uid() = user_id );
create policy "Users can delete their own posts" on posts for delete using ( auth.uid() = user_id );

-- Policies for Comments
create policy "Comments are viewable by everyone" on comments for select using ( true );
create policy "Users can insert their own comments" on comments for insert with check ( auth.uid() = user_id );
create policy "Users can delete their own comments" on comments for delete using ( auth.uid() = user_id );

-- Policies for Likes
create policy "Likes are viewable by everyone" on likes for select using ( true );
create policy "Users can insert their own likes" on likes for insert with check ( auth.uid() = user_id );
create policy "Users can delete their own likes" on likes for delete using ( auth.uid() = user_id );

-- MOCK FEED DATA
-- We can't insert easily without knowing valid user_ids, so we'll skip mock data for now 
-- or rely on the UI to create the first post.
