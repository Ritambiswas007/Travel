import { useEffect, useState } from 'react';
import { leadsApi, staffApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

type Lead = { id: string; name?: string; email?: string; phone?: string; message?: string; status?: string; createdAt?: string };
type Staff = { id: string; name?: string };

export function LeadsPage() {
  const { token } = useAuth();
  const [list, setList] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<(Lead & { assignments?: { staff?: Staff }[] }) | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [assignStaffId, setAssignStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    const params: { page?: number; limit?: number; status?: string } = { page: 1, limit: 50 };
    if (statusFilter) params.status = statusFilter;
    leadsApi.list(token, params).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: Lead[] };
        setList(d.items ?? []);
      } else setError(r.error || 'Failed to load');
    });
  };

  useEffect(() => { load(); }, [token, statusFilter]);
  useEffect(() => {
    if (!token) return;
    staffApi.list(token, { limit: 100 }).then((r) => {
      if (r.success && r.data) {
        const d = r.data as { items?: Staff[] };
        setStaffList(d.items ?? []);
      }
    });
  }, [token]);

  const openDetail = (id: string) => {
    if (!token) return;
    leadsApi.getById(id, token).then((r) => {
      if (r.success && r.data) setDetail(r.data as Lead & { assignments?: { staff?: Staff }[] });
    });
  };

  const assign = async () => {
    if (!token || !detail?.id || !assignStaffId) return;
    setAssigning(true);
    const res = await leadsApi.assign(detail.id, { staffId: assignStaffId }, token);
    setAssigning(false);
    if (res.success) { openDetail(detail.id); load(); } else setError(res.error || 'Assign failed');
  };

  const updateLeadStatus = async () => {
    if (!token || !detail?.id || !updateStatus) return;
    setUpdating(true);
    const res = await leadsApi.update(detail.id, { status: updateStatus }, token);
    setUpdating(false);
    if (res.success) { setDetail((d) => (d ? { ...d, status: updateStatus } : null)); load(); } else setError(res.error || 'Update failed');
  };

  if (loading && list.length === 0) return <div className="loading-wrap">Loading leads…</div>;
  if (error) return <div className="card"><p className="error">{error}</p><button className="btn btn-secondary" onClick={() => setError('')}>Dismiss</button></div>;

  return (
    <div className="page-section">
      <h1>Leads</h1>
      <div className="toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="NEW">NEW</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="QUALIFIED">QUALIFIED</option>
          <option value="CONVERTED">CONVERTED</option>
          <option value="LOST">LOST</option>
        </select>
      </div>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.map((l) => (
              <tr key={l.id}>
                <td>{l.name ?? '—'}</td>
                <td>{l.email ?? '—'}</td>
                <td>{(l as { phone?: string }).phone ?? '—'}</td>
                <td>{l.status ?? '—'}</td>
                <td>{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '—'}</td>
                <td><button type="button" className="btn btn-secondary" onClick={() => openDetail(l.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No leads.</p>}
      </div>
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="card modal-box" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>Lead details</h2>
            <p><strong>Name:</strong> {detail.name ?? '—'}</p>
            <p><strong>Email:</strong> {detail.email ?? '—'}</p>
            <p><strong>Phone:</strong> {(detail as { phone?: string }).phone ?? '—'}</p>
            <p><strong>Message:</strong> {detail.message ?? '—'}</p>
            <p><strong>Status:</strong> {detail.status ?? '—'}</p>
            <div className="form-group">
              <label>Update status</label>
              <div className="toolbar">
                <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                  <option value="">Select…</option>
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="LOST">LOST</option>
                </select>
                <button type="button" className="btn btn-primary" onClick={updateLeadStatus} disabled={!updateStatus || updating}>{updating ? 'Updating…' : 'Update'}</button>
              </div>
            </div>
            <div className="form-group">
              <label>Assign to staff</label>
              <div className="toolbar">
                <select value={assignStaffId} onChange={(e) => setAssignStaffId(e.target.value)}>
                  <option value="">Select staff…</option>
                  {staffList.map((s) => <option key={s.id} value={s.id}>{s.name ?? s.id}</option>)}
                </select>
                <button type="button" className="btn btn-primary" onClick={assign} disabled={!assignStaffId || assigning}>{assigning ? 'Assigning…' : 'Assign'}</button>
              </div>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
