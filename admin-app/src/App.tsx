import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { PackagesPage } from './pages/PackagesPage';
import { BookingsPage } from './pages/BookingsPage';
import { CitiesPage } from './pages/CitiesPage';
import { StaffPage } from './pages/StaffPage';
import { CouponsPage } from './pages/CouponsPage';
import { BannersPage } from './pages/BannersPage';
import { ReportsPage } from './pages/ReportsPage';
import { LeadsPage } from './pages/LeadsPage';
import { SupportPage } from './pages/SupportPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { FormsPage } from './pages/FormsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <div style={{ padding: '2rem' }}>Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="packages" element={<PackagesPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="cities" element={<CitiesPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="forms" element={<FormsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
