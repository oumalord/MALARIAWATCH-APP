import { useState } from 'react';
import { Check, ChevronRight, LockKeyhole, Shield, Sparkles, UserRound } from 'lucide-react';
import type { SessionUser, UserRole } from '../App';

const ACCOUNTS: Record<Exclude<UserRole, 'farmer'>, SessionUser & { email: string; password: string; description: string; permissions: string[] }> = {
  enumerator: {
    name: 'J. Owino',
    role: 'enumerator',
    organisation: 'Kisumu County',
    email: 'enumerator@malariawatch.demo',
    password: 'field2026',
    description: 'Collect household, weather and environmental observations in the field.',
    permissions: ['Submit field observations', 'Work online or offline', 'View assigned wards'],
  },
  supervisor: {
    name: 'A. Wanjiru',
    role: 'supervisor',
    organisation: 'MoH Demo',
    email: 'admin@malariawatch.demo',
    password: 'admin2026',
    description: 'Coordinate teams, review submissions and monitor malaria risk across Kenya.',
    permissions: ['Review and verify submissions', 'Manage alerts and teams', 'View national intelligence'],
  },
};

export default function Login({ onSignIn }: { onSignIn: (user: SessionUser) => void }) {
  const [role, setRole] = useState<UserRole>('enumerator');
  const account = role === 'farmer' ? null : ACCOUNTS[role];
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [email, setEmail] = useState(account?.email ?? '');
  const [password, setPassword] = useState(account?.password ?? '');
  const [error, setError] = useState('');

  function selectRole(nextRole: UserRole) {
    setRole(nextRole);
    const nextAccount = nextRole === 'farmer' ? null : ACCOUNTS[nextRole];
    setEmail(nextAccount?.email ?? '');
    setPassword(nextAccount?.password ?? '');
    setMode(nextRole === 'farmer' ? 'login' : 'login');
    setError('');
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (role === 'farmer' && mode === 'signup') {
      if (!name.trim() || !phone.trim() || !county || !email.trim() || password.length < 6) {
        setError('Enter your name, phone, county, email, and a password of at least 6 characters.');
        return;
      }
      onSignIn({ name: name.trim(), role: 'farmer', organisation: 'MalariaWatch Farmer Network', county });
      return;
    }
    if (role === 'farmer') {
      if (!email.trim() || !password.trim()) {
        setError('Enter your email and password to continue.');
        return;
      }
      onSignIn({ name: name.trim() || 'MalariaWatch Farmer', role: 'farmer', organisation: 'MalariaWatch Farmer Network', county: county || 'Nyando' });
      return;
    }
    if (!account || email.trim().toLowerCase() !== account.email || password !== account.password) {
      setError('Use the demo account details shown below, or select Fill demo details.');
      return;
    }
    onSignIn(account);
  }

  return (
    <main className="min-h-screen overflow-y-auto bg-[#092318] px-4 py-10 text-[#14201A] sm:py-16">
      <div className="mx-auto flex max-w-[860px] flex-col items-center">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#087DCC] to-[#17B866] text-white shadow-lg shadow-black/20"><Shield size={29} strokeWidth={2.2} /></div>
          <h1 className="mt-4 font-display text-[23px] font-extrabold text-white">MalariaWatch</h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-[#9EB7A9]"><Sparkles size={13} /> Kenya Rice Crop Intelligence Platform</p>
        </div>

        <section className="w-full max-w-[620px] rounded-[20px] bg-white p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-6 grid grid-cols-3 rounded-full bg-[#EFF0F2] p-1">
            {(['enumerator', 'supervisor', 'farmer'] as UserRole[]).map((item) => (
              <button key={item} type="button" onClick={() => selectRole(item)} className={`flex-1 rounded-full px-3 py-2.5 text-[13px] font-semibold transition-colors ${role === item ? 'bg-white text-[#14201A] shadow-sm' : 'text-[#55665C] hover:text-[#14201A]'}`}>
                {item === 'enumerator' ? 'Enumerator' : item === 'supervisor' ? 'Supervisor' : 'Farmer'}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <h2 className="font-display text-[19px] font-bold">{role === 'farmer' && mode === 'signup' ? 'Create your farmer account' : 'Log in to your account'}</h2>
            <p className="mt-1 text-[13px] text-[#55665C]">{role === 'farmer' ? 'Receive local malaria, weather, and surveillance warnings for your county.' : account?.description}</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {role === 'farmer' && mode === 'signup' && <>
              <label className="block text-[12px] font-semibold text-[#3D4D44]">Full name<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#DCE2DB] px-3 py-2.5 text-[13px] outline-none focus:border-[#0E7C5A]" placeholder="e.g. Grace Wambui" /></label>
              <label className="block text-[12px] font-semibold text-[#3D4D44]">Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" className="mt-1.5 w-full rounded-lg border border-[#DCE2DB] px-3 py-2.5 text-[13px] outline-none focus:border-[#0E7C5A]" placeholder="07XX XXX XXX" /></label>
              <label className="block text-[12px] font-semibold text-[#3D4D44]">County<select value={county} onChange={(event) => setCounty(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#DCE2DB] bg-white px-3 py-2.5 text-[13px] outline-none focus:border-[#0E7C5A]"><option value="">Select county</option>{['Homa Bay', 'Kisumu', 'Siaya', 'Busia', 'Migori', 'Kisii', 'Kakamega', 'Bungoma'].map((item) => <option key={item}>{item}</option>)}</select></label>
            </>}
            <label className="block text-[12px] font-semibold text-[#3D4D44]">Email address
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#DCE2DB] px-3 py-2.5 focus-within:border-[#0E7C5A]">
                <UserRound size={16} className="text-[#8B978F]" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full bg-transparent text-[13px] outline-none" />
              </div>
            </label>
            <label className="block text-[12px] font-semibold text-[#3D4D44]">Password
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#DCE2DB] px-3 py-2.5 focus-within:border-[#0E7C5A]">
                <LockKeyhole size={16} className="text-[#8B978F]" />
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="w-full bg-transparent text-[13px] outline-none" />
              </div>
            </label>
            {error && <p className="text-[12px] font-medium text-[#B23434]">{error}</p>}
            <button type="submit" className="w-full rounded-lg bg-[#0E7C5A] px-4 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#0A684B]">{role === 'farmer' && mode === 'signup' ? 'Create account' : 'Log in'} <ChevronRight size={15} className="ml-1 inline" /></button>
          </form>

          {role === 'farmer' ? <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="mt-5 w-full text-center text-[12px] font-bold text-[#0A5A41]">{mode === 'login' ? 'New farmer? Create an account' : 'Already registered? Log in'}</button> : <div className="mt-5 rounded-xl border border-dashed border-[#BFD7C8] bg-[#F3FAF5] p-4">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0A5A41]">Demo account</p><p className="mt-1 text-[12px] text-[#55665C]">{account?.email} · {account?.password}</p></div>
              <button type="button" onClick={() => { if (account) { setEmail(account.email); setPassword(account.password); } setError(''); }} className="shrink-0 rounded-lg border border-[#9BC9AE] px-3 py-2 text-[12px] font-bold text-[#0A5A41] hover:bg-white">Fill details</button>
            </div>
            <ul className="mt-3 grid gap-1.5 text-[12px] text-[#55665C] sm:grid-cols-3">
              {account?.permissions.map((permission) => <li key={permission} className="flex items-start gap-1.5"><Check size={14} className="mt-0.5 shrink-0 text-[#0E7C5A]" />{permission}</li>)}
            </ul>
          </div>}
        </section>
        <p className="mt-5 text-center text-[11px] text-[#789183]">For authorised MalariaWatch programme users only</p>
      </div>
    </main>
  );
}