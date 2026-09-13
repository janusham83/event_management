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
import TicketPage from './pages/TicketPage';
import ReportsPage from './pages/ReportsPage';
import ParticipantDetailPage from './pages/ParticipantDetailPage';

const navigation = [
  { path: '/dashboard', label: 'Dashboard', icon: 'bi bi-speedometer2' },
  { path: '/functions', label: 'Functions', icon: 'bi bi-calendar-event', adminOnly: true },
  { path: '/participants', label: 'Participants', icon: 'bi bi-people' },
  { path: '/attendance/scan', label: 'Attendance', icon: 'bi bi-qr-code-scan' },
  { path: '/photo-shoot/scan', label: 'Photo Shoot', icon: 'bi bi-camera' },
  { path: '/tickets', label: 'Tickets', icon: 'bi bi-ticket-detailed' },
  { path: '/reports', label: 'Reports', icon: 'bi bi-bar-chart' },
  { path: '/register', label: 'Register', icon: 'bi bi-person-plus' },
];

function AppShell({ user, onLogout }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          {user?.function_event?.logo_url ? <img className="function-logo" src={user.function_event.logo_url} alt="Function logo" /> : <div className="brand-mark">E</div>}
          <div>
            <div className="brand-name">{user?.function_event?.name || 'EventFlow'}</div>
            <small className="text-muted">{user?.role === 'organizer' ? 'Organizer' : 'Admin Panel'}</small>
          </div>
        </div>

        <nav className="nav-menu">
          {navigation.filter((item) => !item.adminOnly || user?.role === 'admin').map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
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
          <button className="btn btn-sm btn-outline-secondary w-100 mt-3" onClick={onLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-panel">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage onUnauthorized={onLogout} user={user} />} />
          <Route path="/functions" element={<FunctionPage canManage={user?.role === 'admin'} />} />
          <Route path="/participants" element={<ParticipantPage />} />
          <Route path="/participants/:id" element={<ParticipantDetailPage />} />
          <Route path="/register" element={<RegistrationPage user={user} />} />
          <Route path="/attendance/scan" element={<AttendanceScanPage />} />
          <Route path="/photo-shoot/scan" element={<PhotoShootScanPage />} />
          <Route path="/tickets" element={<TicketPage user={user} />} />
          <Route path="/tickets/new" element={<TicketPage user={user} />} />
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

  if (!user) {
    return <LoginPage onLoginSuccess={setUser} />;
  }

  return (
    <BrowserRouter>
      <AppShell user={user} onLogout={handleLogout} />
    </BrowserRouter>
  );
}

export default App;
