import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const nav = (to: string, label: string) => (
    <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : '')} end={to === '/'}>
      {label}
    </NavLink>
  );

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Portal</h2>
          <span className="role">{user?.role}</span>
        </div>
        <nav>
          {nav('/', 'Dashboard')}
          {nav('/users', 'Users')}
          {nav('/packages', 'Packages')}
          {nav('/cities', 'Cities')}
          {nav('/staff', 'Staff')}
          {nav('/coupons', 'Coupons')}
          {nav('/banners', 'Banners')}
          {nav('/bookings', 'Bookings')}
          {nav('/reports', 'Reports')}
          {nav('/leads', 'Leads')}
          {nav('/support', 'Support')}
          {nav('/documents', 'Documents')}
          {nav('/forms', 'Forms')}
          {nav('/notifications', 'Notifications')}
        </nav>
        <div className="sidebar-footer">
          <span>{user?.email}</span>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
