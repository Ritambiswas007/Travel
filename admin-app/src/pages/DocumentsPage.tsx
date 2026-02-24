import { useEffect, useState } from 'react';
import { documentsApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

type DocType = { id: string; name?: string; code?: string; description?: string };

export function DocumentsPage() {
  const { token } = useAuth();
  const [types, setTypes] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [statusForm, setStatusForm] = useState({ documentId: '', status: 'APPROVED' });
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const load = () => {
    documentsApi.listTypes(token ?? undefined).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const raw = r.data;
        setTypes(Array.isArray(raw) ? raw : (raw as { items?: DocType[] }).items ?? []);
      } else setError(r.error || 'Failed to load');
    });
  };

  useEffect(() => { load(); }, [token]);

  const openCreate = () => { setForm({ name: '', code: '', description: '' }); setModal(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    const res = await documentsApi.createType(form, token);
    setSubmitting(false);
    if (res.success) { setModal(false); load(); } else setError(res.error || 'Create failed');
  };

  const updateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !statusForm.documentId.trim()) return;
    setStatusSubmitting(true);
    const res = await documentsApi.updateDocumentStatus(statusForm.documentId, { status: statusForm.status }, token);
    setStatusSubmitting(false);
    if (res.success) setStatusForm((f) => ({ ...f, documentId: '' })); else setError(res.error || 'Update failed');
  };

  if (loading) return <div className="loading-wrap">Loading document types…</div>;
  if (error) return <div className="card"><p className="error">{error}</p><button className="btn btn-secondary" onClick={() => setError('')}>Dismiss</button></div>;

  return (
    <div className="page-section">
      <h1>Documents</h1>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openCreate}>Add document type</button>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Document types</h3>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Code</th><th>Description</th></tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id}>
                <td>{t.name ?? '—'}</td>
                <td>{t.code ?? '—'}</td>
                <td>{(t as { description?: string }).description ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {types.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No document types.</p>}
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Update document status</h3>
        <form onSubmit={updateStatus} className="form-row">
          <div className="form-group">
            <label>Document ID</label>
            <input value={statusForm.documentId} onChange={(e) => setStatusForm((f) => ({ ...f, documentId: e.target.value }))} placeholder="UUID" />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={statusForm.status} onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div className="form-group" style={{ alignSelf: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={statusSubmitting}>{statusSubmitting ? 'Updating…' : 'Update'}</button>
          </div>
        </form>
      </div>
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)} role="presentation">
          <div className="card modal-box" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Add document type</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="toolbar" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
