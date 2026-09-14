import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required.');
}

const client = new Client({ connectionString });

try {
  await client.connect();
  await client.query('begin');
  await client.query('delete from weather_observations');
  await client.query('delete from surveillance_reports');
  await client.query('delete from field_submissions');
  await client.query('delete from warning_alerts');
  await client.query('delete from climate_notifications');
  await client.query('delete from indicators');
  await client.query('delete from wards');
  await client.query(`
    update counties
    set risk = 'low', rainfall_7d = 0, temperature_avg = 0, humidity = 0,
        standing_water = 0, suspected = 0, tested = 0, positive = 0,
        active_alerts = 0, pending_verification = 0, last_updated = current_date
  `);
  await client.query('commit');
  console.log('Removed operational demo data. Staff accounts and county reference data were retained.');
} catch (error) {
  await client.query('rollback').catch(() => undefined);
  throw error;
} finally {
  await client.end().catch(() => undefined);
}
