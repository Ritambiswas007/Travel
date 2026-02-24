import { useEffect, useState } from 'react';
import { usersApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

export function UsersPage() {
  const { token } = useAuth();
  const [list, setList] = useState<{ id: string; email: string; role?: string; name?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    usersApi.list(token, { page: 1, limit: 50 }).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: typeof list };
        setList(d.items ?? []);
      } else setError(r.error || 'Failed to load');
    });
  }, [token]);

  if (loading) return <p>Loading users…</p>;
  if (error) return <p className="error">{error}</p>;
  return (
    <div>
      <h1>Users (ADMIN)</h1>
      <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Email</th><th>Name</th><th>Role</th></tr>
        </thead>
        <tbody>
          {list.map((u) => (
            <tr key={u.id}>
              <td>{u.id.slice(0, 8)}…</td>
              <td>{u.email}</td>
              <td>{u.name ?? '—'}</td>
              <td>{u.role ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <p>No users.</p>}
    </div>
  );
}
