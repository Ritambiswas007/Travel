import { useEffect, useState } from 'react';
import { reportsApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function ReportsPage() {
  const { token } = useAuth();
  const [saved, setSaved] = useState<{ id: string; name?: string; type?: string; status?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [from, setFrom] = useState(formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
  const [to, setTo] = useState(formatDate(new Date()));
  const [bookingsData, setBookingsData] = useState<{ bookings?: unknown[]; summary?: { status: string; _count: number }[] } | null>(null);
  const [revenueData, setRevenueData] = useState<{ payments?: unknown[]; total?: number } | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createType, setCreateType] = useState('bookings');
  const [submitting, setSubmitting] = useState(false);
  const [reportDetail, setReportDetail] = useState<Record<string, unknown> | null>(null);

  const loadSaved = () => {
    if (!token) return;
    reportsApi.list(token, { page: 1, limit: 50 }).then((r) => {
      if (r.success && r.data) {
        const d = r.data as { items?: typeof saved };
        setSaved(d.items ?? []);
      }
    });
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    loadSaved();
    reportsApi.bookings(token, from, to).then((r) => {
      if (r.success && r.data) setBookingsData(r.data as { bookings?: unknown[]; summary?: { status: string; _count: number }[] });
    });
    reportsApi.revenue(token, from, to).then((r) => {
      if (r.success && r.data) setRevenueData(r.data as { payments?: unknown[]; total?: number });
      setLoading(false);
    });
  }, [token, from, to]);

  const runReports = () => {
    if (!token) return;
    setLoading(true);
    reportsApi.bookings(token, from, to).then((r) => {
      if (r.success && r.data) setBookingsData(r.data as { bookings?: unknown[]; summary?: { status: string; _count: number }[] });
    });
    reportsApi.revenue(token, from, to).then((r) => {
      if (r.success && r.data) setRevenueData(r.data as { payments?: unknown[]; total?: number });
      setLoading(false);
    });
  };

  const createReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    const res = await reportsApi.create({ name: createName, type: createType, params: { from, to } }, token);
    setSubmitting(false);
    if (res.success) { setCreateModal(false); setCreateName(''); loadSaved(); } else setError(res.error || 'Create failed');
  };

  const openReport = (id: string) => {
    if (!token) return;
    reportsApi.getById(id, token).then((r) => {
      if (r.success && r.data) setReportDetail(r.data as Record<string, unknown>);
    });
  };

  const totalBookings = bookingsData?.bookings?.length ?? 0;
  const byStatus = (status: string) => bookingsData?.summary?.find((s) => s.status === status)?._count ?? 0;
  const totalRevenue = revenueData?.total ?? 0;
  const paymentCount = revenueData?.payments?.length ?? 0;

  if (error) return <div className="card"><p className="error">{error}</p><button className="btn btn-secondary" onClick={() => setError('')}>Dismiss</button></div>;

  return (
    <div className="page-section">
      <h1>Reports</h1>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Date range</h3>
        <div className="form-row">
          <div className="form-group">
            <label>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="form-group" style={{ alignSelf: 'flex-end' }}>
            <button type="button" className="btn btn-primary" onClick={runReports} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Revenue report</h3>
        {loading && !revenueData ? <p>Loading…</p> : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong>Total revenue:</strong> ₹{Number(totalRevenue).toFixed(0)}</li>
            <li><strong>Payments count:</strong> {paymentCount}</li>
            <li><strong>Average order:</strong> ₹{paymentCount ? (Number(totalRevenue) / paymentCount).toFixed(0) : 0}</li>
          </ul>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Bookings report</h3>
        {loading && !bookingsData ? <p>Loading…</p> : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li><strong>Total bookings:</strong> {totalBookings}</li>
            <li><strong>Confirmed:</strong> {byStatus('CONFIRMED')}</li>
            <li><strong>Pending:</strong> {byStatus('PENDING_PAYMENT')}</li>
            <li><strong>Cancelled:</strong> {byStatus('CANCELLED')}</li>
          </ul>
        )}
      </div>

      <div className="card">
        <div className="toolbar" style={{ justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Saved reports</h3>
          <button type="button" className="btn btn-primary" onClick={() => setCreateModal(true)}>Save as report</button>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Type</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {saved.map((r) => (
              <tr key={r.id}>
                <td>{r.name ?? '—'}</td>
                <td>{r.type ?? '—'}</td>
                <td>{r.status ?? '—'}</td>
                <td><button type="button" className="btn btn-secondary" onClick={() => openReport(r.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {saved.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No saved reports.</p>}
      </div>

      {createModal && (
        <div className="modal-overlay" onClick={() => setCreateModal(false)} role="presentation">
          <div className="card modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2 style={{ marginTop: 0 }}>Save report</h2>
            <form onSubmit={createReport}>
              <div className="form-group">
                <label>Name</label>
                <input value={createName} onChange={(e) => setCreateName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={createType} onChange={(e) => setCreateType(e.target.value)}>
                  <option value="bookings">Bookings</option>
                  <option value="revenue">Revenue</option>
                </select>
              </div>
              <div className="toolbar" style={{ marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reportDetail && (
        <div className="modal-overlay" onClick={() => setReportDetail(null)} role="presentation">
          <div className="card modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2 style={{ marginTop: 0 }}>{String(reportDetail.name ?? 'Report')}</h2>
            <p><strong>Type:</strong> {String(reportDetail.type ?? '—')}</p>
            <p><strong>Status:</strong> {String(reportDetail.status ?? '—')}</p>
            {reportDetail.params != null && (
              <p><strong>Params:</strong> {JSON.stringify(reportDetail.params as Record<string, unknown>)}</p>
            )}
            <button type="button" className="btn btn-secondary" onClick={() => setReportDetail(null)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}
