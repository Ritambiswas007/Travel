import { useState } from 'react';
import { notificationsApi } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';

export function NotificationsPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({ userId: '', title: '', body: '', type: '', channel: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError('');
    setSuccess(false);
    const body: { userId: string; title: string; body: string; type?: string; channel?: string } = {
      userId: form.userId,
      title: form.title,
      body: form.body,
    };
    if (form.type.trim()) body.type = form.type.trim();
    if (form.channel.trim()) body.channel = form.channel.trim();
    const res = await notificationsApi.send(body, token);
    setSubmitting(false);
    if (res.success) setSuccess(true); else setError(res.error || 'Send failed');
  };

  return (
    <div className="page-section">
      <h1>Send notification</h1>
      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>User ID</label>
            <input value={form.userId} onChange={(e) => setForm((f) => ({ ...f, userId: e.target.value }))} required placeholder="User UUID" />
          </div>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Body</label>
            <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} rows={4} required />
          </div>
          <div className="form-group">
            <label>Type (optional)</label>
            <input value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} placeholder="e.g. INFO" />
          </div>
          <div className="form-group">
            <label>Channel (optional)</label>
            <input value={form.channel} onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))} placeholder="e.g. push, email" />
          </div>
          {error && <p className="error">{error}</p>}
          {success && <p style={{ color: 'var(--brand)' }}>Notification sent.</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Sending…' : 'Send'}</button>
        </form>
      </div>
    </div>
  );
}
