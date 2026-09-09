export function LineChart({ categories, series, height = 200 }: { categories: string[]; series: { name: string; color: string; values: number[] }[]; height?: number }) {
  const width = 640;
  const padY = 20;
  const padX = 6;
  const allValues = series.flatMap((s) => s.values);
  const max = Math.max(...allValues, 1) * 1.15;
  const stepX = (width - padX * 2) / (categories.length - 1 || 1);
  const scaleY = (v: number) => height - padY - (v / max) * (height - padY * 2);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={padX} x2={width - padX} y1={padY + (height - padY * 2) * (1 - f)} y2={padY + (height - padY * 2) * (1 - f)} stroke="#E2E6DE" strokeWidth={1} />
        ))}
        {series.map((s) => {
          const points = s.values.map((v, i) => `${padX + i * stepX},${scaleY(v)}`).join(' ');
          return <polyline key={s.name} points={points} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />;
        })}
        {series[0]?.values.map((v, i) => (
          <circle key={i} cx={padX + i * stepX} cy={scaleY(v)} r={2.5} fill={series[0].color} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-[#8B978F]">
        <span>{categories[0]}</span>
        <span>{categories[Math.floor(categories.length / 2)]}</span>
        <span>{categories[categories.length - 1]}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 text-[12px] text-[#55665C]">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RiskDistributionBar({ counts }: { counts: Record<string, number> }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const order: { key: string; label: string; color: string }[] = [
    { key: 'low', label: 'low', color: '#1F8A4C' },
    { key: 'watch', label: 'watch', color: '#9C6B0A' },
    { key: 'alert', label: 'alert', color: '#B85A16' },
    { key: 'critical', label: 'critical', color: '#B23434' },
  ];
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[#EFF2EC]">
        {order.map((o) => (
          <div key={o.key} style={{ width: `${((counts[o.key] || 0) / total) * 100}%`, background: o.color }} />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {order.map((o) => (
          <span key={o.key} className="inline-flex items-center gap-1.5 text-[12px] text-[#55665C]">
            <span className="h-2 w-2 rounded-full" style={{ background: o.color }} />
            {counts[o.key] || 0} {o.label}
          </span>
        ))}
      </div>
    </div>
  );
}
