import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and set the Neon connection string.');
}

// Real Kenya counties (reference data only — no fabricated case/weather figures).
// Operational stats start at zero and are populated by real field submissions and live weather.
const COUNTIES = [
  { id: 'nairobi', name: 'Nairobi', region: 'Low Risk', lat: -1.286, lon: 36.817 },
  { id: 'mombasa', name: 'Mombasa', region: 'Coastal Endemic', lat: -4.043, lon: 39.658 },
  { id: 'kisumu', name: 'Kisumu', region: 'Lake Endemic', lat: -0.091, lon: 34.768 },
  { id: 'homabay', name: 'Homa Bay', region: 'Lake Endemic', lat: -0.529, lon: 34.457 },
  { id: 'siaya', name: 'Siaya', region: 'Lake Endemic', lat: 0.061, lon: 34.288 },
  { id: 'busia', name: 'Busia', region: 'Lake Endemic', lat: 0.463, lon: 34.242 },
  { id: 'migori', name: 'Migori', region: 'Lake Endemic', lat: -1.063, lon: 34.473 },
  { id: 'kisii', name: 'Kisii', region: 'Highland Fringe Endemic', lat: -0.678, lon: 34.775 },
  { id: 'vihiga', name: 'Vihiga', region: 'Lake Endemic', lat: 0.049, lon: 34.722 },
  { id: 'kakamega', name: 'Kakamega', region: 'Lake Endemic', lat: 0.284, lon: 34.752 },
  { id: 'bungoma', name: 'Bungoma', region: 'Lake Endemic', lat: 0.569, lon: 34.559 },
  { id: 'kilifi', name: 'Kilifi', region: 'Coastal Endemic', lat: -3.630, lon: 39.849 },
  { id: 'kwale', name: 'Kwale', region: 'Coastal Endemic', lat: -4.174, lon: 39.452 },
  { id: 'tanariver', name: 'Tana River', region: 'Coastal Endemic', lat: -1.500, lon: 40.030 },
  { id: 'lamu', name: 'Lamu', region: 'Coastal Endemic', lat: -2.272, lon: 40.902 },
  { id: 'kericho', name: 'Kericho', region: 'Highland Epidemic-Prone', lat: -0.367, lon: 35.283 },
  { id: 'nakuru', name: 'Nakuru', region: 'Highland / Low Risk', lat: -0.303, lon: 36.080 },
  { id: 'turkana', name: 'Turkana', region: 'Semi-Arid Seasonal', lat: 3.118, lon: 35.596 },
  { id: 'marsabit', name: 'Marsabit', region: 'Semi-Arid Seasonal', lat: 2.335, lon: 37.990 },
  { id: 'wajir', name: 'Wajir', region: 'Semi-Arid Seasonal', lat: 1.750, lon: 40.060 },
  { id: 'garissa', name: 'Garissa', region: 'Semi-Arid Seasonal', lat: -0.456, lon: 39.646 },
  { id: 'baringo', name: 'Baringo', region: 'Semi-Arid Seasonal', lat: 0.491, lon: 35.743 },
  { id: 'kiambu', name: 'Kiambu', region: 'Low Risk', lat: -1.171, lon: 36.835 },
  { id: 'kajiado', name: 'Kajiado', region: 'Low Risk', lat: -1.852, lon: 36.777 },
];

const client = new Client({ connectionString });

try {
  await client.connect();
  for (const county of COUNTIES) {
    await client.query(
      `insert into counties (id, name, region, latitude, longitude, risk, rainfall_7d, temperature_avg, humidity, standing_water, suspected, tested, positive, active_alerts, pending_verification, last_updated)
       values ($1, $2, $3, $4, $5, 'low', 0, 0, 0, 0, 0, 0, 0, 0, 0, current_date)
       on conflict (id) do update set name = excluded.name, region = excluded.region, latitude = excluded.latitude, longitude = excluded.longitude`,
      [county.id, county.name, county.region, county.lat, county.lon],
    );
  }
  console.log(`Seeded ${COUNTIES.length} real Kenya counties with zero operational stats.`);
} finally {
  await client.end().catch(() => undefined);
}
