import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import EarlyWarning from './pages/EarlyWarning';
import GIS from './pages/GIS';
import Surveillance from './pages/Surveillance';
import FieldData from './pages/FieldData';
import Weather from './pages/Weather';
import Login from './pages/Login';
import BaselineSurvey from './pages/BaselineSurvey';
import FarmerDashboard from './pages/FarmerDashboard';
import AccountManagement from './pages/AccountManagement';
import ChangePin from './pages/ChangePin';

type Route = '/' | '/early-warning' | '/gis' | '/surveillance' | '/field-data' | '/weather' | '/accounts';

export type UserRole = 'super_admin' | 'admin' | 'enumerator' | 'farmer';

export interface SessionUser {
  name: string;
  role: UserRole;
  organisation: string;
  county?: string;
  accountId?: string;
  mustChangePin?: boolean;
}

const ROUTE_META: Record<Route, { title: string; subtitle: string }> = {
  '/': { title: 'National Overview', subtitle: 'Malaria risk, weather and field surveillance across Kenya' },
  '/early-warning': { title: 'Early Warning & Alerts', subtitle: 'Configurable risk alerts with recommended public-health action' },
  '/gis': { title: 'GIS Intelligence Map', subtitle: 'County-level risk, weather and surveillance layers' },
  '/surveillance': { title: 'Malaria Surveillance', subtitle: 'Aggregate testing and positivity trends by county' },
  '/field-data': { title: 'Field Data & M&E', subtitle: 'Baseline, endline, indicators and data verification' },
  '/weather': { title: 'Weather & Environment', subtitle: 'Rainfall, temperature and breeding-habitat observations' },
  '/accounts': { title: 'Account Management', subtitle: 'Create, suspend, and reactivate programme accounts' },
};

function getRoute(): Route {
  const hash = window.location.hash.replace('#', '') || '/';
  return (hash in ROUTE_META ? hash : '/') as Route;
}

function App() {
  const [route, setRoute] = useState<Route>(getRoute());
  const [user, setUser] = useState<SessionUser | null>(() => {
    const stored = window.localStorage.getItem('malariawatch-session');
    return stored ? JSON.parse(stored) as SessionUser : null;
  });

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function signIn(nextUser: SessionUser) {
    window.localStorage.setItem('malariawatch-session', JSON.stringify(nextUser));
    setUser(nextUser);
  }

  function signOut() {
    window.localStorage.removeItem('malariawatch-session');
    setUser(null);
  }

  if (!user) return <Login onSignIn={signIn} />;

  if ((user.role === 'enumerator' || user.role === 'admin') && user.mustChangePin) return <ChangePin user={user} onChanged={signIn} onSignOut={signOut} />;
  if (user.role === 'enumerator') return <BaselineSurvey user={user} onSignOut={signOut} />;
  if (user.role === 'farmer') return <FarmerDashboard user={user} onSignOut={signOut} />;
  if (user.role === 'admin') return <AccountManagement user={user} onSignOut={signOut} />;

  const meta = ROUTE_META[route];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F6F7F4] text-[#14201A]">
      <Sidebar currentRoute={route} user={user} onSignOut={signOut} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-7">
          {route === '/' && <Dashboard />}
          {route === '/early-warning' && <EarlyWarning />}
          {route === '/gis' && <GIS />}
          {route === '/surveillance' && <Surveillance />}
          {route === '/field-data' && <FieldData />}
          {route === '/weather' && <Weather />}
          {route === '/accounts' && <AccountManagement user={user} onSignOut={signOut} />}
        </main>
      </div>
    </div>
  );
}

export default App;
