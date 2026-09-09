import type { ReactNode } from 'react';
import { Droplets, Thermometer, Wind, CloudRain } from 'lucide-react';
import { Card } from '../components/ui';
import { LineChart } from '../components/charts';
import { weatherTrend, dailyLabels, counties } from '../data/mockData';

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F0F8] text-[#2E6FA7]">{icon}</span>
      <div>
        <p className="text-[12px] text-[#55665C]">{label}</p>
        <p className="font-display text-[19px] font-bold text-[#14201A]">{value}</p>
      </div>
    </Card>
  );
}

export default function Weather() {
  const avgRain = Math.round(weatherTrend.rainfall.reduce((a, b) => a + b, 0) / weatherTrend.rainfall.length);
  const avgTemp = (weatherTrend.temperature.reduce((a, b) => a + b, 0) / weatherTrend.temperature.length).toFixed(1);
  const totalStandingWater = counties.reduce((s, c) => s + c.standingWater, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Droplets size={16} />} label="Avg. rainfall per day (14d)" value={`${avgRain} mm`} />
        <MetricCard icon={<Thermometer size={16} />} label="Avg. temperature" value={`${avgTemp}°C`} />
        <MetricCard icon={<CloudRain size={16} />} label="Standing water observations" value={String(totalStandingWater)} />
        <MetricCard icon={<Wind size={16} />} label="Counties reporting flooding" value={String(counties.filter((c) => c.rainfall7d > 100).length)} />
      </div>

      <Card>
        <h2 className="font-display text-[16px] font-bold text-[#14201A]">National rainfall &amp; temperature — last 14 days</h2>
        <p className="mb-2 text-[12.5px] text-[#55665C]">Observed field weather data feeding the early-warning engine.</p>
        <LineChart categories={dailyLabels} series={[{ name: 'Rainfall (mm)', color: '#2E6FA7', values: weatherTrend.rainfall }, { name: 'Temperature (°C)', color: '#D9761F', values: weatherTrend.temperature }]} />
      </Card>

      <Card className="overflow-x-auto">
        <h2 className="mb-3 font-display text-[16px] font-bold text-[#14201A]">Environmental observations by county</h2>
        <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#E2E6DE] text-[12px] text-[#55665C]">
              <th className="py-2 pr-4 font-medium">County</th>
              <th className="py-2 pr-4 font-medium">Rainfall (7d)</th>
              <th className="py-2 pr-4 font-medium">Avg. temp</th>
              <th className="py-2 pr-4 font-medium">Humidity</th>
              <th className="py-2 font-medium">Standing water sites</th>
            </tr>
          </thead>
          <tbody>
            {counties.map((c) => (
              <tr key={c.id} className="border-b border-[#E2E6DE] last:border-0">
                <td className="py-2.5 pr-4 font-semibold text-[#14201A]">{c.name}</td>
                <td className="py-2.5 pr-4 tabular-nums text-[#55665C]">{c.rainfall7d} mm</td>
                <td className="py-2.5 pr-4 tabular-nums text-[#55665C]">{c.tempAvg}°C</td>
                <td className="py-2.5 pr-4 tabular-nums text-[#55665C]">{c.humidity}%</td>
                <td className="py-2.5 tabular-nums text-[#55665C]">{c.standingWater}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
