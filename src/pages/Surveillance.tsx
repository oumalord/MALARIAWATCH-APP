import type { ReactNode } from 'react';
import { Activity, Percent, Users, ClipboardCheck } from 'lucide-react';
import { Card, RiskBadge } from '../components/ui';
import { LineChart } from '../components/charts';
import { useLiveData } from '../lib/liveData';

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F3EB] text-[#0A5A41]">{icon}</span>
      <div>
        <p className="text-[12px] text-[#55665C]">{label}</p>
        <p className="font-display text-[19px] font-bold text-[#14201A]">{value}</p>
      </div>
    </Card>
  );
}

export default function Surveillance() {
  const { counties, surveillanceTrend, weeklyLabels } = useLiveData();
  const totalSuspected = counties.reduce((s, c) => s + c.suspected, 0);
  const totalTested = counties.reduce((s, c) => s + c.tested, 0);
  const totalPositive = counties.reduce((s, c) => s + c.positive, 0);
  const positivity = (totalPositive / totalTested) * 100;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Users size={16} />} label="Suspected cases" value={totalSuspected.toLocaleString()} />
        <StatCard icon={<ClipboardCheck size={16} />} label="Tested" value={totalTested.toLocaleString()} />
        <StatCard icon={<Activity size={16} />} label="Confirmed positive" value={totalPositive.toLocaleString()} />
        <StatCard icon={<Percent size={16} />} label="Positivity rate" value={`${positivity.toFixed(1)}%`} />
      </div>

      <Card>
        <h2 className="font-display text-[16px] font-bold text-[#14201A]">National trend — last 12 weeks</h2>
        <p className="mb-2 text-[12.5px] text-[#55665C]">Aggregate surveillance data; not individual patient records.</p>
        <LineChart categories={weeklyLabels} series={[{ name: 'Suspected', color: '#2E6FA7', values: surveillanceTrend.suspected }, { name: 'Positive', color: '#B23434', values: surveillanceTrend.positive }]} />
      </Card>

      <Card className="overflow-x-auto">
        <h2 className="mb-3 font-display text-[16px] font-bold text-[#14201A]">Surveillance by county</h2>
        <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#E2E6DE] text-[12px] text-[#55665C]">
              <th className="py-2 pr-4 font-medium">County</th>
              <th className="py-2 pr-4 font-medium">Ecological zone</th>
              <th className="py-2 pr-4 font-medium">Suspected</th>
              <th className="py-2 pr-4 font-medium">Tested</th>
              <th className="py-2 pr-4 font-medium">Positive</th>
              <th className="py-2 pr-4 font-medium">Positivity</th>
              <th className="py-2 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {counties.map((c) => (
              <tr key={c.id} className="border-b border-[#E2E6DE] last:border-0">
                <td className="py-2.5 pr-4 font-semibold text-[#14201A]">{c.name}</td>
                <td className="py-2.5 pr-4 text-[#55665C]">{c.region}</td>
                <td className="py-2.5 pr-4 tabular-nums text-[#55665C]">{c.suspected}</td>
                <td className="py-2.5 pr-4 tabular-nums text-[#55665C]">{c.tested}</td>
                <td className="py-2.5 pr-4 tabular-nums text-[#55665C]">{c.positive}</td>
                <td className="py-2.5 pr-4 tabular-nums text-[#55665C]">{((c.positive / c.tested) * 100).toFixed(1)}%</td>
                <td className="py-2.5"><RiskBadge level={c.risk} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
