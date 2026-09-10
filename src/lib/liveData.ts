import { useSyncExternalStore } from 'react';
import { getCounties, getAlerts, createAlert, getIndicators, getFieldSubmissions, getSurveillanceTrend } from './api';
import { fetchLiveWeather, fetchNationalWeatherTrend } from './weatherApi';
import type { County, WarningAlert, RiskLevel, Indicator, FieldSubmission } from '../types';

export const LIVE_UPDATE_INTERVAL_MS = 60_000;

export interface LiveDataState {
  counties: County[];
  alerts: WarningAlert[];
  indicators: Indicator[];
  fieldSubmissions: FieldSubmission[];
  weatherTrend: { rainfall: number[]; temperature: number[] };
  surveillanceTrend: { suspected: number[]; positive: number[] };
  dailyLabels: string[];
  weeklyLabels: string[];
  lastUpdated: Date;
  weatherSource: 'live' | 'unavailable';
  loading: boolean;
  error: string | null;
}

const SEVERITY_RANK: Record<RiskLevel, number> = { low: 0, watch: 1, alert: 2, critical: 3 };

function classifyRisk(county: County): RiskLevel {
  const positivity = county.tested > 0 ? (county.positive / county.tested) * 100 : 0;
  const score = county.rainfall7d / 12 + county.standingWater / 6 + positivity / 6;
  if (score >= 14) return 'critical';
  if (score >= 9) return 'alert';
  if (score >= 5) return 'watch';
  return 'low';
}

function timestampLabel() {
  const now = new Date();
  return `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}`;
}

// Auto-generated only from real live rainfall crossing the risk threshold — never from random/demo values.
function buildAutoAlert(county: County, prevRisk: RiskLevel, seq: number): WarningAlert {
  return {
    id: `AL-AUTO-${Date.now()}-${seq}`,
    countyId: county.id,
    ward: 'County-wide monitoring',
    level: county.risk,
    createdAt: timestampLabel(),
    status: 'created',
    confidence: county.risk === 'critical' ? 'High' : 'Moderate',
    indicators: [
      `Live rainfall reading reached ${county.rainfall7d}mm over 7 days.`,
      `Risk escalated from ${prevRisk} to ${county.risk} based on real-time weather data.`,
    ],
    expectedPeriod: 'Next 1–2 weeks',
    recommendedActions: [
      'Verify the automated signal with a field visit.',
      'Notify the county malaria focal person.',
      'Increase surveillance and bed-net checks in the affected wards.',
    ],
    assignedTeam: `${county.name} Rapid Response`,
    dataSources: ['Live weather feed (Open-Meteo)'],
  };
}

class LiveDataStore {
  private state: LiveDataState;
  private listeners = new Set<() => void>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private alertSeq = 1;

  constructor() {
    this.state = {
      counties: [],
      alerts: [],
      indicators: [],
      fieldSubmissions: [],
      weatherTrend: { rainfall: [], temperature: [] },
      surveillanceTrend: { suspected: [], positive: [] },
      dailyLabels: [],
      weeklyLabels: [],
      lastUpdated: new Date(),
      weatherSource: 'unavailable',
      loading: true,
      error: null,
    };
    this.startTimer();
  }

  private startTimer() {
    if (typeof window === 'undefined' || this.timer) return;
    void this.tick();
    this.timer = setInterval(() => { void this.tick(); }, LIVE_UPDATE_INTERVAL_MS);
  }

  private async tick() {
    try {
      const [counties, alerts, indicators, fieldSubmissions, surveillanceTrend, weatherTrend] = await Promise.all([
        getCounties(),
        getAlerts(),
        getIndicators(),
        getFieldSubmissions(),
        getSurveillanceTrend(),
        fetchNationalWeatherTrend(),
      ]);

      const realWeather = await fetchLiveWeather(counties.map((c) => ({ id: c.id, lat: c.lat, lon: c.lon })));

      const nextCounties = counties.map((county) => {
        const reading = realWeather?.[county.id];
        const merged: County = reading ? { ...county, rainfall7d: reading.rainfall7d, tempAvg: reading.tempAvg, humidity: reading.humidity } : { ...county };
        merged.risk = classifyRisk(merged);
        merged.activeAlerts = alerts.filter((a) => a.countyId === county.id && a.status !== 'resolved').length;
        merged.pendingVerification = fieldSubmissions.filter((s) => s.county === county.name && (s.status === 'pending' || s.status === 'under_review')).length;
        return merged;
      });

      const newAlerts: WarningAlert[] = [];
      for (const county of nextCounties) {
        const prevRisk = counties.find((c) => c.id === county.id)?.risk ?? 'low';
        const hasActive = alerts.some((a) => a.countyId === county.id && a.status !== 'resolved');
        if (!hasActive && SEVERITY_RANK[county.risk] > SEVERITY_RANK[prevRisk] && (county.risk === 'alert' || county.risk === 'critical')) {
          const alert = buildAutoAlert(county, prevRisk, this.alertSeq++);
          newAlerts.push(alert);
          void createAlert({ id: alert.id, countyId: alert.countyId, level: alert.level, confidence: alert.confidence, indicators: alert.indicators, expectedPeriod: alert.expectedPeriod, recommendedActions: alert.recommendedActions, assignedTeam: alert.assignedTeam, dataSources: alert.dataSources }).catch(() => undefined);
        }
      }

      this.state = {
        counties: nextCounties,
        alerts: [...newAlerts, ...alerts],
        indicators,
        fieldSubmissions,
        weatherTrend: weatherTrend ? { rainfall: weatherTrend.rainfall, temperature: weatherTrend.temperature } : this.state.weatherTrend,
        surveillanceTrend: { suspected: surveillanceTrend.suspected, positive: surveillanceTrend.positive },
        dailyLabels: weatherTrend ? weatherTrend.dailyLabels : this.state.dailyLabels,
        weeklyLabels: surveillanceTrend.weeklyLabels,
        lastUpdated: new Date(),
        weatherSource: weatherTrend || realWeather ? 'live' : 'unavailable',
        loading: false,
        error: null,
      };
    } catch (err) {
      this.state = { ...this.state, loading: false, error: err instanceof Error ? err.message : 'Failed to load live data' };
    }
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.state;
}

export const liveDataStore = new LiveDataStore();

export function useLiveData(): LiveDataState {
  return useSyncExternalStore(liveDataStore.subscribe, liveDataStore.getSnapshot, liveDataStore.getSnapshot);
}
