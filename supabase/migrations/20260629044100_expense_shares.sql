-- Create expense_shares table for per-expense sharing customization
create table if not exists expense_shares (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  share_type text not null check (share_type in ('excluded', 'fixed')),
  fixed_amount numeric(12, 2) check (fixed_amount is null or fixed_amount > 0),
  created_at timestamptz not null default now(),
  unique (expense_id, member_id)
);

alter table expense_shares enable row level security;

create policy "Allow all access to expense_shares" on expense_shares
  for all using (true);

-- Updated v_balances view with custom expense sharing logic
drop view if exists v_balances cascade;
create view v_balances as
with
  -- All members
  all_members as (
    select id, name, role from members
  ),
  -- Each expense with its custom shares
  expense_details as (
    select
      e.id as expense_id,
      e.amount as total_amount,
      e.paid_by,
      -- Count members who are not excluded from this expense
      (select count(*) from all_members m
        where not exists (
          select 1 from expense_shares es
          where es.expense_id = e.id and es.member_id = m.id and es.share_type = 'excluded'
        )
      )::numeric as sharing_count,
      -- Sum of fixed shares for this expense
      coalesce((
        select sum(es.fixed_amount) from expense_shares es
        where es.expense_id = e.id and es.share_type = 'fixed'
      ), 0) as total_fixed
    from expenses e
  ),
  -- Per-member share for each expense
  per_expense_member_share as (
    select
      ed.expense_id,
      m.id as member_id,
      m.name as member_name,
      m.role as member_role,
      case
        -- Excluded members pay 0
        when es_excluded.id is not null then 0
        -- Fixed share members pay their fixed amount
        when es_fixed.id is not null then es_fixed.fixed_amount
        -- Remaining members split the leftover equally
        else (ed.total_amount - ed.total_fixed) / greatest(ed.sharing_count - (select count(*) from expense_shares es2 where es2.expense_id = ed.expense_id and es2.share_type = 'fixed'), 1)
      end as member_share
    from expense_details ed
    cross join all_members m
    left join expense_shares es_excluded on es_excluded.expense_id = ed.expense_id and es_excluded.member_id = m.id and es_excluded.share_type = 'excluded'
    left join expense_shares es_fixed on es_fixed.expense_id = ed.expense_id and es_fixed.member_id = m.id and es_fixed.share_type = 'fixed'
  ),
  -- Aggregate per-member totals
  member_expense_share as (
    select
      member_id,
      member_name,
      member_role,
      coalesce(sum(member_share), 0) as expense_share
    from per_expense_member_share
    group by member_id, member_name, member_role
  ),
  advances_paid as (
    select
      member_id,
      coalesce(sum(amount), 0) as amount
    from advances
    group by member_id
  ),
  contributions_made as (
    select
      member_id,
      coalesce(sum(amount), 0) as amount
    from contributions
    group by member_id
  ),
  direct_payments as (
    select
      paid_by as member_id,
      coalesce(sum(amount), 0) as amount
    from expenses
    group by paid_by
  )
select
  mes.member_name,
  mes.member_role,
  round(mes.expense_share::numeric, 2) as expense_share,
  round(coalesce(ap.amount, 0)::numeric, 2) as advance_paid,
  round(coalesce(cm.amount, 0)::numeric, 2) as contribution_for_them,
  round(coalesce(dp.amount, 0)::numeric, 2) as direct_paid,
  round(
    (mes.expense_share - coalesce(ap.amount, 0) - coalesce(cm.amount, 0) - coalesce(dp.amount, 0))::numeric,
    2
  ) as balance
from member_expense_share mes
left join advances_paid ap on ap.member_id = mes.member_id
left join contributions_made cm on cm.member_id = mes.member_id
left join direct_payments dp on dp.member_id = mes.member_id
order by mes.member_name;
