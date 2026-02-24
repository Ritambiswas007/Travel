import { useEffect, useState } from 'react';
import { packagesApi, bookingsApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import './DashboardPage.css';

export function DashboardPage() {
  const { token } = useAuth();
  const [packagesCount, setPackagesCount] = useState<number | null>(null);
  const [bookingsCount, setBookingsCount] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    packagesApi.list({ limit: 1 }).then((r) => {
      if (r.success && r.data) setPackagesCount((r.data as { total?: number }).total ?? 0);
    });
    bookingsApi.listAll(token, { limit: 1 }).then((r) => {
      if (r.success && r.data) {
        const d = r.data as { items?: unknown[]; total?: number };
        setBookingsCount(d.total ?? (d.items?.length ?? 0));
      }
    });
  }, [token]);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="cards">
        <div className="card">
          <span className="label">Packages</span>
          <span className="value">{packagesCount ?? '…'}</span>
        </div>
        <div className="card">
          <span className="label">Bookings (total)</span>
          <span className="value">{bookingsCount ?? '…'}</span>
        </div>
      </div>
    </div>
  );
}
