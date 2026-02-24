'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supportApi } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type Ticket = {
  id: string;
  subject?: string;
  message?: string;
  priority?: string;
  status?: string;
  createdAt?: string;
};

export default function SupportPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('NORMAL');

  useEffect(() => {
    if (!accessToken) {
      router.push('/login?redirect=/support');
      return;
    }
    supportApi.listMy(accessToken).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: Ticket[] };
        setTickets(d.items ?? []);
      }
    });
  }, [accessToken, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      router.push('/login?redirect=/support');
      return;
    }
    setError('');
    setSuccess('');
    setCreating(true);
    const res = await supportApi.create(
      { subject: subject.trim(), message: message.trim(), priority: priority || undefined },
      accessToken
    );
    setCreating(false);
    if (res.success && res.data) {
      setTickets((prev) => [res.data as Ticket, ...prev]);
      setSubject('');
      setMessage('');
      setPriority('NORMAL');
      setSuccess('Ticket created.');
    } else {
      setError(res.message || res.error || 'Failed to create ticket');
    }
  };

  if (!accessToken) {
    return null;
  }

  return (
    <>
      <Header />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Support</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Create a ticket or view your existing ones.
        </p>

        <form onSubmit={handleCreate} style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Subject
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                marginTop: '0.25rem',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: 8,
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                marginTop: '0.25rem',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: 8,
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                marginTop: '0.25rem',
                border: '1px solid var(--border, #e2e8f0)',
                borderRadius: 8,
              }}
            >
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
            </select>
          </label>
          {error && <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</p>}
          {success && <p style={{ color: '#16a34a', marginBottom: '0.75rem' }}>{success}</p>}
          <button
            type="submit"
            disabled={creating}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--brand, #1e293b)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            {creating ? 'Creating…' : 'Create ticket'}
          </button>
        </form>

        <h2 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>My tickets</h2>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : tickets.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No tickets yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tickets.map((t) => (
              <li
                key={t.id}
                style={{
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border, #e2e8f0)',
                }}
              >
                <Link href={`/support/${t.id}`} style={{ fontWeight: 600 }}>
                  {t.subject || 'No subject'}
                </Link>
                <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {t.status}
                </span>
                <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                  {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}
