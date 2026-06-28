-- Create base tables for Tour Expense Tracker

-- 1. Members
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table members enable row level security;

create policy "Allow all access to members" on members
  for all using (true);

-- 2. Expense Categories
create table if not exists expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null default 'package',
  created_at timestamptz not null default now()
);

alter table expense_categories enable row level security;

create policy "Allow all access to expense_categories" on expense_categories
  for all using (true);

-- 3. Expenses
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null default current_date,
  category_id uuid not null references expense_categories(id) on delete restrict,
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  paid_by uuid not null references members(id) on delete restrict,
  created_at timestamptz not null default now()
);

alter table expenses enable row level security;

create policy "Allow all access to expenses" on expenses
  for all using (true);

-- 4. Advances
create table if not exists advances (
  id uuid primary key default gen_random_uuid(),
  payment_date date not null default current_date,
  member_id uuid not null references members(id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  method text not null default 'Cash',
  notes text,
  created_at timestamptz not null default now()
);

alter table advances enable row level security;

create policy "Allow all access to advances" on advances
  for all using (true);

-- 5. Contributions
create table if not exists contributions (
  id uuid primary key default gen_random_uuid(),
  contribution_date date not null default current_date,
  member_id uuid not null references members(id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  reason text not null,
  created_at timestamptz not null default now()
);

alter table contributions enable row level security;

create policy "Allow all access to contributions" on contributions
  for all using (true);
