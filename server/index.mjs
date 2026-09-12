import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and set the Neon connection string.');
}

const pool = new Pool({ connectionString });
const app = express();
const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.json());

function toCounty(row) {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    lat: Number(row.latitude),
    lon: Number(row.longitude),
    risk: row.risk,
    rainfall7d: Number(row.rainfall_7d),
    tempAvg: Number(row.temperature_avg),
    humidity: Number(row.humidity),
    standingWater: Number(row.standing_water),
    suspected: row.suspected,
    tested: row.tested,
    positive: row.positive,
    activeAlerts: row.active_alerts,
    pendingVerification: row.pending_verification,
    lastUpdated: row.last_updated,
  };
}

function toAlert(row) {
  return {
    id: row.id,
    countyId: row.county_id,
    ward: row.ward_name ?? 'County-wide',
    level: row.level,
    createdAt: row.created_at,
    status: row.status,
    confidence: row.confidence,
    indicators: row.indicators,
    expectedPeriod: row.expected_period,
    recommendedActions: row.recommended_actions,
    assignedTeam: row.assigned_team,
    dataSources: row.data_sources,
  };
}

function toIndicator(row) {
  return {
    code: row.code,
    name: row.name,
    baseline: Number(row.baseline),
    endline: Number(row.endline),
    target: Number(row.target),
    unit: row.unit,
    goodDirection: row.good_direction,
  };
}

function toSubmission(row) {
  return {
    id: row.id,
    type: row.form_type,
    enumerator: row.enumerator_name,
    county: row.county_name ?? row.county_id,
    ward: row.ward_name ?? '',
    status: row.status,
    timestamp: row.submitted_at,
    payload: row.payload,
  };
}

app.get('/api/counties', async (_req, res) => {
  const result = await pool.query('select * from counties order by name');
  res.json(result.rows.map(toCounty));
});

app.get('/api/alerts', async (_req, res) => {
  const result = await pool.query(`
    select a.*, w.name as ward_name
    from warning_alerts a
    left join wards w on w.id = a.ward_id
    order by a.created_at desc
    limit 100
  `);
  res.json(result.rows.map(toAlert));
});

app.post('/api/alerts', async (req, res) => {
  const { id, countyId, level, confidence, indicators, expectedPeriod, recommendedActions, assignedTeam, dataSources } = req.body;
  if (!id || !countyId || !level) return res.status(400).json({ error: 'id, countyId and level are required' });
  await pool.query(
    `insert into warning_alerts (id, county_id, level, status, confidence, indicators, expected_period, recommended_actions, assigned_team, data_sources)
     values ($1, $2, $3, 'created', $4, $5, $6, $7, $8, $9)
     on conflict (id) do nothing`,
    [id, countyId, level, confidence ?? 'Moderate', JSON.stringify(indicators ?? []), expectedPeriod ?? 'Monitoring', JSON.stringify(recommendedActions ?? []), assignedTeam ?? 'County Response Team', JSON.stringify(dataSources ?? ['Live weather feed'])],
  );
  res.status(201).json({ ok: true });
});

app.patch('/api/alerts/:id', async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  await pool.query('update warning_alerts set status = $1, updated_at = now() where id = $2', [status, req.params.id]);
  res.json({ ok: true });
});

app.get('/api/indicators', async (_req, res) => {
  const result = await pool.query('select * from indicators order by code');
  res.json(result.rows.map(toIndicator));
});

app.get('/api/field-submissions', async (_req, res) => {
  const result = await pool.query(`
    select s.*, c.name as county_name, w.name as ward_name
    from field_submissions s
    left join counties c on c.id = s.county_id
    left join wards w on w.id = s.ward_id
    order by s.submitted_at desc
    limit 200
  `);
  res.json(result.rows.map(toSubmission));
});

app.post('/api/field-submissions', async (req, res) => {
  const { id, formType, enumeratorName, countyId, payload } = req.body;
  if (!id || !formType || !enumeratorName || !countyId) return res.status(400).json({ error: 'id, formType, enumeratorName and countyId are required' });
  await pool.query(
    `insert into field_submissions (id, form_type, enumerator_name, county_id, status, payload)
     values ($1, $2, $3, $4, 'pending', $5)
     on conflict (id) do nothing`,
    [id, formType, enumeratorName, countyId, JSON.stringify(payload ?? {})],
  );
  res.status(201).json({ ok: true });
});

app.patch('/api/field-submissions/:id', async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });
  await pool.query('update field_submissions set status = $1, reviewed_at = now() where id = $2', [status, req.params.id]);
  res.json({ ok: true });
});

app.get('/api/surveillance-trend', async (_req, res) => {
  const result = await pool.query(`
    select period_end, sum(suspected) as suspected, sum(positive) as positive
    from surveillance_reports
    group by period_end
    order by period_end asc
    limit 12
  `);
  res.json({
    weeklyLabels: result.rows.map((r) => new Date(r.period_end).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })),
    suspected: result.rows.map((r) => Number(r.suspected)),
    positive: result.rows.map((r) => Number(r.positive)),
  });
});

app.get('/api/weather-trend', async (_req, res) => {
  const result = await pool.query(`
    select observed_at::date as day, avg(rainfall_mm) as rainfall, avg(temperature_c) as temperature
    from weather_observations
    group by day
    order by day asc
    limit 14
  `);
  res.json({
    dailyLabels: result.rows.map((r) => new Date(r.day).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })),
    rainfall: result.rows.map((r) => Number(r.rainfall)),
    temperature: result.rows.map((r) => Number(r.temperature)),
  });
});

app.use(express.static(path.join(rootDirectory, '../dist')));
app.get(/.*/, (_req, res) => res.sendFile(path.join(rootDirectory, '../dist/index.html')));

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`MalariaWatch API listening on port ${port}`));
