// Open-Meteo is free, keyless, and CORS-enabled, so it can be called directly from the browser.
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherReading {
  rainfall7d: number;
  tempAvg: number;
  humidity: number;
}

export async function fetchLiveWeather(points: { id: string; lat: number; lon: number }[]): Promise<Record<string, WeatherReading> | null> {
  if (points.length === 0) return null;
  try {
    const params = new URLSearchParams({
      latitude: points.map((p) => p.lat).join(','),
      longitude: points.map((p) => p.lon).join(','),
      current: 'temperature_2m,relative_humidity_2m',
      daily: 'precipitation_sum',
      past_days: '7',
      forecast_days: '1',
      timezone: 'auto',
    });
    const res = await fetch(`${WEATHER_API_URL}?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    const entries = Array.isArray(data) ? data : [data];

    const result: Record<string, WeatherReading> = {};
    points.forEach((point, i) => {
      const entry = entries[i];
      if (!entry) return;
      const rainfall7d = (entry.daily?.precipitation_sum ?? []).reduce((sum: number, v: number) => sum + (v || 0), 0);
      result[point.id] = {
        rainfall7d: Math.round(rainfall7d),
        tempAvg: Number((entry.current?.temperature_2m ?? 0).toFixed(1)),
        humidity: Math.round(entry.current?.relative_humidity_2m ?? 0),
      };
    });
    return result;
  } catch {
    return null;
  }
}
