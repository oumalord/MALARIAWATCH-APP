import type { County, WarningAlert, Indicator, FieldSubmission, AlertStatus, VerificationStatus } from '../types';
import type { SessionUser, UserRole } from '../App';

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

export type StaffAccount = SessionUser & { email: string; active: boolean };

export const loginStaff = (email: string, pin: string) =>
  request<StaffAccount>('/auth/staff/login', { method: 'POST', body: JSON.stringify({ email, pin }) });
export const getStaffAccounts = () => request<StaffAccount[]>('/staff-accounts');
export const createStaffAccount = (account: { name: string; email: string; role: Extract<UserRole, 'admin' | 'enumerator'>; organisation: string; county?: string; createdBy?: string }) =>
  request<StaffAccount>('/staff-accounts', { method: 'POST', body: JSON.stringify(account) });
export const setStaffAccountStatus = (id: string, active: boolean, actorId?: string, _actorRole?: UserRole) =>
  request<{ ok: true }>(`/staff-accounts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ active, actorId }) });
export const deleteStaffAccount = (id: string, actorId?: string, _actorRole?: UserRole) =>
  request<{ ok: true }>(`/staff-accounts/${id}`, { method: 'DELETE', body: JSON.stringify({ actorId }) });
export const changeStaffPin = (id: string, currentPin: string, newPin: string) =>
  request<{ ok: true }>(`/staff-accounts/${id}/pin`, { method: 'PATCH', body: JSON.stringify({ currentPin, newPin }) });
