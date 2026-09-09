import { Bell, Search } from 'lucide-react';
import { alerts } from '../data/mockData';

export default function TopBar({ title, subtitle }: { title: string; subtitle: string }) {
  const activeCount = alerts.filter((a) => a.status !== 'resolved').length;
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[#E2E6DE] bg-white px-4 py-4 sm:px-8">
      <div>
        <h1 className="font-display text-[20px] font-bold leading-tight text-[#14201A] sm:text-[22px]">{title}</h1>
        <p className="text-[13px] text-[#55665C]">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-[#E2E6DE] bg-[#EFF2EC] px-3.5 py-2 text-[13px] text-[#55665C] md:flex">
          <Search size={15} />
          <span>Search counties, wards, alerts…</span>
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E6DE] bg-white text-[#55665C] transition-colors hover:bg-[#EFF2EC]">
          <Bell size={18} />
          {activeCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#B23434] px-1 text-[10px] font-bold text-white">{activeCount}</span>
          )}
        </button>
        <div className="hidden flex-col items-end sm:flex">
          <span className="text-[13px] font-semibold text-[#14201A]">National Programme</span>
          <span className="text-[11.5px] text-[#55665C]">2026 season</span>
        </div>
      </div>
    </header>
  );
}
