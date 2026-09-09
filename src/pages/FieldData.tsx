import { useState } from 'react';
import { ClipboardList, Users2, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, ProgressBar, VerificationPill } from '../components/ui';
import { indicators, fieldSubmissions as initialSubmissions } from '../data/mockData';
import type { VerificationStatus } from '../types';

export default function FieldData() {
  const [submissions, setSubmissions] = useState(initialSubmissions);

  function setStatus(id: string, status: VerificationStatus) {
    setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  const baselineDone = 82;
  const endlineDone = 41;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[16px] font-bold text-[#14201A]">Kenya Malaria Programme — 2026</h2>
            <p className="text-[12.5px] text-[#55665C]">18 counties · 3,200 target households · Baseline Nov 2025, endline in progress</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#E3F3EB] px-3 py-1.5 text-[12.5px] font-semibold text-[#0A5A41]"><Users2 size={14} /> 64 active enumerators</div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[13px]"><span className="font-medium text-[#14201A]">Baseline completion</span><span className="text-[#55665C]">{baselineDone}%</span></div>
            <ProgressBar value={baselineDone} color="#0E7C5A" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[13px]"><span className="font-medium text-[#14201A]">Endline completion</span><span className="text-[#55665C]">{endlineDone}%</span></div>
            <ProgressBar value={endlineDone} color="#2E6FA7" />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-[16px] font-bold text-[#14201A]">Baseline vs. endline indicators</h2>
        <p className="mb-4 text-[12.5px] text-[#55665C]">Percentage-point change and percentage change are reported separately.</p>
        <div className="flex flex-col divide-y divide-[#E2E6DE]">
          {indicators.map((ind) => {
            const ptChange = ind.endline - ind.baseline;
            const pctChange = (ptChange / ind.baseline) * 100;
            const improved = ind.goodDirection === 'up' ? ptChange > 0 : ptChange < 0;
            return (
              <div key={ind.code} className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="text-[13.5px] font-semibold text-[#14201A]">{ind.name}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EFF2EC]">
                      <div className="h-full rounded-full bg-[#8B978F]" style={{ width: `${ind.baseline}%` }} />
                    </div>
                    <span className="w-10 text-right text-[11.5px] tabular-nums text-[#55665C]">{ind.baseline}%</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EFF2EC]">
                      <div className="h-full rounded-full bg-[#0E7C5A]" style={{ width: `${ind.endline}%` }} />
                    </div>
                    <span className="w-10 text-right text-[11.5px] tabular-nums text-[#55665C]">{ind.endline}%</span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 justify-self-start rounded-full px-3 py-1.5 text-[12.5px] font-semibold sm:justify-self-end ${improved ? 'bg-[#E1F4E8] text-[#1F8A4C]' : 'bg-[#FAE1DE] text-[#B23434]'}`}>
                  {improved ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {ptChange > 0 ? '+' : ''}{ptChange} pts ({pctChange > 0 ? '+' : ''}{pctChange.toFixed(0)}%)
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="overflow-x-auto">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardList size={16} className="text-[#0A5A41]" />
          <h2 className="font-display text-[16px] font-bold text-[#14201A]">Data verification queue</h2>
        </div>
        <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-[#E2E6DE] text-[12px] text-[#55665C]">
              <th className="py-2 pr-4 font-medium">Form type</th>
              <th className="py-2 pr-4 font-medium">Enumerator</th>
              <th className="py-2 pr-4 font-medium">Location</th>
              <th className="py-2 pr-4 font-medium">Submitted</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s.id} className="border-b border-[#E2E6DE] last:border-0">
                <td className="py-2.5 pr-4 text-[#14201A]">{s.type}</td>
                <td className="py-2.5 pr-4 text-[#55665C]">{s.enumerator}</td>
                <td className="py-2.5 pr-4 text-[#55665C]">{s.county}, {s.ward}</td>
                <td className="py-2.5 pr-4 text-[#55665C]">{s.timestamp}</td>
                <td className="py-2.5 pr-4"><VerificationPill status={s.status} /></td>
                <td className="py-2.5">
                  {s.status === 'pending' || s.status === 'under_review' ? (
                    <div className="flex gap-2">
                      <button onClick={() => setStatus(s.id, 'verified')} className="rounded-lg bg-[#0E7C5A] px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-[#0A5A41]">Verify</button>
                      <button onClick={() => setStatus(s.id, 'rejected')} className="rounded-lg border border-[#E2E6DE] px-2.5 py-1 text-[12px] font-semibold text-[#55665C] hover:bg-[#EFF2EC]">Reject</button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[12px] text-[#8B978F]"><CheckCircle2 size={13} /> Complete</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
