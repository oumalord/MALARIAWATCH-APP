import { useSyncExternalStore } from 'react';
import { counties as baseCounties, alerts as baseAlerts, weatherTrend as baseWeatherTrend, surveillanceTrend as baseSurveillanceTrend, dailyLabels as baseDailyLabels, weeklyLabels as baseWeeklyLabels } from '../data/mockData';
import { fetchLiveWeather, type WeatherReading } from './weatherApi';
import type { County, WarningAlert, RiskLevel } from '../types';

export const LIVE_UPDATE_INTERVAL_MS = 60_000;

export interface LiveDataState {
  counties: County[];
  alerts: WarningAlert[];
  weatherTrend: { rainfall: number[]; temperature: number[] };
  surveillanceTrend: { suspected: number[]; positive: number[] };
  dailyLabels: string[];
  weeklyLabels: string[];
  lastUpdated: Date;
  weatherSource: 'live' | 'simulated';
}

const SEVERITY_RANK: Record<RiskLevel, number> = { low: 0, watch: 1, alert: 2, critical: 3 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function jitter(value: number, range: number) {
  return value + (Math.random() * 2 - 1) * range;
}

function timeLabel() {
  return new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}

function timestampLabel() {
  return `${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${timeLabel()}`;
}

function classifyRisk(county: County): RiskLevel {
  const positivity = county.tested > 0 ? (county.positive / county.tested) * 100 : 0;
  const score = county.rainfall7d / 12 + county.standingWater / 6 + positivity / 6;
  if (score >= 14) return 'critical';
  if (score >= 9) return 'alert';
  if (score >= 5) return 'watch';
  return 'low';
}

function evolveCounty(county: County, real?: WeatherReading): County {
  const rainfall7d = real ? real.rainfall7d : Math.round(clamp(jitter(county.rainfall7d, 7), 0, 220));
  const tempAvg = real ? real.tempAvg : Number(clamp(jitter(county.tempAvg, 0.4), 15, 34).toFixed(1));
  const humidity = real ? real.humidity : Math.round(clamp(jitter(county.humidity, 3), 20, 95));
  const standingWater = Math.max(0, Math.round(clamp(jitter(county.standingWater, rainfall7d > county.rainfall7d ? 2.5 : 1.2), 0, 60)));
  const suspected = Math.max(0, Math.round(county.suspected + jitter(2, 8)));
  const tested = Math.max(suspected, Math.round(county.tested + jitter(2, 10)));
  const positive = Math.max(0, Math.min(tested, Math.round(county.positive + jitter(1, 6))));
  const next: County = { ...county, rainfall7d, tempAvg, humidity, standingWater, suspected, tested, positive, lastUpdated: timestampLabel() };
  next.risk = classifyRisk(next);
  next.activeAlerts = county.activeAlerts;
  return next;
}

function buildAlert(county: County, prevRisk: RiskLevel, seq: number): WarningAlert {
  const rainedHarder = county.rainfall7d > 90;
  const positivity = county.tested > 0 ? ((county.positive / county.tested) * 100).toFixed(1) : '0';
  return {
    id: `AL-LIVE-${seq}`,
    countyId: county.id,
    ward: 'County-wide monitoring',
    level: county.risk,
    createdAt: timestampLabel(),
    status: 'created',
    confidence: county.risk === 'critical' ? 'High' : 'Moderate',
    indicators: [
      rainedHarder ? `Rainfall reached ${county.rainfall7d}mm over 7 days, above the watch threshold.` : `Positivity rate reached ${positivity}%, above the county alert threshold.`,
      `Risk escalated from ${prevRisk} to ${county.risk} during automated monitoring.`,
      `Standing water observations at ${county.standingWater} sites.`,
    ],
    expectedPeriod: 'Next 1–2 weeks',
    recommendedActions: [
      'Verify the automated signal with a field visit.',
      'Notify the county malaria focal person.',
      'Increase surveillance and bed-net checks in the affected wards.',
    ],
    assignedTeam: `${county.name} Rapid Response`,
    dataSources: ['Live weather feed', 'Live surveillance feed'],
  };
}

function nationalAverage(counties: County[], key: 'rainfall7d' | 'tempAvg') {
  return counties.reduce((sum, c) => sum + c[key], 0) / counties.length;
}

class LiveDataStore {
  private state: LiveDataState;
  private listeners = new Set<() => void>();
  private alertSeq = 2000;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.state = {
      counties: baseCounties.map((c) => ({ ...c })),
      alerts: baseAlerts.map((a) => ({ ...a })),
      weatherTrend: { rainfall: [...baseWeatherTrend.rainfall], temperature: [...baseWeatherTrend.temperature] },
      surveillanceTrend: { suspected: [...baseSurveillanceTrend.suspected], positive: [...baseSurveillanceTrend.positive] },
      dailyLabels: [...baseDailyLabels],
      weeklyLabels: [...baseWeeklyLabels],
      lastUpdated: new Date(),
      weatherSource: 'simulated',
    };
    this.startTimer();
  }

  private startTimer() {
    if (typeof window === 'undefined' || this.timer) return;
    void this.tick();
    this.timer = setInterval(() => { void this.tick(); }, LIVE_UPDATE_INTERVAL_MS);
  }

  private async tick() {
    const realWeather = await fetchLiveWeather(this.state.counties.map((c) => ({ id: c.id, lat: c.lat, lon: c.lon })));

    const newAlerts: WarningAlert[] = [];
    const nextCounties = this.state.counties.map((county) => {
      const evolved = evolveCounty(county, realWeather?.[county.id]);
      const generated = maybeAlert(county.risk, evolved, this.state.alerts, () => ++this.alertSeq);
      if (generated) newAlerts.push(generated);
      evolved.activeAlerts = county.activeAlerts + (generated ? 1 : 0);
      return evolved;
    });

    const rainAvg = Number(nationalAverage(nextCounties, 'rainfall7d').toFixed(1)) / 6;
    const tempAvg = Number(nationalAverage(nextCounties, 'tempAvg').toFixed(1));
    const totalSuspected = nextCounties.reduce((s, c) => s + c.suspected, 0);
    const totalPositive = nextCounties.reduce((s, c) => s + c.positive, 0);

    const weatherTrend = {
      rainfall: [...this.state.weatherTrend.rainfall.slice(1), Math.round(clamp(rainAvg, 0, 60))],
      temperature: [...this.state.weatherTrend.temperature.slice(1), Number(clamp(tempAvg, 15, 34).toFixed(1))],
    };
    const surveillanceTrend = {
      suspected: [...this.state.surveillanceTrend.suspected.slice(1), Math.round(totalSuspected / 20)],
      positive: [...this.state.surveillanceTrend.positive.slice(1), Math.round(totalPositive / 20)],
    };
    const dailyLabels = [...this.state.dailyLabels.slice(1), 'Now'];
    const weeklyLabels = [...this.state.weeklyLabels.slice(1), 'This wk'];

    this.state = {
      counties: nextCounties,
      alerts: [...newAlerts, ...this.state.alerts].slice(0, 40),
      weatherTrend,
      surveillanceTrend,
      dailyLabels,
      weeklyLabels,
      lastUpdated: new Date(),
      weatherSource: realWeather ? 'live' : 'simulated',
    };
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;
}

function maybeAlert(prevRisk: RiskLevel, county: County, existingAlerts: WarningAlert[], nextSeq: () => number): WarningAlert | null {
  if (SEVERITY_RANK[county.risk] <= SEVERITY_RANK[prevRisk]) return null;
  if (county.risk !== 'alert' && county.risk !== 'critical') return null;
  const hasActive = existingAlerts.some((a) => a.countyId === county.id && a.status !== 'resolved');
  if (hasActive) return null;
  return buildAlert(county, prevRisk, nextSeq());
}

export const liveDataStore = new LiveDataStore();

export function useLiveData(): LiveDataState {
  return useSyncExternalStore(liveDataStore.subscribe, liveDataStore.getSnapshot, liveDataStore.getSnapshot);
}
