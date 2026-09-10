import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { useLiveData } from '../lib/liveData';
import type { SessionUser } from '../App';
import type { County, WarningAlert, RiskLevel } from '../types';

interface ChatMessage {
  id: string;
  from: 'assistant' | 'user';
  text: string;
}

const RISK_ADVICE: Record<RiskLevel, string> = {
  low: 'Conditions are calm. Keep routine prevention habits going: sleep under a treated net and clear standing water weekly.',
  watch: 'Conditions are being monitored. Check your compound for standing water and keep nets in good repair.',
  alert: 'Risk is elevated. Increase vigilance: clear breeding sites, use nets every night, and seek testing promptly for any fever.',
  critical: 'Risk is critical. Avoid outdoor exposure at dusk/dawn, use nets nightly, report standing water, and seek care immediately for fever.',
};

function pickCounty(user: SessionUser, counties: County[]): County | undefined {
  return counties.find((c) => c.name === user.county) ?? undefined;
}

function topActiveAlert(alerts: WarningAlert[], countyId?: string): WarningAlert | undefined {
  const pool = countyId ? alerts.filter((a) => a.countyId === countyId && a.status !== 'resolved') : alerts.filter((a) => a.status !== 'resolved');
  const rank: Record<RiskLevel, number> = { critical: 4, alert: 3, watch: 2, low: 1 };
  return [...pool].sort((a, b) => rank[b.level] - rank[a.level])[0];
}

function greet(user: SessionUser, county: County | undefined, alerts: WarningAlert[]): string {
  const scope = county ? `${county.name} County` : 'the national programme';
  const alert = topActiveAlert(alerts, county?.id);
  const risk = county?.risk;
  let line = `Hi ${user.name.split(' ')[0]}, I'm your MalariaWatch assistant. `;
  if (risk) line += `Current risk in ${scope} is "${risk}". ${RISK_ADVICE[risk]}`;
  else line += `I'm tracking live weather and surveillance data across ${scope}.`;
  if (alert) line += ` There is an active ${alert.level} alert in ${alert.ward}.`;
  line += ' Ask me about weather, risk, prevention, or symptoms.';
  return line;
}

function respond(query: string, user: SessionUser, county: County | undefined, alerts: WarningAlert[], weatherTrend: { rainfall: number[]; temperature: number[] }): string {
  const q = query.toLowerCase();
  const scope = county ? county.name : 'nationally';
  const alert = topActiveAlert(alerts, county?.id);

  if (/rain|weather|climate|temperature|humid/.test(q)) {
    const rainfall = county ? county.rainfall7d : weatherTrend.rainfall.at(-1);
    const temp = county ? county.tempAvg : weatherTrend.temperature.at(-1);
    return `Latest reading ${scope}: ${rainfall}mm rainfall (7-day) and ${temp}\u00b0C average temperature${county ? `, ${county.humidity}% humidity` : ''}. ${rainfall && rainfall > 80 ? 'Heavy rain raises breeding-site risk — check for standing water.' : 'Conditions are within the normal seasonal range.'}`;
  }
  if (/risk|alert|outbreak|malaria|warning/.test(q)) {
    if (!county && !alert) return 'No active alerts are showing nationally right now. I will let you know as soon as conditions change.';
    if (alert) return `Highest current alert: ${alert.level} in ${alert.ward} (confidence: ${alert.confidence}). Recommended action: ${alert.recommendedActions[0]}`;
    if (county) return `Risk level in ${county.name} is currently "${county.risk}". ${RISK_ADVICE[county.risk]}`;
  }
  if (/net|bite|prevent|protect|mosquito/.test(q)) {
    return 'Prevention checklist: sleep under a treated bed net every night, clear or cover standing water weekly, use screens or repellent at dusk, and support indoor residual spraying visits from your health team.';
  }
  if (/symptom|fever|sick|test|treat/.test(q)) {
    return 'If you or a family member has a fever, chills, or headache, seek testing at the nearest health facility within 24 hours. Early testing and treatment prevent severe illness.';
  }
  if (/report|submit|form|survey|enumerator/.test(q) && (user.role === 'enumerator' || user.role === 'admin' || user.role === 'super_admin')) {
    return 'Field submissions (baseline surveys, weather and environmental observations) feed directly into the live risk model — the sooner you submit, the faster alerts and dashboards reflect real conditions.';
  }
  if (/account|admin|staff|user|pin/.test(q) && (user.role === 'admin' || user.role === 'super_admin')) {
    return 'Use Account Management to create or suspend staff accounts. New accounts get a temporary PIN (1234) and must change it on first login.';
  }
  return `Here's the current picture ${scope}: risk is ${county ? county.risk : 'varied by county'}${alert ? `, with an active ${alert.level} alert in ${alert.ward}` : ''}. Ask me about weather, risk, prevention, symptoms, or reporting for more specific advice.`;
}

export default function AIAssistant({ user }: { user: SessionUser }) {
  const { counties, alerts, weatherTrend } = useLiveData();
  const county = pickCounty(user, counties);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [{ id: 'greeting', from: 'assistant', text: greet(user, county, alerts) }]);
  const lastRiskRef = useRef<RiskLevel | undefined>(county?.risk);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!county) return;
    if (lastRiskRef.current && lastRiskRef.current !== county.risk) {
      setMessages((prev) => [...prev, { id: `risk-${Date.now()}`, from: 'assistant', text: `Update: risk in ${county.name} just changed from ${lastRiskRef.current} to ${county.risk}. ${RISK_ADVICE[county.risk]}` }]);
    }
    lastRiskRef.current = county.risk;
  }, [county?.risk, county]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value) return;
    const reply = respond(value, user, county, alerts, weatherTrend);
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, from: 'user', text: value }, { id: `a-${Date.now() + 1}`, from: 'assistant', text: reply }]);
    setInput('');
  }

  const suggestions = ['Current risk?', 'Weather update', 'How do I prevent malaria?', 'What if I have a fever?'];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[28rem] w-[21rem] flex-col overflow-hidden rounded-2xl border border-[#DDE5DE] bg-white shadow-2xl sm:w-[23rem]">
          <div className="flex items-center justify-between gap-2 bg-[#0D2A20] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <p className="text-[13px] font-bold">MalariaWatch AI Assistant</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant"><X size={16} /></button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#F6F7F4] px-3 py-3">
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[85%] rounded-xl px-3 py-2 text-[12.5px] leading-5 ${m.from === 'assistant' ? 'bg-white text-[#14201A] shadow-sm' : 'ml-auto bg-[#0E7C5A] text-white'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 border-t border-[#E2E6DE] bg-white px-3 py-2">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-[#DCE2DB] px-2.5 py-1 text-[11px] font-semibold text-[#55665C] hover:bg-[#EFF2EC]">{s}</button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2 border-t border-[#E2E6DE] bg-white p-2.5">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about weather, risk, or prevention…" className="w-full rounded-lg border border-[#DCE2DB] px-3 py-2 text-[12.5px] outline-none focus:border-[#0E7C5A]" />
            <button type="submit" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0E7C5A] text-white hover:bg-[#0A684B]"><Send size={15} /></button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0E7C5A] text-white shadow-xl transition-transform hover:scale-105"
        aria-label="Open AI assistant"
      >
        <Bot size={24} />
      </button>
    </div>
  );
}
