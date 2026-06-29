-- Add role column to members table
alter table members add column if not exists role text not null default 'member';

-- Set Abir as manager by default
update members set role = 'manager' where name = 'Abir';
