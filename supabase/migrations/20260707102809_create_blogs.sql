-- 1. Blog status enum
create type public.blog_status as enum ('draft', 'published');

-- 2. Blogs table
create table public.blogs (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text,
  body         jsonb,
  image        text,
  author_id    uuid not null references public.profiles (id) on delete cascade,
  status       public.blog_status not null default 'draft',
  read_time    integer,
  slug         text not null unique,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.blogs is 'Blog posts authored by platform users';
comment on column public.blogs.body is 'TipTap JSON content';
comment on column public.blogs.read_time is 'Estimated read time in minutes (word count / 200)';
comment on column public.blogs.slug is 'URL-safe unique identifier generated from the title';

-- 3. updated_at trigger (reuses the function from the profiles migration)
create trigger blogs_set_updated_at
  before update on public.blogs
  for each row execute function public.set_updated_at();

-- 4. Row Level Security
alter table public.blogs enable row level security;

create policy "Authors can view their own blogs"
  on public.blogs for select
  using ((select auth.uid()) = author_id);

create policy "Authors can insert their own blogs"
  on public.blogs for insert
  with check ((select auth.uid()) = author_id);

create policy "Authors can update their own blogs"
  on public.blogs for update
  using ((select auth.uid()) = author_id);

create policy "Authors can delete their own blogs"
  on public.blogs for delete
  using ((select auth.uid()) = author_id);

-- 5. Grants
grant select, insert, update, delete on public.blogs to authenticated;

-- 6. Storage bucket for blog cover images
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Public read access (bucket is already public, but explicit policy for clarity)
create policy "Blog images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'blog-images');

-- Authenticated users can upload to their own folder
create policy "Authenticated users can upload blog images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Owners can update their own images
create policy "Owners can update their blog images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

-- Owners can delete their own images
create policy "Owners can delete their blog images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
