import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and set the Neon connection string.');
}

const client = new Client({ connectionString });

try {
  await client.connect();
  const existingUsers = await client.query("select to_regclass('public.app_users') as table_name");
  if (existingUsers.rows[0].table_name) {
    await client.query("alter type user_role add value if not exists 'super_admin'");
    await client.query("alter type user_role add value if not exists 'admin'");
    await client.query(`
      alter table app_users
        add column if not exists phone text,
        add column if not exists must_change_pin boolean not null default false,
        add column if not exists created_by uuid references app_users(id) on delete set null,
        add column if not exists suspended_at timestamptz,
        add column if not exists updated_at timestamptz not null default now()
    `);
    await client.query('create index if not exists app_users_role_active_idx on app_users (role, active)');
    console.log('Existing Neon schema upgraded for admin and enumerator account lifecycle.');
  } else {
    const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
    await client.query(schema);
    console.log('Neon schema applied successfully.');
  }
} finally {
  await client.end().catch(() => undefined);
}
