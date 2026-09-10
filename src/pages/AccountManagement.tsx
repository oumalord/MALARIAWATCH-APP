import { useState } from 'react';
import { CheckCircle2, ImagePlus, LogOut, PauseCircle, PlayCircle, RotateCcw, UserPlus, Users } from 'lucide-react';
import type { SessionUser, UserRole } from '../App';
import { activateStaffAccount, getStaffAccounts, saveStaffAccount, suspendStaffAccount } from './Login';
import { DEFAULT_LOGO, getStoredLogo, setStoredLogo } from '../lib/logo';

export default function AccountManagement({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
  const [accounts, setAccounts] = useState(getStaffAccounts());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [county, setCounty] = useState('');
  const [message, setMessage] = useState('');
  const [logoSrc, setLogoSrc] = useState(getStoredLogo());
  const canCreateAdmin = user.role === 'super_admin';
  const accountRole: UserRole = canCreateAdmin ? 'admin' : 'enumerator';

  function refresh() { setAccounts(getStaffAccounts()); }
  function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setStoredLogo(dataUrl);
      setLogoSrc(dataUrl);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }
  function resetLogo() { setStoredLogo(null); setLogoSrc(DEFAULT_LOGO); }
  function createAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const account = { accountId: `${accountRole}-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), pin: '1234', role: accountRole, organisation: canCreateAdmin ? 'MalariaWatch Administration' : 'MalariaWatch Field Team', county: county || undefined, createdBy: user.name, active: true, mustChangePin: true } satisfies SessionUser & { email: string; pin: string; createdBy: string; active: boolean };
    saveStaffAccount(account); refresh(); setName(''); setEmail(''); setCounty(''); setShowForm(false); setMessage(`${accountRole === 'admin' ? 'Admin' : 'Enumerator'} account created. Temporary PIN: 1234.`);
  }
  function toggle(accountId: string, active: boolean) { if (active) suspendStaffAccount(accountId); else activateStaffAccount(accountId); refresh(); }

  return <main className="min-h-screen bg-[#F6F7F4] text-[#14201A]"><header className="sticky top-0 z-10 border-b border-[#DDE5DE] bg-white px-4 py-3 sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between"><div><p className="font-display text-base font-bold">MalariaWatch Access</p><p className="text-xs text-[#55665C]">{user.role === 'super_admin' ? 'Super admin' : 'Administrator'} · {user.name}</p></div><button type="button" onClick={onSignOut} className="inline-flex items-center gap-2 rounded-lg border border-[#DCE2DB] px-3 py-2 text-xs font-bold text-[#55665C]"><LogOut size={14} /> Log out</button></div></header><div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">{user.role === 'super_admin' && <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#D7E8DC] bg-white p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><img src={logoSrc} alt="Current platform logo" className="h-14 w-14 rounded-xl object-cover shadow-sm" /><div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0A5A41]">Platform branding</p><h2 className="font-display text-lg font-bold">Upload a logo</h2><p className="mt-0.5 text-xs text-[#55665C]">Replaces the logo shown on the login screen and sidebar for everyone.</p></div></div><div className="flex items-center gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0E7C5A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0A684B]"><ImagePlus size={15} /> Upload logo<input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /></label><button type="button" onClick={resetLogo} className="inline-flex items-center gap-2 rounded-lg border border-[#DCE2DB] px-3 py-2.5 text-xs font-bold text-[#55665C]"><RotateCcw size={14} /> Reset</button></div></div>}<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0A5A41]">Account administration</p><h1 className="mt-1 font-display text-2xl font-bold">Manage staff access</h1><p className="mt-1 max-w-xl text-sm text-[#55665C]">{canCreateAdmin ? 'Create administrator accounts. Administrators can then create enumerator accounts.' : 'Create and suspend enumerator accounts for your field team.'}</p></div><button type="button" onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0E7C5A] px-4 py-3 text-sm font-bold text-white"><UserPlus size={16} /> Create {canCreateAdmin ? 'admin' : 'enumerator'}</button></div>{message && <p className="mt-5 flex items-center gap-2 rounded-xl bg-[#E3F3EB] p-3 text-sm font-semibold text-[#0A5A41]"><CheckCircle2 size={16} /> {message}</p>}{showForm && <form onSubmit={createAccount} className="mt-5 grid gap-3 rounded-2xl border border-[#D7E8DC] bg-white p-5 sm:grid-cols-3"><Field label="Full name" value={name} onChange={setName} placeholder="e.g. Grace Wambui" /><Field label="Email address" value={email} onChange={setEmail} type="email" placeholder="name@example.com" /><Field label="County (optional)" value={county} onChange={setCounty} placeholder="Kisumu" /><div className="flex items-end sm:col-span-3"><button type="submit" className="w-full rounded-lg bg-[#0E7C5A] px-4 py-3 text-sm font-bold text-white sm:w-auto">Create with PIN 1234</button></div></form>}<section className="mt-6 overflow-hidden rounded-2xl border border-[#E2E6DE] bg-white"><div className="flex items-center gap-2 border-b border-[#E2E6DE] p-5"><Users size={18} className="text-[#0E7C5A]" /><h2 className="font-display text-base font-bold">Created accounts</h2></div>{accounts.length === 0 ? <p className="p-6 text-sm text-[#55665C]">No staff accounts have been created yet.</p> : <div className="divide-y divide-[#E2E6DE]">{accounts.map((account) => <div key={account.accountId} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold">{account.name}</p><p className="mt-1 text-xs text-[#55665C]">{account.email} · {account.role} · Created by {account.createdBy}</p><p className="mt-1 text-xs font-semibold text-[#0A5A41]">{account.mustChangePin ? 'Temporary PIN must be changed on first login' : 'Private PIN set'} · {account.active ? 'Active' : 'Suspended'}</p></div><button type="button" onClick={() => toggle(account.accountId ?? '', account.active)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#DCE2DB] px-3 py-2 text-xs font-bold text-[#55665C]">{account.active ? <><PauseCircle size={15} /> Suspend</> : <><PlayCircle size={15} /> Reactivate</>}</button></div>)}</div>}</section></div></main>;
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) { return <label className="block text-xs font-semibold text-[#3D4D44]">{label}<input required={label !== 'County (optional)'} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} className="mt-1.5 w-full rounded-lg border border-[#DCE2DB] px-3 py-2.5 text-sm outline-none focus:border-[#0E7C5A]" /></label>; }