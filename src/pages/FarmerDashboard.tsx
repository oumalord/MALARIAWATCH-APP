import { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, CloudRain, Droplets, LogOut, MapPin, ShieldAlert, Thermometer, Wind } from 'lucide-react';
import { useLiveData } from '../lib/liveData';
import type { SessionUser } from '../App';

type ClimateNotification = {
  id: string;
  kind: 'weather' | 'drought' | 'elnino' | 'flood' | 'health';
  title: string;
  summary: string;
  timing: string;
  severity: 'Advisory' | 'Watch' | 'Warning';
  source: string;
  actions: string[];
};

const CLIMATE_NOTIFICATIONS: ClimateNotification[] = [
  {
    id: 'rain-shift', kind: 'weather', title: 'Rainfall pattern has changed',
    summary: 'Rainfall is trending above the recent seasonal pattern in your area.', timing: 'Next 7 days', severity: 'Watch', source: 'County weather service',
    actions: ['Clear blocked drainage around the home and farm.', 'Avoid leaving containers or tools where they can collect water.', 'Check this dashboard after the next rainfall.'],
  },
  {
    id: 'elnino-watch', kind: 'elnino', title: 'El Niño conditions under monitoring',
    summary: 'Regional climate agencies are monitoring warmer ocean conditions that may bring heavier or irregular rain.', timing: 'Seasonal outlook', severity: 'Advisory', source: 'Regional climate outlook',
    actions: ['Keep seed and farm records in a dry, raised place.', 'Protect soil with cover crops or mulch where possible.', 'Follow county advisories before planting or moving livestock.'],
  },
  {
    id: 'drought-watch', kind: 'drought', title: 'Dry spell risk is being monitored',
    summary: 'The forecast shows a possible gap in rainfall. Water availability may become tighter if the pattern continues.', timing: 'Next 2–4 weeks', severity: 'Advisory', source: 'County weather service',
    actions: ['Repair leaks and store water safely for household use.', 'Prioritise drought-tolerant crops and moisture-saving practices.', 'Do not wait for crops to wilt before asking the extension team for advice.'],
  },
];

const NOTIFICATION_ICONS = { weather: CloudRain, drought: Droplets, elnino: Wind, flood: AlertTriangle, health: ShieldAlert };

export default function FarmerDashboard({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
  const { alerts, counties, weatherTrend } = useLiveData();
  const [showAll, setShowAll] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted');
  const county = counties.find((item) => item.name === user.county) ?? counties.find((item) => item.name === 'Kisumu')!;
  const localAlerts = alerts.filter((item) => item.countyId === county.id && item.status !== 'resolved');
  const visibleAlerts = showAll ? alerts.filter((item) => item.status !== 'resolved') : localAlerts;
  const localNotifications = CLIMATE_NOTIFICATIONS.map((notification) => ({ ...notification, countyId: county.id }));
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);

  async function enableNotifications() {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
  }
  return <main className="min-h-screen bg-[#F6F7F4] pb-8 text-[#14201A]">
    <header className="sticky top-0 z-10 border-b border-[#DDE5DE] bg-white/95 px-4 py-3 backdrop-blur sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between"><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E7C5A] text-sm font-bold text-white">M</div><div><p className="font-display text-[15px] font-bold leading-tight">MalariaWatch</p><p className="flex items-center gap-1 text-[11px] text-[#55665C]"><MapPin size={11} /> {user.county ?? county.name}</p></div></div><button type="button" onClick={onSignOut} className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE2DB] px-3 py-2 text-xs font-bold text-[#55665C] hover:bg-[#F6F7F4]"><LogOut size={14} /> <span className="hidden sm:inline">Log out</span></button></div></header>
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-8 sm:py-8"><div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0A5A41]">Farmer dashboard</p><h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Good morning, {user.name.split(' ')[0]}</h1><p className="mt-1 text-sm text-[#55665C]">Local conditions and early warnings for your farm.</p></div>
      <section className="rounded-2xl bg-[#0D2A20] p-5 text-white shadow-sm sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9BC9AE]">Current county risk</p><p className="mt-2 font-display text-3xl font-bold">{county.risk === 'critical' ? 'Critical' : county.risk === 'alert' ? 'Alert' : county.risk === 'watch' ? 'Watch' : 'Low'}</p><p className="mt-1 text-sm text-[#C5D8CB]">{county.name} · updated {county.lastUpdated}</p></div><div className="rounded-xl bg-[#B23434] p-3"><ShieldAlert size={24} /></div></div><div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#315144] pt-4 text-center"><div><p className="text-lg font-bold">{county.rainfall7d}mm</p><p className="text-[11px] text-[#B9C7BE]">Rainfall / 7 days</p></div><div><p className="text-lg font-bold">{county.tempAvg}°C</p><p className="text-[11px] text-[#B9C7BE]">Avg temperature</p></div><div><p className="text-lg font-bold">{county.humidity}%</p><p className="text-[11px] text-[#B9C7BE]">Humidity</p></div></div></section>
      <section className="mt-5 rounded-2xl border border-[#E2E6DE] bg-white p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0A5A41]">Farmer notifications</p><h2 className="mt-1 font-display text-base font-bold">What changed and what to do</h2><p className="mt-1 text-xs text-[#55665C]">Updates targeted to {county.name} County. Regional outlooks are shown only as guidance for this county.</p></div><button type="button" onClick={enableNotifications} disabled={notificationsEnabled} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#BFD7C8] px-3 py-2 text-xs font-bold text-[#0A5A41] disabled:cursor-default disabled:bg-[#F3FAF5] sm:w-auto"><Bell size={14} /> {notificationsEnabled ? 'Phone alerts enabled' : 'Enable phone alerts'}</button></div><div className="mt-4 grid gap-3 md:grid-cols-3">{localNotifications.map((notification) => { const Icon = NOTIFICATION_ICONS[notification.kind]; const expanded = expandedNotification === notification.id; return <article key={notification.id} className="rounded-xl border border-[#E2E6DE] bg-[#FBFCFA] p-4"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E6F0F8] text-[#2E6FA7]"><Icon size={17} /></span><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold">{notification.title}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${notification.severity === 'Warning' ? 'bg-[#FAE1DE] text-[#B23434]' : notification.severity === 'Watch' ? 'bg-[#FBF1DC] text-[#8B6B14]' : 'bg-[#E6F0F8] text-[#2E6FA7]'}`}>{notification.severity}</span></div><p className="mt-1 text-xs leading-5 text-[#55665C]">{notification.summary}</p><p className="mt-2 text-[11px] font-bold text-[#0A5A41]">{county.name} County · Expected: {notification.timing}</p><p className="mt-1 text-[11px] text-[#7A877F]">Source: {notification.source}</p></div></div><button type="button" onClick={() => setExpandedNotification(expanded ? null : notification.id)} className="mt-3 text-xs font-bold text-[#0A5A41]">{expanded ? 'Hide next steps' : 'Show next steps'}</button>{expanded && <div className="mt-3 border-t border-[#E2E6DE] pt-3"><p className="flex items-center gap-1.5 text-xs font-bold text-[#0A5A41]"><CheckCircle2 size={14} /> Recommended actions</p><ol className="mt-2 space-y-1.5 text-xs leading-5 text-[#55665C]">{notification.actions.map((action, index) => <li key={action}><span className="mr-1 font-bold text-[#0E7C5A]">{index + 1}.</span>{action}</li>)}</ol></div>}</article>; })}</div></section>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><section className="rounded-2xl border border-[#E2E6DE] bg-white p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-base font-bold">Early warnings</h2><p className="mt-1 text-xs text-[#55665C]">Alerts from weather and health surveillance teams.</p></div><Bell size={18} className="text-[#B23434]" /></div>{visibleAlerts.length ? <div className="mt-4 space-y-3">{visibleAlerts.map((alert) => <article key={alert.id} className="rounded-xl border border-[#F0D5D0] bg-[#FFF8F7] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-[#7A2828]">{alert.level === 'critical' ? 'Critical malaria risk' : 'Malaria risk alert'} · {alert.ward}</p><p className="mt-1 text-xs leading-5 text-[#55665C]">{alert.indicators[0]}</p></div><span className="shrink-0 rounded-full bg-[#FAE1DE] px-2 py-1 text-[10px] font-bold uppercase text-[#B23434]">{alert.confidence}</span></div><p className="mt-3 text-xs font-semibold text-[#3D4D44]">Recommended: {alert.recommendedActions[0]}</p></article>)}</div> : <p className="mt-5 rounded-xl bg-[#F3FAF5] p-4 text-sm text-[#0A5A41]">No active alerts in {county.name}. Keep monitoring local conditions.</p>}{!showAll && <button type="button" onClick={() => setShowAll(true)} className="mt-4 text-xs font-bold text-[#0A5A41]">View regional alerts</button>}</section>
        <section className="rounded-2xl border border-[#E2E6DE] bg-white p-5"><h2 className="font-display text-base font-bold">Today’s weather</h2><p className="mt-1 text-xs text-[#55665C]">Forecast signals for planning farm work.</p><div className="mt-5 grid grid-cols-2 gap-3"><Metric icon={<CloudRain size={16} />} label="Rainfall" value={`${weatherTrend.rainfall.at(-1)} mm`} /><Metric icon={<Thermometer size={16} />} label="Temperature" value={`${weatherTrend.temperature.at(-1)}°C`} /><Metric icon={<Droplets size={16} />} label="Humidity" value={`${county.humidity}%`} /><Metric icon={<Wind size={16} />} label="Wind" value="Light" /></div><div className="mt-5 rounded-xl bg-[#F3FAF5] p-4"><p className="text-xs font-bold text-[#0A5A41]">Farm action</p><p className="mt-1 text-xs leading-5 text-[#55665C]">Check standing water after rainfall and report unusual mosquito activity to your local health team.</p></div></section></div>
      <section className="mt-5 rounded-2xl border border-[#E2E6DE] bg-white p-5"><h2 className="font-display text-base font-bold">Health surveillance snapshot</h2><p className="mt-1 text-xs text-[#55665C]">Latest county reports from participating facilities.</p><div className="mt-4 grid grid-cols-3 gap-3"><Metric label="Suspected" value={county.suspected.toLocaleString()} /><Metric label="Tested" value={county.tested.toLocaleString()} /><Metric label="Positive" value={county.positive.toLocaleString()} /></div><p className="mt-4 text-xs text-[#55665C]">If someone has fever, seek testing at the nearest health facility promptly.</p></section>
    </div></main>;
}

function Metric({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) { return <div className="rounded-xl bg-[#F6F7F4] p-3"><div className="flex items-center gap-1.5 text-[#0E7C5A]">{icon}<span className="text-[11px] font-semibold text-[#55665C]">{label}</span></div><p className="mt-1 font-display text-lg font-bold">{value}</p></div>; }