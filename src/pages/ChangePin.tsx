import { useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import type { SessionUser } from '../App';
import { updateStaffPin } from './Login';

export default function ChangePin({ user, onChanged, onSignOut }: { user: SessionUser; onChanged: (user: SessionUser) => void; onSignOut: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (current !== '1234') { setError('Enter the temporary PIN provided by your administrator.'); return; }
    if (next.length < 4 || next !== confirm || next === '1234') { setError('Choose a new PIN or password of at least 4 characters. Both entries must match and cannot be 1234.'); return; }
    if (!user.accountId) { setError('This account is missing an account ID. Ask your administrator to recreate it.'); return; }
    updateStaffPin(user.accountId, next);
    onChanged({ ...user, mustChangePin: false });
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#F6F7F4] px-4 py-8"><section className="w-full max-w-md rounded-2xl border border-[#E2E6DE] bg-white p-6 shadow-sm sm:p-8"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3F3EB] text-[#0E7C5A]"><ShieldCheck size={23} /></div><h1 className="mt-5 font-display text-2xl font-bold">Set your private PIN</h1><p className="mt-2 text-sm leading-6 text-[#55665C]">Your account was created with a temporary PIN. Change it now before you start collecting field data.</p><form onSubmit={submit} className="mt-6 space-y-4"><PinField label="Temporary PIN" value={current} onChange={setCurrent} /><PinField label="New PIN or password" value={next} onChange={setNext} /><PinField label="Confirm new PIN or password" value={confirm} onChange={setConfirm} />{error && <p className="text-xs font-medium text-[#B23434]">{error}</p>}<button type="submit" className="w-full rounded-lg bg-[#0E7C5A] px-4 py-3 text-sm font-bold text-white hover:bg-[#0A684B]">Save private PIN</button></form><button type="button" onClick={onSignOut} className="mt-4 w-full text-xs font-bold text-[#55665C]">Log out</button></section></main>;
}

function PinField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-xs font-semibold text-[#3D4D44]">{label}<div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#DCE2DB] px-3 py-2.5 focus-within:border-[#0E7C5A]"><KeyRound size={15} className="text-[#8B978F]" /><input required value={value} onChange={(event) => onChange(event.target.value)} type="password" className="w-full bg-transparent text-sm outline-none" /></div></label>; }