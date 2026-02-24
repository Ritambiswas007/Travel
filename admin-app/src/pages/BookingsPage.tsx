import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

type Booking = { id: string; status?: string; createdAt?: string; totalAmount?: number };

export function BookingsPage() {
  const { token } = useAuth();
  const [list, setList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    bookingsApi.listAll(token, { page: 1, limit: 50 }).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: Booking[] };
        setList(d.items ?? []);
      } else setError(r.error || 'Failed to load');
    });
  }, [token]);

  if (loading) return <p>Loading bookings…</p>;
  if (error) return <p className="error">{error}</p>;
  return (
    <div>
      <h1>Bookings (STAFF)</h1>
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Status</th><th>Amount</th><th>Created</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {list.map((b) => (
            <tr key={b.id}>
              <td>{b.id.slice(0, 8)}…</td>
              <td>{b.status ?? '—'}</td>
              <td>{b.totalAmount != null ? b.totalAmount : '—'}</td>
              <td>{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}</td>
              <td><Link to={`/bookings/${b.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <p>No bookings.</p>}
    </div>
  );
}
