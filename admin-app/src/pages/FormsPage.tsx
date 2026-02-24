import { useEffect, useState } from 'react';
import { formsApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

type Form = { id: string; name?: string; code?: string; fields?: { id: string; label?: string; type?: string }[] };

export function FormsPage() {
  const { token } = useAuth();
  const [list, setList] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<Form | null>(null);
  const [addFieldModal, setAddFieldModal] = useState(false);
  const [fieldForm, setFieldForm] = useState({ label: '', type: 'text', required: true });
  const [fieldSubmitting, setFieldSubmitting] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    formsApi.list(token, { page: 1, limit: 100 }).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: Form[] };
        setList(d.items ?? []);
      } else setError(r.error || 'Failed to load');
    });
  };

  useEffect(() => { load(); }, [token]);

  const openCreate = () => {
    setForm({ name: '', code: '' });
    setModal(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    const res = await formsApi.create(form, token);
    setSubmitting(false);
    if (res.success) { setModal(false); load(); } else setError(res.error || 'Create failed');
  };

  const openDetail = (id: string) => {
    if (!token) return;
    formsApi.getById(id, token).then((r) => {
      if (r.success && r.data) setDetail(r.data as Form);
    });
  };

  const openAddField = () => {
    setFieldForm({ label: '', type: 'text', required: true });
    setAddFieldModal(true);
  };

  const addField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !detail?.id) return;
    setFieldSubmitting(true);
    const res = await formsApi.addField(detail.id, { label: fieldForm.label, type: fieldForm.type, required: fieldForm.required }, token);
    setFieldSubmitting(false);
    if (res.success) { setAddFieldModal(false); openDetail(detail.id); } else setError(res.error || 'Add field failed');
  };

  if (loading) return <div className="loading-wrap">Loading forms…</div>;
  if (error) return <div className="card"><p className="error">{error}</p><button className="btn btn-secondary" onClick={() => setError('')}>Dismiss</button></div>;

  return (
    <div className="page-section">
      <h1>Forms</h1>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openCreate}>Add form</button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Code</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.map((f) => (
              <tr key={f.id}>
                <td>{f.name ?? '—'}</td>
                <td>{f.code ?? '—'}</td>
                <td><button type="button" className="btn btn-secondary" onClick={() => openDetail(f.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No forms.</p>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)} role="presentation">
          <div className="card modal-box" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Add form</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
              </div>
              <div className="toolbar" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="card modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{detail.name ?? 'Form'}</h2>
            <p><strong>Code:</strong> {detail.code ?? '—'}</p>
            <h4>Fields</h4>
            <ul style={{ paddingLeft: '1.25rem' }}>
              {(detail.fields ?? []).map((fld) => (
                <li key={fld.id}>{fld.label ?? fld.id} ({fld.type ?? 'text'})</li>
              ))}
            </ul>
            <button type="button" className="btn btn-primary" onClick={openAddField}>Add field</button>
            <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem' }} onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      )}

      {addFieldModal && detail && (
        <div className="modal-overlay" onClick={() => setAddFieldModal(false)} role="presentation">
          <div className="card modal-box" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Add field</h2>
            <form onSubmit={addField}>
              <div className="form-group">
                <label>Label</label>
                <input value={fieldForm.label} onChange={(e) => setFieldForm((f) => ({ ...f, label: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={fieldForm.type} onChange={(e) => setFieldForm((f) => ({ ...f, type: e.target.value }))}>
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                  <option value="textarea">Textarea</option>
                </select>
              </div>
              <div className="form-group">
                <label><input type="checkbox" checked={fieldForm.required} onChange={(e) => setFieldForm((f) => ({ ...f, required: e.target.checked }))} /> Required</label>
              </div>
              <div className="toolbar" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={fieldSubmitting}>{fieldSubmitting ? 'Adding…' : 'Add'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setAddFieldModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
