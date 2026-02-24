import { useEffect, useState } from 'react';
import { couponsApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

type Coupon = { id: string; code?: string; discountType?: string; discountValue?: number; minAmount?: number; maxUses?: number; usedCount?: number; isActive?: boolean; validFrom?: string; validTo?: string };

export function CouponsPage() {
  const { token } = useAuth();
  const [list, setList] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: '', discountType: 'PERCENT', discountValue: 10, minAmount: 0, maxUses: 100, validFrom: '', validTo: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    couponsApi.list(token, { page: 1, limit: 100 }).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: Coupon[] };
        setList(d.items ?? []);
      } else setError(r.error || 'Failed to load');
    });
  };

  useEffect(() => { load(); }, [token]);

  const openCreate = () => {
    setForm({ code: '', discountType: 'PERCENT', discountValue: 10, minAmount: 0, maxUses: 100, validFrom: '', validTo: '' });
    setEditing(null);
    setModal('create');
  };
  const openEdit = (c: Coupon) => {
    setEditing(c);
    const vFrom = (c as { validFrom?: string }).validFrom;
    const vTo = (c as { validTo?: string }).validTo;
    setForm({
      code: c.code ?? '',
      discountType: (c.discountType as string) ?? 'PERCENT',
      discountValue: Number(c.discountValue) ?? 10,
      minAmount: Number((c as { minAmount?: number }).minAmount) ?? 0,
      maxUses: Number((c as { maxUses?: number }).maxUses) ?? 100,
      validFrom: vFrom ? String(vFrom).slice(0, 10) : '',
      validTo: vTo ? String(vTo).slice(0, 10) : '',
    });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    const body: Record<string, unknown> = {
      code: form.code,
      discountType: form.discountType,
      discountValue: form.discountValue,
      minAmount: form.minAmount,
      maxUses: form.maxUses,
    };
    if (form.validFrom) body.validFrom = form.validFrom;
    if (form.validTo) body.validTo = form.validTo;
    try {
      if (modal === 'create') {
        const res = await couponsApi.create(body, token);
        if (res.success) { closeModal(); load(); } else setError(res.error || 'Create failed');
      } else if (editing) {
        const res = await couponsApi.update(editing.id, body, token);
        if (res.success) { closeModal(); load(); } else setError(res.error || 'Update failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-wrap">Loading coupons…</div>;
  if (error) return <div className="card"><p className="error">{error}</p><button className="btn btn-secondary" onClick={() => setError('')}>Dismiss</button></div>;

  return (
    <div className="page-section">
      <h1>Coupons</h1>
      <div className="toolbar">
        <button type="button" className="btn btn-primary" onClick={openCreate}>Add coupon</button>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Code</th><th>Type</th><th>Value</th><th>Min</th><th>Used</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.code ?? '—'}</strong></td>
                <td>{c.discountType ?? '—'}</td>
                <td>{c.discountValue ?? '—'}{c.discountType === 'PERCENT' ? '%' : ''}</td>
                <td>{c.minAmount ?? '—'}</td>
                <td>{c.usedCount ?? 0}</td>
                <td>{c.isActive !== false ? 'Yes' : 'No'}</td>
                <td><button type="button" className="btn btn-secondary" onClick={() => openEdit(c)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No coupons.</p>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal} role="presentation">
          <div className="card modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{modal === 'create' ? 'Add coupon' : 'Edit coupon'}</h2>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Code</label>
                <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="SAVE10" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}>
                    <option value="PERCENT">Percent</option>
                    <option value="FIXED">Fixed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input type="number" value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min amount</label>
                  <input type="number" value={form.minAmount} onChange={(e) => setForm((f) => ({ ...f, minAmount: Number(e.target.value) || 0 }))} />
                </div>
                <div className="form-group">
                  <label>Max uses</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: Number(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Valid from</label>
                  <input type="date" value={form.validFrom} onChange={(e) => setForm((f) => ({ ...f, validFrom: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Valid to</label>
                  <input type="date" value={form.validTo} onChange={(e) => setForm((f) => ({ ...f, validTo: e.target.value }))} />
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
