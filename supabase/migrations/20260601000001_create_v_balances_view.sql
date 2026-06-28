create or replace view v_balances as
with
  total_expense as (
    select coalesce(sum(amount), 0) as total
    from expenses
  ),
  per_person_share as (
    select
      m.id as member_id,
      m.name as member_name,
      te.total / 8.0 as expense_share
    from members m
    cross join total_expense te
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
  pps.member_name,
  round(pps.expense_share::numeric, 2) as expense_share,
  round(coalesce(ap.amount, 0)::numeric, 2) as advance_paid,
  round(coalesce(cm.amount, 0)::numeric, 2) as contribution_for_them,
  round(coalesce(dp.amount, 0)::numeric, 2) as direct_paid,
  round(
    (pps.expense_share - coalesce(ap.amount, 0) - coalesce(cm.amount, 0) - coalesce(dp.amount, 0))::numeric,
    2
  ) as balance
from per_person_share pps
left join advances_paid ap on ap.member_id = pps.member_id
left join contributions_made cm on cm.member_id = pps.member_id
left join direct_payments dp on dp.member_id = pps.member_id
order by pps.member_name;
