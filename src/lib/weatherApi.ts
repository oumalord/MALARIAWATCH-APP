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

export interface WeatherTrend {
  dailyLabels: string[];
  rainfall: number[];
  temperature: number[];
}

// Central-Kenya reference point, used as a national daily rainfall/temperature trend when no county is selected.
const NATIONAL_REFERENCE_POINT = { lat: 0.0236, lon: 37.9062 };

export async function fetchNationalWeatherTrend(days = 14): Promise<WeatherTrend | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(NATIONAL_REFERENCE_POINT.lat),
      longitude: String(NATIONAL_REFERENCE_POINT.lon),
      daily: 'precipitation_sum,temperature_2m_max,temperature_2m_min',
      past_days: String(Math.max(days - 1, 0)),
      forecast_days: '1',
      timezone: 'auto',
    });
    const res = await fetch(`${WEATHER_API_URL}?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    const dates: string[] = data.daily?.time ?? [];
    const precip: number[] = data.daily?.precipitation_sum ?? [];
    const tmax: number[] = data.daily?.temperature_2m_max ?? [];
    const tmin: number[] = data.daily?.temperature_2m_min ?? [];
    if (dates.length === 0) return null;
    return {
      dailyLabels: dates.map((d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })),
      rainfall: precip.map((v) => Math.round(v ?? 0)),
      temperature: dates.map((_, i) => Number((((tmax[i] ?? 0) + (tmin[i] ?? 0)) / 2).toFixed(1))),
    };
  } catch {
    return null;
  }
}

