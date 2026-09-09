import { project, KENYA_OUTLINE, LAKE_VICTORIA, MAP_WIDTH, MAP_HEIGHT } from '../lib/geo';
import { RISK_META } from './ui';
import type { County } from '../types';

export function KenyaMap({ counties, selectedId, onSelect, interactive = true, showLegend = true }: { counties: County[]; selectedId?: string | null; onSelect?: (id: string) => void; interactive?: boolean; showLegend?: boolean }) {
  const maxPositive = Math.max(...counties.map((c) => c.positive), 1);
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} width="100%" style={{ maxHeight: 520, display: 'block', margin: '0 auto' }} preserveAspectRatio="xMidYMid meet">
        <path d={KENYA_OUTLINE} fill="#EFF2EC" stroke="#D8DDD2" strokeWidth={1.5} strokeLinejoin="round" />
        <ellipse cx={LAKE_VICTORIA.cx} cy={LAKE_VICTORIA.cy} rx={LAKE_VICTORIA.rx} ry={LAKE_VICTORIA.ry} fill="#E6F0F8" stroke="#2E6FA7" strokeWidth={1} opacity={0.9} />
        {counties.map((c) => {
          const { x, y } = project(c.lon, c.lat);
          const r = 3.5 + (c.positive / maxPositive) * 9;
          const meta = RISK_META[c.risk];
          const selected = selectedId === c.id;
          return (
            <g key={c.id} onClick={() => interactive && onSelect?.(c.id)} style={{ cursor: interactive ? 'pointer' : 'default' }}>
              {selected && <circle cx={x} cy={y} r={r + 5} fill="none" stroke={meta.color} strokeWidth={1.5} opacity={0.5} />}
              <circle cx={x} cy={y} r={r} fill={meta.color} fillOpacity={0.85} stroke="#ffffff" strokeWidth={1.3} />
            </g>
          );
        })}
      </svg>
      {showLegend && (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-[#E2E6DE] pt-3">
          {(Object.keys(RISK_META) as (keyof typeof RISK_META)[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 text-[12px] text-[#55665C]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: RISK_META[k].color }} />
              {RISK_META[k].label}
            </span>
          ))}
          <span className="text-[11.5px] text-[#8B978F]">Marker size ≈ confirmed positive cases · illustrative</span>
        </div>
      )}
    </div>
  );
}
