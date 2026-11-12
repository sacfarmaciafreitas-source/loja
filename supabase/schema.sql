-- =========================================================
-- LOJA TEMPLATE  |  Rode este arquivo inteiro no SQL Editor do Supabase
-- =========================================================

create extension if not exists pgcrypto;

-- ---------- Categorias ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  blurb text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Produtos ----------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  brand text,
  gtin text,
  sku text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  stock int not null default 0,
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active);

-- ---------- Pedidos ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text unique not null default upper(substr(md5(random()::text), 1, 8)),
  status text not null default 'pending'
    check (status in ('pending','paid','shipped','delivered','canceled')),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_document text not null,
  address jsonb not null default '{}'::jsonb,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment_provider text not null,
  payment_id text,
  pix_code text,
  tracking_code text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists orders_email_idx on public.orders(lower(customer_email));
create index if not exists orders_payment_idx on public.orders(payment_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  unit_price numeric(10,2) not null,
  qty int not null check (qty > 0)
);

-- ---------- Administradores ----------
create table if not exists public.store_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.store_admins where user_id = auth.uid());
$$;

-- ---------- updated_at ----------
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- Segurança (RLS) ----------
alter table public.categories   enable row level security;
alter table public.products     enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
alter table public.store_admins enable row level security;

-- Catálogo: qualquer um lê; só admin escreve
drop policy if exists "cat read" on public.categories;
create policy "cat read" on public.categories for select using (true);
drop policy if exists "cat admin" on public.categories;
create policy "cat admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "prod read" on public.products;
create policy "prod read" on public.products for select using (active or public.is_admin());
drop policy if exists "prod admin" on public.products;
create policy "prod admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- Pedidos: só admin lê/edita pelo navegador. A loja grava pelo servidor (service role).
drop policy if exists "orders admin" on public.orders;
create policy "orders admin" on public.orders for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "items admin" on public.order_items;
create policy "items admin" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins self" on public.store_admins;
create policy "admins self" on public.store_admins for select using (user_id = auth.uid());

-- ---------- Storage para fotos de produto ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "img read" on storage.objects;
create policy "img read" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "img admin write" on storage.objects;
create policy "img admin write" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "img admin update" on storage.objects;
create policy "img admin update" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "img admin delete" on storage.objects;
create policy "img admin delete" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

-- ---------- Configurações da loja (tudo que o painel edita) ----------
alter table public.categories add column if not exists image_url text;

create table if not exists public.store_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.store_settings (id) values (1) on conflict (id) do nothing;

-- Chaves do gateway: sem nenhuma policy, só o servidor (service role) lê
create table if not exists public.store_secrets (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb
);
insert into public.store_secrets (id) values (1) on conflict (id) do nothing;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;
alter table public.store_secrets enable row level security;
alter table public.newsletter_subscribers enable row level security;

drop policy if exists "settings read" on public.store_settings;
create policy "settings read" on public.store_settings for select using (true);
drop policy if exists "settings admin" on public.store_settings;
create policy "settings admin" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "news admin" on public.newsletter_subscribers;
create policy "news admin" on public.newsletter_subscribers for select using (public.is_admin());

-- ---------- Subcategorias, galeria de fotos e origem do produto ----------
alter table public.categories add column if not exists parent_id uuid references public.categories(id) on delete set null;
alter table public.products add column if not exists images jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists source_url text;
create index if not exists categories_parent_idx on public.categories(parent_id);

-- ---------- Reajuste de preços em % (só admin) ----------
-- pct: 10 = +10%, -5 = -5%. Arredonda para terminar em ,90 se round90 = true.
create or replace function public.adjust_prices(pct numeric, cat uuid default null, round90 boolean default false, include_compare boolean default true)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.is_admin() then raise exception 'sem permissão'; end if;
  if pct <= -100 then raise exception 'percentual inválido'; end if;
  with recursive tree as (
    select id from public.categories where id = cat
    union all
    select c.id from public.categories c join tree t on c.parent_id = t.id
  )
  update public.products p set
    price = greatest(0.01, case when round90
      then floor(p.price * (1 + pct / 100)) + 0.90
      else round(p.price * (1 + pct / 100), 2) end),
    compare_at_price = case
      when include_compare and p.compare_at_price is not null
      then round(p.compare_at_price * (1 + pct / 100), 2)
      else p.compare_at_price end
  where cat is null or p.category_id in (select id from tree);
  get diagnostics n = row_count;
  return n;
end; $$;

-- ---------- Categorias iniciais ----------
insert into public.categories (slug, name, blurb, position) values
  ('dermocosmeticos','Dermocosméticos','Cuidado avançado para a pele',0),
  ('higiene','Higiene e Cuidados','O essencial do dia a dia',1),
  ('suplementos','Suplementos e Vitaminas','Energia e bem-estar',2),
  ('mamae-e-bebe','Mamãe e Bebê','Carinho desde o primeiro dia',3),
  ('perfumaria','Perfumaria','Fragrâncias para todo momento',4),
  ('saude-em-casa','Saúde em Casa','Aparelhos e medidores',5)
on conflict (slug) do nothing;

-- =========================================================
-- DEPOIS DE CRIAR SEU USUÁRIO (Authentication > Users > Add user),
-- rode a linha abaixo trocando o e-mail para virar admin:
--
-- insert into public.store_admins (user_id)
--   select id from auth.users where email = 'SEU@EMAIL.COM';
-- =========================================================
