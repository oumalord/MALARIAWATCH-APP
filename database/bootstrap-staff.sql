-- Run this file in the Neon SQL Editor after schema.sql.
-- It creates missing bootstrap staff accounts without changing existing PINs.
create extension if not exists pgcrypto;

insert into app_users (name, email, password_hash, role, organisation, must_change_pin)
values
  ('SIR LORDPHICK', 'sirlordphick@gmail.com', crypt('Lord9632@@', gen_salt('bf', 12)), 'super_admin', 'MalariaWatch Platform', false),
  ('Carren Joan', 'carrenjoan2@gmail.com', crypt('1234', gen_salt('bf', 12)), 'admin', 'MalariaWatch Administration', true)
on conflict (email) do nothing;
