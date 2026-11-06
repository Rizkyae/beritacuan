create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text not null,
  category text not null check (category in ('pilihan', 'politik', 'crypto', 'meme', 'meme_politik')),
  thumbnail_url text,
  created_at timestamptz not null default now(),
  views bigint not null default 0 check (views >= 0)
);

create table if not exists public.digital_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(12,2) not null default 0 check (price >= 0),
  file_url text,
  thumbnail_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  order_num integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_category_created_at_idx on public.posts (category, created_at desc);
create index if not exists faqs_order_num_idx on public.faqs (order_num);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.digital_products enable row level security;
alter table public.faqs enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles" on public.profiles
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Posts are public" on public.posts;
create policy "Posts are public" on public.posts for select to anon, authenticated using (true);
drop policy if exists "Admins manage posts" on public.posts;
create policy "Admins manage posts" on public.posts for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Products are public" on public.digital_products;
create policy "Products are public" on public.digital_products for select to anon, authenticated using (true);
drop policy if exists "Admins manage products" on public.digital_products;
create policy "Admins manage products" on public.digital_products for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "FAQs are public" on public.faqs;
create policy "FAQs are public" on public.faqs for select to anon, authenticated using (true);
drop policy if exists "Admins manage FAQs" on public.faqs;
create policy "Admins manage FAQs" on public.faqs for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

grant usage on schema public to anon, authenticated;
grant select on public.posts, public.digital_products, public.faqs to anon, authenticated;
grant insert, update, delete on public.posts, public.digital_products, public.faqs to authenticated;
grant select, update on public.profiles to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.increment_post_views(post_slug text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.posts set views = views + 1 where slug = post_slug;
$$;
grant execute on function public.increment_post_views(text) to anon, authenticated;

create or replace function public.admin_analytics()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'total_posts', (select count(*) from public.posts),
    'total_products', (select count(*) from public.digital_products),
    'total_views', coalesce((select sum(views) from public.posts), 0)
  );
$$;
revoke all on function public.admin_analytics() from public, anon;
grant execute on function public.admin_analytics() to authenticated;

insert into public.faqs (question, answer, order_num)
select seed.question, seed.answer, seed.order_num
from (values
  ('Apa itu Berita Cuan?', 'BERITA CUAN adalah portal yang menyajikan berita pilihan seputar pasar, politik, dan kultur digital secara ringkas dan kontekstual.', 1),
  ('Bagaimana cara membeli produk digital?', 'Pilih produk yang diinginkan lalu tekan tombol Beli Sekarang untuk menghubungi tim kami melalui kanal pembelian yang tersedia.', 2),
  ('Apakah berita di sini independen?', 'Kami berupaya menyajikan informasi secara berimbang dan transparan. Konten kami bukan saran investasi atau pengganti riset mandiri.', 3),
  ('Bagaimana cara berkontribusi meme/berita?', 'Hubungi redaksi melalui kanal resmi BERITA CUAN dengan menyertakan materi, sumber, dan konteks. Redaksi akan meninjau kontribusi sebelum diterbitkan.', 4)
) as seed(question, answer, order_num)
where not exists (select 1 from public.faqs);
