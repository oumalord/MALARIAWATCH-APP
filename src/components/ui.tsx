import type { ReactNode } from 'react';
import type { RiskLevel, VerificationStatus, AlertStatus } from '../types';

export const RISK_META: Record<RiskLevel, { label: string; color: string; soft: string }> = {
  low: { label: 'Low', color: '#1F8A4C', soft: '#E1F4E8' },
  watch: { label: 'Watch', color: '#9C6B0A', soft: '#FBF0D8' },
  alert: { label: 'Alert', color: '#B85A16', soft: '#FBEADA' },
  critical: { label: 'Critical', color: '#B23434', soft: '#FAE1DE' },
};

export function RiskBadge({ level, size = 'md' }: { level: RiskLevel; size?: 'sm' | 'md' }) {
  const meta = RISK_META[level];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad}`} style={{ background: meta.soft, color: meta.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

const VERIFICATION_META: Record<VerificationStatus, { label: string; color: string; soft: string }> = {
  pending: { label: 'Pending', color: '#8B6B14', soft: '#FBF1DC' },
  under_review: { label: 'Under review', color: '#2E6FA7', soft: '#E6F0F8' },
  verified: { label: 'Verified', color: '#0E7C5A', soft: '#E3F3EB' },
  rejected: { label: 'Rejected', color: '#B23434', soft: '#FAE1DE' },
};

export function VerificationPill({ status }: { status: VerificationStatus }) {
  const meta = VERIFICATION_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: meta.soft, color: meta.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

const ALERT_STATUS_META: Record<AlertStatus, { label: string; color: string; soft: string }> = {
  created: { label: 'Created', color: '#8B6B14', soft: '#FBF1DC' },
  acknowledged: { label: 'Acknowledged', color: '#2E6FA7', soft: '#E6F0F8' },
  investigating: { label: 'Investigating', color: '#6B4FA0', soft: '#EEE7F7' },
  resolved: { label: 'Resolved', color: '#0E7C5A', soft: '#E3F3EB' },
};

export function AlertStatusPill({ status }: { status: AlertStatus }) {
  const meta = ALERT_STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: meta.soft, color: meta.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-[#E2E6DE] bg-white p-5 ${className}`}>{children}</div>;
}

export function KpiCard({ label, value, unit, sub, trend, icon }: { label: string; value: string; unit?: string; sub?: string; trend?: { direction: 'up' | 'down'; label: string; good: boolean }; icon: ReactNode }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#55665C]">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3F3EB] text-[#0A5A41]">{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[28px] font-bold leading-none tracking-tight text-[#14201A] tabular-nums">{value}</span>
        {unit && <span className="text-[13px] font-medium text-[#55665C]">{unit}</span>}
      </div>
      {sub && <p className="text-[12.5px] text-[#55665C]">{sub}</p>}
      {trend && (
        <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${trend.good ? 'bg-[#E1F4E8] text-[#1F8A4C]' : 'bg-[#FAE1DE] text-[#B23434]'}`}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.label}
        </span>
      )}
    </Card>
  );
}

export function ProgressBar({ value, color = '#0E7C5A' }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#EFF2EC]">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  );
}
