import { ShieldAlert, Activity, ClipboardList, Droplets, ArrowUpRight, Info } from 'lucide-react';
import { Card, KpiCard, RiskBadge, AlertStatusPill } from '../components/ui';
import { LineChart, RiskDistributionBar } from '../components/charts';
import { KenyaMap } from '../components/KenyaMap';
import { counties, alerts, surveillanceTrend, weeklyLabels } from '../data/mockData';

function severityRank(level: string) {
  return { critical: 4, alert: 3, watch: 2, low: 1 }[level] ?? 0;
}

export default function Dashboard() {
  const activeAlerts = alerts.filter((a) => a.status !== 'resolved');
  const riskCounts = counties.reduce<Record<string, number>>((acc, c) => {
    acc[c.risk] = (acc[c.risk] || 0) + 1;
    return acc;
  }, {});
  const pendingVerification = counties.reduce((sum, c) => sum + c.pendingVerification, 0);
  const totalTested = counties.reduce((s, c) => s + c.tested, 0);
  const totalPositive = counties.reduce((s, c) => s + c.positive, 0);
  const nationalPositivity = (totalPositive / totalTested) * 100;
  const topAlerts = [...alerts].sort((a, b) => severityRank(b.level) - severityRank(a.level)).slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-2xl border border-[#E2E6DE] bg-[#EFF2EC] px-4 py-3">
        <Info size={16} className="mt-0.5 shrink-0 text-[#55665C]" />
        <p className="text-[12.5px] leading-relaxed text-[#55665C]">Illustrative demo dataset for design review. Not connected to live health information systems and does not represent confirmed diagnoses.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="National positivity rate" value={nationalPositivity.toFixed(1)} unit="%" sub="Aggregate of tested vs. positive, last 7 days" icon={<Activity size={16} />} trend={{ direction: 'up', label: '+2.1 pts vs last week', good: false }} />
        <KpiCard label="Active alerts" value={String(activeAlerts.length)} sub={`${alerts.filter((a) => a.level === 'critical').length} critical · ${alerts.filter((a) => a.level === 'alert').length} alert`} icon={<ShieldAlert size={16} />} />
        <KpiCard label="Pending verification" value={String(pendingVerification)} sub="Field submissions awaiting supervisor review" icon={<ClipboardList size={16} />} />
        <KpiCard label="Counties above rainfall watch" value={String(counties.filter((c) => c.rainfall7d > 70).length)} unit={`/ ${counties.length}`} sub="7-day rainfall above seasonal watch threshold" icon={<Droplets size={16} />} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-[16px] font-bold text-[#14201A]">Active early warning alerts</h2>
                <p className="text-[12.5px] text-[#55665C]">Highest-severity alerts requiring attention</p>
              </div>
              <a href="#/early-warning" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0A5A41]">View all <ArrowUpRight size={14} /></a>
            </div>
            <div className="flex flex-col divide-y divide-[#E2E6DE]">
              {topAlerts.map((a) => {
                const county = counties.find((c) => c.id === a.countyId);
                return (
                  <div key={a.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <RiskBadge level={a.level} size="sm" />
                        <p className="truncate text-[13.5px] font-semibold text-[#14201A]">{county?.name}, {a.ward} Ward</p>
                      </div>
                      <p className="mt-0.5 truncate text-[12.5px] text-[#55665C]">{a.indicators[0]}</p>
                    </div>
                    <AlertStatusPill status={a.status} />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-[16px] font-bold text-[#14201A]">Surveillance trend</h2>
            <p className="mb-2 text-[12.5px] text-[#55665C]">Suspected vs. confirmed positive cases, last 12 weeks</p>
            <LineChart
              categories={weeklyLabels}
              series={[
                { name: 'Suspected', color: '#2E6FA7', values: surveillanceTrend.suspected },
                { name: 'Positive', color: '#B23434', values: surveillanceTrend.positive },
              ]}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[16px] font-bold text-[#14201A]">Risk map preview</h2>
              <a href="#/gis" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#0A5A41]">Full map <ArrowUpRight size={13} /></a>
            </div>
            <KenyaMap counties={counties} interactive={false} showLegend={false} />
            <div className="mt-3">
              <RiskDistributionBar counts={riskCounts} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
