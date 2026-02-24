import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { packagesApi } from '../api/endpoints';

type Pkg = { id: string; name?: string; slug?: string; isActive?: boolean };

export function PackagesPage() {
  const [list, setList] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    packagesApi.list({ page: 1, limit: 50 }).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: Pkg[] };
        setList(d.items ?? []);
      } else setError(r.error || 'Failed to load');
    });
  }, []);

  if (loading) return <p>Loading packages…</p>;
  if (error) return <p className="error">{error}</p>;
  return (
    <div>
      <h1>Packages</h1>
      <table className="data-table">
        <thead>
          <tr><th>Name</th><th>Slug</th><th>Active</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id}>
              <td>{p.name ?? '—'}</td>
              <td>{p.slug ?? '—'}</td>
              <td>{p.isActive ? 'Yes' : 'No'}</td>
              <td><Link to={`/packages/${p.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
      {list.length === 0 && <p>No packages.</p>}
    </div>
  );
}
