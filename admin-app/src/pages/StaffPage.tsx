import { useEffect, useState } from 'react';
import { staffApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

type Staff = { id: string; userId?: string; name?: string; department?: string; user?: { email?: string } };

export function StaffPage() {
  const { token } = useAuth();
  const [list, setList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'create' | null>(null);
  const [detail, setDetail] = useState<Staff | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [editForm, setEditForm] = useState({ name: '', department: '' });
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    staffApi.list(token, { page: 1, limit: 100 }).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: Staff[] };
        setList(d.items ?? (Array.isArray(r.data) ? r.data : []));
      } else setError(r.error || 'Failed to load');
    });
  };

  useEffect(() => { load(); }, [token]);

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', department: '' });
    setModal('create');
  };
  const closeModal = () => setModal(null);

  const openDetail = (id: string) => {
    if (!token) return;
    staffApi.getById(id, token).then((r) => {
      if (r.success && r.data) {
        const s = r.data as Staff;
        setDetail(s);
        setEditForm({ name: s.name ?? '', department: s.department ?? '' });
      }
    });
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !detail) return;
    setUpdating(true);
    const res = await staffApi.update(detail.id, { name: editForm.name, department: editForm.department }, token);
    setUpdating(false);
    if (res.success) { setDetail((d) => (d ? { ...d, ...editForm } : null)); load(); } else setError(res.error || 'Update failed');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    const res = await staffApi.create({ name: form.name, email: form.email, password: form.password, department: form.department }, token);
    setSubmitting(false);
    if (res.success) { closeModal(); load(); } else setError(res.error || 'Create failed');
  };

  if (loading) return <div className="loading-wrap">Loading staff…</div>;
  if (error) return <div className="card"><p className="error">{error}</p><button className="btn btn-secondary" onClick={() => setError('')}>Dismiss</button></div>;

  return (
    <div className="page-section">
      <h1>Staff</h1>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openCreate}>Add staff</button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Department</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>{s.name ?? '—'}</td>
                <td>{s.user?.email ?? '—'}</td>
                <td>{s.department ?? '—'}</td>
                <td>
                  <button type="button" className="btn btn-secondary" onClick={() => openDetail(s.id)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No staff.</p>}
      </div>

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="card modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2 style={{ marginTop: 0 }}>Staff details</h2>
            <p><strong>Name:</strong> {detail.name ?? '—'}</p>
            <p><strong>Email:</strong> {detail.user?.email ?? '—'}</p>
            <p><strong>Department:</strong> {detail.department ?? '—'}</p>
            <form onSubmit={submitEdit}>
              <div className="form-group">
                <label>Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input value={editForm.department} onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={updating}>{updating ? 'Updating…' : 'Update'}</button>
            </form>
            <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem', marginTop: '0.5rem' }} onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      )}

      {modal === 'create' && (
        <div className="modal-overlay" onClick={closeModal} role="presentation">
          <div className="card modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2 style={{ marginTop: 0 }}>Add staff</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
              </div>
              <div className="toolbar" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</button>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
