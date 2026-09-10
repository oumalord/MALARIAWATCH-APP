import type { County, WarningAlert, Indicator, FieldSubmission, AlertStatus, VerificationStatus } from '../types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`Request to ${path} failed with ${res.status}`);
  return res.json() as Promise<T>;
}

export const getCounties = () => request<County[]>('/counties');
export const getAlerts = () => request<WarningAlert[]>('/alerts');
export const updateAlertStatus = (id: string, status: AlertStatus) =>
  request<{ ok: true }>(`/alerts/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const createAlert = (alert: { id: string; countyId: string; level: string; confidence?: string; indicators?: string[]; expectedPeriod?: string; recommendedActions?: string[]; assignedTeam?: string; dataSources?: string[] }) =>
  request<{ ok: true }>('/alerts', { method: 'POST', body: JSON.stringify(alert) });

export const getIndicators = () => request<Indicator[]>('/indicators');

export const getFieldSubmissions = () => request<FieldSubmission[]>('/field-submissions');
export const createFieldSubmission = (submission: { id: string; formType: string; enumeratorName: string; countyId: string; payload?: Record<string, unknown> }) =>
  request<{ ok: true }>('/field-submissions', { method: 'POST', body: JSON.stringify(submission) });
export const updateFieldSubmissionStatus = (id: string, status: VerificationStatus) =>
  request<{ ok: true }>(`/field-submissions/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

export const getSurveillanceTrend = () => request<{ weeklyLabels: string[]; suspected: number[]; positive: number[] }>('/surveillance-trend');
export const getWeatherTrend = () => request<{ dailyLabels: string[]; rainfall: number[]; temperature: number[] }>('/weather-trend');
