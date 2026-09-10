import { useState } from 'react';
import { ChevronRight, KeyRound, LockKeyhole, Shield, Sparkles, UserRound } from 'lucide-react';
import type { SessionUser, UserRole } from '../App';

type StaffAccount = SessionUser & { email: string; pin: string; createdBy: string; active: boolean };

const SUPER_ADMIN: StaffAccount = {
  accountId: 'super-admin',
  name: 'SIR LORDPHICK',
  role: 'super_admin',
  organisation: 'MalariaWatch Platform',
  email: 'sirlordphick@gmail.com',
  pin: 'Lord9632@@',
  createdBy: 'system',
  active: true,
};

const STAFF_KEY = 'malariawatch-staff-accounts';
const FARMER_KEY = 'malariawatch-farmer-accounts';

function readAccounts(): StaffAccount[] {
  const saved = window.localStorage.getItem(STAFF_KEY);
  return saved ? JSON.parse(saved) as StaffAccount[] : [];
}

export function saveStaffAccount(account: StaffAccount) {
  const accounts = readAccounts().filter((item) => item.accountId !== account.accountId);
  window.localStorage.setItem(STAFF_KEY, JSON.stringify([...accounts, account]));
}

export function getStaffAccounts() { return readAccounts(); }

export function suspendStaffAccount(accountId: string) {
  const account = readAccounts().find((item) => item.accountId === accountId);
  if (account) saveStaffAccount({ ...account, active: false });
}

export function activateStaffAccount(accountId: string) {
  const account = readAccounts().find((item) => item.accountId === accountId);
  if (account) saveStaffAccount({ ...account, active: true });
}

export function updateStaffPin(accountId: string, pin: string) {
  const account = readAccounts().find((item) => item.accountId === accountId);
  if (account) saveStaffAccount({ ...account, pin, mustChangePin: false });
}

export default function Login({ onSignIn }: { onSignIn: (user: SessionUser) => void }) {
  const [role, setRole] = useState<UserRole>('farmer');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [error, setError] = useState('');

  function selectRole(nextRole: UserRole) {
    setRole(nextRole);
    setMode(nextRole === 'farmer' ? 'login' : 'login');
    setEmail('');
    setPin('');
    setError('');
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (role === 'farmer' && mode === 'signup') {
      if (!name.trim() || !phone.trim() || !county || !email.trim() || pin.length < 4) {
        setError('Complete all fields and use a PIN or password of at least 4 characters.');
        return;
      }
      const farmer: SessionUser = {
        accountId: `farmer-${Date.now()}`,
        name: name.trim(),
        role: 'farmer',
        organisation: 'MalariaWatch Farmer Network',
        county,
      };
      const farmers = JSON.parse(window.localStorage.getItem(FARMER_KEY) ?? '[]') as Array<SessionUser & { email: string }>;
      if (farmers.some((item) => item.email.toLowerCase() === email.trim().toLowerCase())) {
        setError('An account with this email already exists. Log in instead.');
        return;
      }
      window.localStorage.setItem(FARMER_KEY, JSON.stringify([...farmers, { ...farmer, email: email.trim().toLowerCase(), pin, phone, active: true }]));
      onSignIn(farmer);
      return;
    }

    if (role === 'farmer') {
      const farmers = JSON.parse(window.localStorage.getItem(FARMER_KEY) ?? '[]') as Array<SessionUser & { email: string; pin: string; active: boolean }>;
      const farmer = farmers.find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.pin === pin && item.active);
      if (!farmer) {
        setError('Farmer account not found, inactive, or credentials are incorrect.');
        return;
      }
      onSignIn(farmer);
      return;
    }

    // Programme login also accepts admin and super-admin credentials.
    const account = [SUPER_ADMIN, ...readAccounts()].find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.pin === pin && item.active);
    if (!account) {
      setError('Account not found, inactive, or credentials are incorrect.');
      return;
    }
    onSignIn(account);
  }

  const farmerSignup = role === 'farmer' && mode === 'signup';
  return (
    <main className="min-h-screen overflow-y-auto bg-[#092318] px-3 py-6 text-[#14201A] sm:px-4 sm:py-16">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[860px] flex-col items-center justify-center">
        <div className="mb-5 text-center sm:mb-7">
          <img src="/malariawatch-logo.svg" alt="MalariaWatch logo" className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-lg sm:h-24 sm:w-24" />
          <h1 className="mt-3 font-display text-[22px] font-extrabold text-white sm:mt-4 sm:text-[23px]">MalariaWatch</h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-[12px] text-[#9EB7A9] sm:text-[13px]"><Sparkles size={13} /> Kenya malaria and climate intelligence</p>
        </div>

        <section className="w-full max-w-[620px] rounded-[18px] bg-white p-4 shadow-2xl sm:rounded-[20px] sm:p-8">
          <div className="mb-6 grid grid-cols-2 rounded-full bg-[#EFF0F2] p-1">
            {(['farmer', 'enumerator'] as const).map((item) => (
              <button key={item} type="button" onClick={() => selectRole(item)} className={`rounded-full px-2 py-2.5 text-xs font-semibold ${role === item ? 'bg-white text-[#14201A] shadow-sm' : 'text-[#55665C]'}`}>
                {item === 'farmer' ? 'Farmer' : 'Enumerator'}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <h2 className="font-display text-[19px] font-bold">{farmerSignup ? 'Create your farmer account' : role === 'enumerator' ? 'Enumerator login' : 'Farmer login'}</h2>
            <p className="mt-1 text-[13px] leading-5 text-[#55665C]">{role === 'enumerator' ? 'Use the credentials provided by your programme administrator. Staff accounts go directly to the dashboard.' : 'Receive local malaria, weather, and surveillance warnings for your county.'}</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {farmerSignup && <>
              <Field label="Full name" value={name} onChange={setName} placeholder="e.g. Grace Wambui" />
              <Field label="Phone number" value={phone} onChange={setPhone} placeholder="07XX XXX XXX" type="tel" />
              <label className="block text-xs font-semibold text-[#3D4D44]">County
                <select required value={county} onChange={(event) => setCounty(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#DCE2DB] bg-white px-3 py-2.5 text-[13px]"><option value="">Select county</option>{['Homa Bay', 'Kisumu', 'Siaya', 'Busia', 'Migori', 'Kisii', 'Kakamega', 'Bungoma'].map((item) => <option key={item}>{item}</option>)}</select>
              </label>
            </>}
            <Field label="Email address" value={email} onChange={setEmail} type="email" icon={<UserRound size={16} />} />
            <Field label="Password or PIN" value={pin} onChange={setPin} type="password" icon={<LockKeyhole size={16} />} />
            {error && <p className="text-xs font-medium text-[#B23434]">{error}</p>}
            <button type="submit" className="w-full rounded-lg bg-[#0E7C5A] px-4 py-3 text-[13px] font-bold text-white hover:bg-[#0A684B]">{farmerSignup ? 'Create farmer account' : 'Log in'} <ChevronRight size={15} className="ml-1 inline" /></button>
          </form>

          {role === 'farmer' && <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="mt-5 w-full text-center text-xs font-bold text-[#0A5A41]">{mode === 'login' ? 'New farmer? Create an account' : 'Already registered? Log in'}</button>}
          {role === 'enumerator' && <p className="mt-5 rounded-xl border border-dashed border-[#BFD7C8] bg-[#F3FAF5] p-4 text-xs leading-5 text-[#55665C]"><KeyRound size={14} className="mr-1 inline text-[#0E7C5A]" /> Enumerators receive a temporary PIN from their administrator and must change it after login.</p>}
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', icon }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; icon?: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-[#3D4D44]">{label}<div className="mt-1.5 flex items-center gap-2 rounded-lg border border-[#DCE2DB] px-3 py-2.5 focus-within:border-[#0E7C5A]">{icon}<input required value={value} onChange={(event) => onChange(event.target.value)} type={type} placeholder={placeholder} className="w-full bg-transparent text-[13px] outline-none" /></div></label>;
}
