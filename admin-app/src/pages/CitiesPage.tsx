import { useEffect, useState } from 'react';
import { citiesApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

type City = { id: string; name: string; slug?: string; country?: string; isActive?: boolean };

export function CitiesPage() {
  const { token } = useAuth();
  const [list, setList] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<City | null>(null);
  const [form, setForm] = useState({ name: '', country: 'India', description: '', imageUrl: '', sortOrder: 0 });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    citiesApi.list({ page: 1, limit: 100 }).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: City[]; total?: number };
        setList(d.items ?? []);
      } else setError(r.error || 'Failed to load');
    });
  };

  useEffect(() => { load(); }, [token]);

  const openCreate = () => {
    setForm({ name: '', country: 'India', description: '', imageUrl: '', sortOrder: 0 });
    setEditing(null);
    setModal('create');
  };
  const openEdit = (c: City) => {
    setEditing(c);
    setForm({
      name: (c as { name?: string }).name ?? '',
      country: (c as { country?: string }).country ?? 'India',
      description: (c as { description?: string }).description ?? '',
      imageUrl: (c as { imageUrl?: string }).imageUrl ?? '',
      sortOrder: (c as { sortOrder?: number }).sortOrder ?? 0,
    });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      if (modal === 'create') {
        const res = await citiesApi.create(form, token);
        if (res.success) { closeModal(); load(); } else setError(res.error || 'Create failed');
      } else if (editing) {
        const res = await citiesApi.update(editing.id, form, token);
        if (res.success) { closeModal(); load(); } else setError(res.error || 'Update failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!token || !confirm('Delete this city?')) return;
    const res = await citiesApi.delete(id, token);
    if (res.success) load(); else setError(res.error || 'Delete failed');
  };

  if (loading) return <div className="loading-wrap">Loading cities…</div>;
  if (error) return <div className="card"><p className="error">{error}</p><button className="btn btn-secondary" onClick={() => setError('')}>Dismiss</button></div>;

  return (
    <div className="page-section">
      <h1>Cities</h1>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openCreate}>Add city</button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Slug</th><th>Country</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug ?? '—'}</td>
                <td>{(c as { country?: string }).country ?? '—'}</td>
                <td>{c.isActive !== false ? 'Yes' : 'No'}</td>
                <td>
                  <div className="actions">
                    <button type="button" className="btn btn-secondary" onClick={() => openEdit(c)}>Edit</button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(c.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No cities.</p>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal} role="presentation">
          <div className="card modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2 style={{ marginTop: 0 }}>{modal === 'create' ? 'Add city' : 'Edit city'}</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Sort order</label>
                <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))} />
              </div>
              <div className="toolbar" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
