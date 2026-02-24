import { useEffect, useState } from 'react';
import { bannersApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

type Banner = { id: string; title?: string; imageUrl?: string; linkUrl?: string; position?: string; sortOrder?: number; isActive?: boolean };

export function BannersPage() {
  const { token } = useAuth();
  const [list, setList] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_TOP', sortOrder: 0 });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    bannersApi.listAll(token, { page: 1, limit: 100 }).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: Banner[] };
        setList(d.items ?? []);
      } else setError(r.error || 'Failed to load');
    });
  };

  useEffect(() => { load(); }, [token]);

  const openCreate = () => {
    setForm({ title: '', imageUrl: '', linkUrl: '', position: 'HOME_TOP', sortOrder: 0 });
    setEditing(null);
    setModal('create');
  };
  const openEdit = (b: Banner) => {
    setEditing(b);
    setForm({
      title: b.title ?? '',
      imageUrl: b.imageUrl ?? '',
      linkUrl: (b as { linkUrl?: string }).linkUrl ?? '',
      position: (b as { position?: string }).position ?? 'HOME_TOP',
      sortOrder: b.sortOrder ?? 0,
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
        const res = await bannersApi.create(form, token);
        if (res.success) { closeModal(); load(); } else setError(res.error || 'Create failed');
      } else if (editing) {
        const res = await bannersApi.update(editing.id, form, token);
        if (res.success) { closeModal(); load(); } else setError(res.error || 'Update failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    if (!token || !confirm('Delete this banner?')) return;
    const res = await bannersApi.delete(id, token);
    if (res.success) load(); else setError(res.error || 'Delete failed');
  };

  if (loading) return <div className="loading-wrap">Loading banners…</div>;
  if (error) return <div className="card"><p className="error">{error}</p><button className="btn btn-secondary" onClick={() => setError('')}>Dismiss</button></div>;

  return (
    <div className="page-section">
      <h1>Banners</h1>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openCreate}>Add banner</button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Title</th><th>Position</th><th>Order</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id}>
                <td>{b.title ?? '—'}</td>
                <td>{(b as { position?: string }).position ?? '—'}</td>
                <td>{b.sortOrder ?? 0}</td>
                <td>{(b as { isActive?: boolean }).isActive !== false ? 'Yes' : 'No'}</td>
                <td>
                  <div className="actions">
                    <button type="button" className="btn btn-secondary" onClick={() => openEdit(b)}>Edit</button>
                    <button type="button" className="btn btn-danger" onClick={() => remove(b.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No banners.</p>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal} role="presentation">
          <div className="card modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <h2 style={{ marginTop: 0 }}>{modal === 'create' ? 'Add banner' : 'Edit banner'}</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Title</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Link URL</label>
                <input value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Position</label>
                  <select value={form.position} onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}>
                    <option value="HOME_TOP">HOME_TOP</option>
                    <option value="HOME_MID">HOME_MID</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sort order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) || 0 }))} />
                </div>
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
