import { useEffect, useState } from 'react';
import { CheckCircle2, ImagePlus, LogOut, PauseCircle, PlayCircle, RotateCcw, Trash2, UserPlus, Users } from 'lucide-react';
import type { SessionUser } from '../App';
import { createStaffAccount, deleteStaffAccount, getStaffAccounts, setStaffAccountStatus, type StaffAccount } from '../lib/api';
import { DEFAULT_LOGO, getStoredLogo, setStoredLogo } from '../lib/logo';

export default function AccountManagement({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [county, setCounty] = useState('');
  const [message, setMessage] = useState('');
  const [logoSrc, setLogoSrc] = useState(getStoredLogo());
  const isSuperAdmin = user.role === 'super_admin';
  const accountRole = isSuperAdmin ? 'admin' : 'enumerator';

  async function refresh() {
    try {
      setAccounts(await getStaffAccounts());
    } catch {
      setMessage('Could not load staff accounts. Check the connection and try again.');
    }
  }

  useEffect(() => { void refresh(); }, []);

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

  async function createAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    try {
      await createStaffAccount({
        name: name.trim(),
        email: email.trim(),
        role: accountRole,
        organisation: isSuperAdmin ? 'MalariaWatch Administration' : 'MalariaWatch Field Team',
        county: county || undefined,
        createdBy: user.accountId,
      });
      await refresh();
      setName('');
      setEmail('');
      setCounty('');
      setShowForm(false);
      setMessage(`${accountRole === 'admin' ? 'Admin' : 'Enumerator'} account created in the database. Temporary PIN: 1234.`);
    } catch {
      setMessage('Could not create the account. The email may already be in use.');
    }
  }

  async function toggle(account: StaffAccount) {
    try {
      await setStaffAccountStatus(account.accountId!, !account.active, user.accountId, user.role);
      await refresh();
      setMessage(`${account.name}'s account has been ${account.active ? 'suspended' : 'reactivated'}.`);
    } catch {
      setMessage('Could not update the staff account. Please try again.');
    }
  }

  async function remove(account: StaffAccount) {
    if (!account.accountId || !window.confirm(`Delete ${account.name}'s account permanently? This cannot be undone.`)) return;
    try {
      await deleteStaffAccount(account.accountId, user.accountId, user.role);
      await refresh();
      setMessage(`${account.name}'s account was deleted from the database.`);
    } catch {
      setMessage('Could not delete the staff account. You may not have permission.');
    }
  }

  const visibleAccounts = accounts.filter((account) => isSuperAdmin || account.role === 'enumerator');

  return (
    <main className="min-h-screen bg-[#F6F7F4] text-[#14201A]">
      <header className="sticky top-0 z-10 border-b border-[#DDE5DE] bg-white px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div><p className="font-display text-base font-bold">MalariaWatch Access</p><p className="text-xs text-[#55665C]">{isSuperAdmin ? 'Super admin' : 'Administrator'} · {user.name}</p></div>
          <button type="button" onClick={onSignOut} className="inline-flex items-center gap-2 rounded-lg border border-[#DCE2DB] px-3 py-2 text-xs font-bold text-[#55665C]"><LogOut size={14} /> Log out</button>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        {isSuperAdmin && <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-[#D7E8DC] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><img src={logoSrc} alt="Current platform logo" className="h-14 w-14 rounded-xl object-cover shadow-sm" /><div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0A5A41]">Platform branding</p><h2 className="font-display text-lg font-bold">Upload a logo</h2><p className="mt-0.5 text-xs text-[#55665C]">Shown on the login screen and staff sidebar.</p></div></div>
          <div className="flex gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0E7C5A] px-4 py-2.5 text-xs font-bold text-white"><ImagePlus size={15} /> Upload logo<input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /></label><button type="button" onClick={() => { setStoredLogo(null); setLogoSrc(DEFAULT_LOGO); }} className="inline-flex items-center gap-2 rounded-lg border border-[#DCE2DB] px-3 py-2.5 text-xs font-bold text-[#55665C]"><RotateCcw size={14} /> Reset</button></div>
        </section>}

        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0A5A41]">Account administration</p><h1 className="mt-1 font-display text-2xl font-bold">Manage staff access</h1><p className="mt-1 max-w-xl text-sm text-[#55665C]">{isSuperAdmin ? 'Create or manage administrator and enumerator accounts.' : 'Create, suspend, reactivate, or delete enumerator accounts for your field team.'}</p></div>
          <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0E7C5A] px-4 py-3 text-sm font-bold text-white"><UserPlus size={16} /> Create {accountRole}</button>
        </section>

        {message && <p className="mt-5 flex items-center gap-2 rounded-xl bg-[#E3F3EB] p-3 text-sm font-semibold text-[#0A5A41]"><CheckCircle2 size={16} /> {message}</p>}

        {showForm && <form onSubmit={createAccount} className="mt-5 grid gap-3 rounded-2xl border border-[#D7E8DC] bg-white p-5 sm:grid-cols-3">
          <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Grace Wambui" />
          <Field label="Email address" value={email} onChange={setEmail} type="email" placeholder="name@example.com" />
          <Field label="County (optional)" value={county} onChange={setCounty} placeholder="e.g. Kisumu" />
          <div className="sm:col-span-3"><button type="submit" className="rounded-lg bg-[#0E7C5A] px-4 py-2.5 text-sm font-bold text-white">Create {accountRole}</button></div>
        </form>}

        <section className="mt-6 overflow-x-auto rounded-2xl border border-[#E2E6DE] bg-white p-5">
          <div className="mb-4 flex items-center gap-2"><Users size={17} className="text-[#0A5A41]" /><h2 className="font-display text-lg font-bold">Staff accounts</h2></div>
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead><tr className="border-b border-[#E2E6DE] text-[#55665C]"><th className="pb-3 font-medium">Name</th><th className="pb-3 font-medium">Role</th><th className="pb-3 font-medium">County</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Actions</th></tr></thead>
            <tbody>{visibleAccounts.map((account) => <tr key={account.accountId} className="border-b border-[#E2E6DE] last:border-0"><td className="py-3"><p className="font-semibold">{account.name}</p><p className="text-xs text-[#55665C]">{account.email}</p></td><td className="py-3 capitalize">{account.role.replace('_', ' ')}</td><td className="py-3 text-[#55665C]">{account.county ?? 'All counties'}</td><td className="py-3"><span className={account.active ? 'font-semibold text-[#0A5A41]' : 'font-semibold text-[#B23434]'}>{account.active ? 'Active' : 'Suspended'}</span></td><td className="py-3"><div className="flex gap-2"><button type="button" onClick={() => void toggle(account)} className="inline-flex items-center gap-1 rounded-lg border border-[#DCE2DB] px-2.5 py-1.5 text-xs font-bold text-[#55665C]">{account.active ? <><PauseCircle size={14} /> Suspend</> : <><PlayCircle size={14} /> Reactivate</>}</button><button type="button" onClick={() => void remove(account)} className="inline-flex items-center gap-1 rounded-lg border border-[#F0D5D0] px-2.5 py-1.5 text-xs font-bold text-[#B23434]"><Trash2 size={14} /> Delete</button></div></td></tr>)}</tbody>
          </table>
          {visibleAccounts.length === 0 && <p className="py-6 text-center text-sm text-[#55665C]">No staff accounts have been created yet.</p>}
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string }) {
  return <label className="block text-xs font-semibold text-[#3D4D44]">{label}<input required={label !== 'County (optional)'} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} className="mt-1.5 w-full rounded-lg border border-[#DCE2DB] px-3 py-2.5 text-sm outline-none focus:border-[#0E7C5A]" /></label>;
}
