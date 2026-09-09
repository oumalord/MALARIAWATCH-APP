import { LayoutDashboard, ShieldAlert, Map, Activity, ClipboardList, CloudRain, UsersRound } from 'lucide-react';
import type { SessionUser } from '../App';

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/early-warning', label: 'Early Warning', icon: ShieldAlert },
  { path: '/gis', label: 'GIS Map', icon: Map },
  { path: '/surveillance', label: 'Surveillance', icon: Activity },
  { path: '/field-data', label: 'Field Data & M&E', icon: ClipboardList },
  { path: '/weather', label: 'Weather', icon: CloudRain },
] as const;

export default function Sidebar({ currentRoute, user, onSignOut }: { currentRoute: string; user: SessionUser; onSignOut: () => void }) {
  const navigation = user.role === 'super_admin' ? [...NAV, { path: '/accounts', label: 'Account Management', icon: UsersRound }] : NAV;
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-[#0D1C18] px-4 py-6 md:flex">
      <div className="flex items-center gap-2.5 px-2 pb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E7C5A] font-display text-base font-bold text-white">M</div>
        <div>
          <p className="font-display text-[15px] font-bold leading-tight text-white">MalariaWatch</p>
          <p className="text-[11px] font-medium leading-tight text-[#B9C7BE]">Kenya Surveillance Programme</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = currentRoute === item.path;
          return (
            <a
              key={item.path}
              href={`#${item.path}`}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors ${active ? 'bg-[#16332A] text-white' : 'text-[#B9C7BE] hover:bg-[#16332A] hover:text-white'}`}
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
            </a>
          );
        })}
      </nav>
      <div className="mt-4 rounded-xl bg-[#16332A] p-3.5">
        <p className="text-[11px] font-medium text-[#B9C7BE]">Signed in as</p>
        <p className="mt-1 text-[13px] font-semibold text-white">{user.name}</p>
        <p className="text-[11.5px] text-[#B9C7BE]">{user.role === 'enumerator' ? 'Field Enumerator' : user.role === 'super_admin' ? 'Super Admin' : 'Administrator'} · {user.organisation}</p>
        <button type="button" onClick={onSignOut} className="mt-3 w-full rounded-lg border border-[#315144] px-3 py-2 text-left text-[12px] font-semibold text-[#D7E5DC] transition-colors hover:bg-[#234638]">Log out</button>
      </div>
    </aside>
  );
}
