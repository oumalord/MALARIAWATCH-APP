import { useState } from 'react';
import { AlertTriangle, MapPin, Clock, Users, Layers } from 'lucide-react';
import { Card, RiskBadge, AlertStatusPill, RISK_META } from '../components/ui';
import { useLiveData } from '../lib/liveData';
import { updateAlertStatus } from '../lib/api';
import type { RiskLevel, AlertStatus } from '../types';

const STATUS_FLOW: AlertStatus[] = ['created', 'acknowledged', 'investigating', 'resolved'];

function nextStatus(current: AlertStatus): AlertStatus {
  const idx = STATUS_FLOW.indexOf(current);
  return STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)];
}

function nextActionLabel(current: AlertStatus): string | null {
  const map: Record<AlertStatus, string | null> = { created: 'Acknowledge', acknowledged: 'Mark investigating', investigating: 'Resolve', resolved: null };
  return map[current];
}

export default function EarlyWarning() {
  const { counties, alerts: liveAlerts } = useLiveData();
  const [statusOverrides, setStatusOverrides] = useState<Record<string, AlertStatus>>({});
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  const alerts = liveAlerts.map((a) => (statusOverrides[a.id] ? { ...a, status: statusOverrides[a.id] } : a));
  const filtered = alerts.filter((a) => riskFilter === 'all' || a.level === riskFilter);

  function advance(id: string) {
    const current = alerts.find((a) => a.id === id);
    if (!current) return;
    const next = nextStatus(current.status);
    setStatusOverrides((prev) => ({ ...prev, [id]: next }));
    void updateAlertStatus(id, next).catch(() => undefined);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'critical', 'alert', 'watch', 'low'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setRiskFilter(lvl)}
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold capitalize transition-colors ${riskFilter === lvl ? 'border-[#0E7C5A] bg-[#0E7C5A] text-white' : 'border-[#E2E6DE] bg-white text-[#55665C] hover:bg-[#EFF2EC]'}`}
          >
            {lvl}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((a) => {
          const county = counties.find((c) => c.id === a.countyId);
          const action = nextActionLabel(a.status);
          return (
            <Card key={a.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <RiskBadge level={a.level} />
                    <AlertStatusPill status={a.status} />
                    <span className="inline-flex items-center gap-1 text-[12.5px] text-[#55665C]"><MapPin size={13} /> {county?.name}, {a.ward} Ward</span>
                    <span className="inline-flex items-center gap-1 text-[12.5px] text-[#55665C]"><Clock size={13} /> {a.createdAt}</span>
                  </div>
                  <h3 className="mt-2.5 font-display text-[16px] font-bold text-[#14201A]">Malaria risk {RISK_META[a.level].label.toLowerCase()} — {county?.name}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-[#55665C]">
                    {a.indicators.map((ind, i) => (<li key={i}>{ind}</li>))}
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[12.5px] text-[#8B978F]">
                    <span>Expected period: {a.expectedPeriod}</span>
                    <span>Confidence: {a.confidence}</span>
                    <span className="inline-flex items-center gap-1"><Users size={12} /> Assigned: {a.assignedTeam}</span>
                    <span className="inline-flex items-center gap-1"><Layers size={12} /> Sources: {a.dataSources.join(', ')}</span>
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 rounded-xl bg-[#EFF2EC] p-4 lg:w-72">
                  <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#14201A]"><AlertTriangle size={13} /> Recommended action</p>
                  <ul className="list-disc space-y-1 pl-5 text-[12.5px] text-[#55665C]">
                    {a.recommendedActions.map((act, i) => (<li key={i}>{act}</li>))}
                  </ul>
                  {action && (
                    <button onClick={() => advance(a.id)} className="mt-1 rounded-lg bg-[#0E7C5A] px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#0A5A41]">{action}</button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <Card className="text-center text-[13px] text-[#55665C]">No alerts match this filter.</Card>}
      </div>
    </div>
  );
}
