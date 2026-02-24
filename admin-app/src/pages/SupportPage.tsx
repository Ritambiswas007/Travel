import { useEffect, useState } from 'react';
import { supportApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

type Ticket = { id: string; subject?: string; status?: string; priority?: string; createdAt?: string };
type Msg = { id: string; message?: string; createdAt?: string; isStaff?: boolean };
type TicketDetail = Ticket & { messages?: Msg[] };

export function SupportPage() {
  const { token } = useAuth();
  const [list, setList] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [closing, setClosing] = useState(false);

  const load = () => {
    if (!token) return;
    setLoading(true);
    supportApi.list(token).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: Ticket[] };
        setList(d.items ?? (Array.isArray(r.data) ? r.data : []));
      } else setError(r.error || 'Failed to load');
    });
  };

  useEffect(() => { load(); }, [token]);

  const openDetail = (id: string) => {
    if (!token) return;
    supportApi.getById(id, token).then((r) => {
      if (r.success && r.data) setDetail(r.data as TicketDetail);
    });
  };

  const reply = async () => {
    if (!token || !detail?.id || !replyText.trim()) return;
    setReplying(true);
    const res = await supportApi.reply(detail.id, { message: replyText }, token);
    setReplying(false);
    if (res.success) { setReplyText(''); openDetail(detail.id); } else setError(res.error || 'Reply failed');
  };

  const closeTicket = async () => {
    if (!token || !detail?.id) return;
    setClosing(true);
    const res = await supportApi.close(detail.id, token);
    setClosing(false);
    if (res.success) { setDetail(null); load(); } else setError(res.error || 'Close failed');
  };

  if (loading && list.length === 0) return <div className="loading-wrap">Loading tickets…</div>;
  if (error) return <div className="card"><p className="error">{error}</p><button className="btn btn-secondary" onClick={() => setError('')}>Dismiss</button></div>;

  return (
    <div className="page-section">
      <h1>Support tickets</h1>
      <div className="card">
        <table className="data-table">
          <thead>
            <tr><th>Subject</th><th>Status</th><th>Priority</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id}>
                <td>{t.subject ?? '—'}</td>
                <td>{t.status ?? '—'}</td>
                <td>{t.priority ?? '—'}</td>
                <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
                <td><button type="button" className="btn btn-secondary" onClick={() => openDetail(t.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>No tickets.</p>}
      </div>
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)} role="presentation">
          <div className="card modal-box" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{detail.subject ?? 'Ticket'}</h2>
            <p><strong>Status:</strong> {detail.status ?? '—'}</p>
            <div style={{ marginTop: '1rem' }}><strong>Messages</strong></div>
            {detail.messages?.map((m) => (
              <div key={m.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <small>{m.isStaff ? 'Staff' : 'User'} · {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</small>
                <p style={{ margin: '0.25rem 0 0' }}>{m.message ?? '—'}</p>
              </div>
            ))}
            {detail.status !== 'CLOSED' && (
              <>
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label>Reply</label>
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} placeholder="Your reply…" />
                </div>
                <div className="toolbar">
                  <button type="button" className="btn btn-primary" onClick={reply} disabled={!replyText.trim() || replying}>{replying ? 'Sending…' : 'Send reply'}</button>
                  <button type="button" className="btn btn-danger" onClick={closeTicket} disabled={closing}>{closing ? 'Closing…' : 'Close ticket'}</button>
                </div>
              </>
            )}
            <button type="button" className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => setDetail(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
