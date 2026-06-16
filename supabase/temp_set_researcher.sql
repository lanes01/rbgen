-- Temporarily disable the role-change guard, promote the test account, re-enable the guard.
alter table public.profiles disable trigger profiles_prevent_role_change;

update public.profiles
set role = 'researcher'
where email = 'PASTE_TEST_EMAIL_HERE';

alter table public.profiles enable trigger profiles_prevent_role_change;
