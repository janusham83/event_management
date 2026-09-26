import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from './api';
import './App.css';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FunctionPage from './pages/FunctionPage';
import ParticipantPage from './pages/ParticipantPage';
import RegistrationPage from './pages/RegistrationPage';
import AttendanceScanPage from './pages/AttendanceScanPage';
import PhotoShootScanPage from './pages/PhotoShootScanPage';
import PaymentScanPage from './pages/PaymentScanPage';
import ReportsPage from './pages/ReportsPage';
import ParticipantDetailPage from './pages/ParticipantDetailPage';
import PublicTicketPage from './pages/PublicTicketPage';

const navigation = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2' },
  { path: '/functions', label: 'Functions', icon: 'bi bi-calendar-event', adminOnly: true },
  { path: '/participants', label: 'Participants', icon: 'bi bi-people' },
  { path: '/attendance/scan', label: 'Attendance', icon: 'bi bi-qr-code-scan' },
  { path: '/photo-shoot/scan', label: 'Photo Shoot', icon: 'bi bi-camera' },
  { path: '/payment/scan', label: 'Tickets', icon: 'bi bi-ticket-detailed' },
  { path: '/reports', label: 'Reports', icon: 'bi bi-bar-chart' },
  { path: '/register', label: 'Register', icon: 'bi bi-person-plus' },
];

function AppShell({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <div className="brand-wrap">
          {user?.function_event?.logo_url ? <img className="function-logo" src={user.function_event.logo_url} alt="Function logo" /> : <div className="brand-mark">E</div>}
          <div>
            <div className="brand-name">{user?.function_event?.name || 'EventFlow'}</div>
            <small className="text-muted">{user?.role === 'organizer' ? 'Organizer' : 'Admin Panel'}</small>
          </div>
        </div>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}>
          <i className={`bi ${menuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
      </header>

      <aside className={`sidebar ${menuOpen ? 'menu-open' : ''}`}>
        <div className="brand-wrap">
          {user?.function_event?.logo_url ? <img className="function-logo" src={user.function_event.logo_url} alt="Function logo" /> : <div className="brand-mark">E</div>}
          <div>
            <div className="brand-name">{user?.function_event?.name || 'EventFlow'}</div>
            <small className="text-muted">{user?.role === 'organizer' ? 'Organizer' : 'Admin Panel'}</small>
          </div>
        </div>

        <nav className="nav-menu" id="main-navigation">
          {navigation.filter((item) => !item.adminOnly || user?.role === 'admin').map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="user-panel">
          <div className="user-badge">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
          <div>
            <div className="fw-semibold">{user?.name || 'Administrator'}</div>
            <small className="text-muted">{user?.role || 'staff'}</small>
          </div>
          {user?.role === 'organizer' && user?.function_event && (
            <div className="assigned-function">
              <div className="assigned-function-label">Assigned Function</div>
              <div className="assigned-function-name">{user.function_event.name}</div>
              <div><i className="bi bi-calendar3 me-2"></i>{formatFunctionDate(user.function_event.date)}</div>
              <div><i className="bi bi-clock me-2"></i>{formatFunctionTime(user.function_event.start_time)} - {formatFunctionTime(user.function_event.end_time)}</div>
              <div><i className="bi bi-geo-alt me-2"></i>{user.function_event.venue}</div>
            </div>
          )}
          <button className="btn btn-sm btn-outline-secondary w-100 mt-3" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-panel">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage onUnauthorized={onLogout} user={user} />} />
          <Route path="/functions" element={<FunctionPage canManage={user?.role === 'admin'} />} />
          <Route path="/participants" element={<ParticipantPage user={user} />} />
          <Route path="/participants/:id" element={<ParticipantDetailPage />} />
          <Route path="/ticket/:token" element={<PublicTicketPage />} />
          <Route path="/register" element={<RegistrationPage user={user} />} />
          <Route path="/attendance/scan" element={<AttendanceScanPage user={user} />} />
          <Route path="/photo-shoot/scan" element={<PhotoShootScanPage user={user} />} />
          <Route path="/payment/scan" element={<PaymentScanPage user={user} />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('event_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (!localStorage.getItem('event_token')) return;

    api.get('/user')
      .then((response) => {
        localStorage.setItem('event_user', JSON.stringify(response.data));
        setUser(response.data);
      })
      .catch(() => {
        localStorage.removeItem('event_token');
        localStorage.removeItem('event_user');
        setUser(null);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('event_token');
    localStorage.removeItem('event_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      {user ? <AppShell user={user} onLogout={handleLogout} /> : (
        <Routes>
          <Route path="/ticket/:token" element={<PublicTicketPage />} />
          <Route path="*" element={<LoginPage onLoginSuccess={setUser} />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

function formatFunctionDate(value) {
  if (!value) return 'Date not set';
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatFunctionTime(value) {
  return value ? value.slice(0, 5) : '--:--';
}

export default App;
