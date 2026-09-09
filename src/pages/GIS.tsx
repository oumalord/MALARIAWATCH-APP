import { useState } from 'react';
import type { ReactNode } from 'react';
import { Search, MapPin, Droplets, Thermometer, Activity, ShieldAlert } from 'lucide-react';
import { Card, RiskBadge } from '../components/ui';
import { KenyaMap } from '../components/KenyaMap';
import { counties } from '../data/mockData';
import type { RiskLevel } from '../types';

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E2E6DE] p-3">
      <p className="flex items-center gap-1.5 text-[11.5px] text-[#55665C]">{icon} {label}</p>
      <p className="mt-1 font-display text-[16px] font-bold text-[#14201A]">{value}</p>
    </div>
  );
}

export default function GIS() {
  const [selectedId, setSelectedId] = useState<string | null>(counties[0]?.id ?? null);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = counties.filter((c) => (riskFilter === 'all' || c.risk === riskFilter) && c.name.toLowerCase().includes(query.toLowerCase()));
  const selected = counties.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr_300px]">
      <Card className="flex flex-col gap-4 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto">
        <div className="flex items-center gap-2 rounded-lg border border-[#E2E6DE] bg-[#EFF2EC] px-3 py-2">
          <Search size={14} className="text-[#55665C]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search county" className="w-full bg-transparent text-[13px] text-[#14201A] outline-none" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'critical', 'alert', 'watch', 'low'] as const).map((lvl) => (
            <button key={lvl} onClick={() => setRiskFilter(lvl)} className={`rounded-full border px-2.5 py-1 text-[11.5px] font-semibold capitalize ${riskFilter === lvl ? 'border-[#0E7C5A] bg-[#0E7C5A] text-white' : 'border-[#E2E6DE] text-[#55665C]'}`}>{lvl}</button>
          ))}
        </div>
        <div className="flex flex-col divide-y divide-[#E2E6DE]">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => setSelectedId(c.id)} className="flex items-center justify-between gap-2 py-2.5 text-left">
              <div>
                <p className="text-[13px] font-semibold text-[#14201A]">{c.name}</p>
                <p className="text-[11.5px] text-[#55665C]">{c.region}</p>
              </div>
              <RiskBadge level={c.risk} size="sm" />
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col">
        <KenyaMap counties={filtered} selectedId={selectedId} onSelect={setSelectedId} />
      </Card>

      <Card className="flex flex-col gap-4">
        {selected ? (
          <>
            <div>
              <RiskBadge level={selected.risk} />
              <h3 className="mt-2 font-display text-[17px] font-bold text-[#14201A]">{selected.name}</h3>
              <p className="text-[12.5px] text-[#55665C]">{selected.region} · updated {selected.lastUpdated}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={<Droplets size={14} />} label="Rainfall (7d)" value={`${selected.rainfall7d} mm`} />
              <Stat icon={<Thermometer size={14} />} label="Avg. temperature" value={`${selected.tempAvg}°C`} />
              <Stat icon={<Activity size={14} />} label="Positivity" value={`${((selected.positive / selected.tested) * 100).toFixed(1)}%`} />
              <Stat icon={<ShieldAlert size={14} />} label="Active alerts" value={String(selected.activeAlerts)} />
            </div>
            <div className="rounded-xl bg-[#EFF2EC] p-3.5 text-[12.5px] text-[#55665C]">
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-[#14201A]"><MapPin size={13} /> Surveillance snapshot</p>
              <p>{selected.suspected} suspected · {selected.tested} tested · {selected.positive} confirmed positive in the current reporting period.</p>
            </div>
          </>
        ) : (
          <p className="text-[13px] text-[#55665C]">Select a county marker to view details.</p>
        )}
      </Card>
    </div>
  );
}
