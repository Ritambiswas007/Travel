'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { visaApi } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type VisaApp = {
  id: string;
  country?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  submittedAt?: string | null;
};

export default function VisaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { accessToken } = useAuth();
  const [app, setApp] = useState<VisaApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editType, setEditType] = useState('');
  const [editing, setEditing] = useState(false);
  const [docType, setDocType] = useState('');
  const [docFileUrl, setDocFileUrl] = useState('');

  useEffect(() => {
    if (!accessToken || !id) {
      if (!accessToken) router.push('/login?redirect=/visa/' + id);
      return;
    }
    visaApi.getById(id, accessToken).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const data = r.data as VisaApp;
        setApp(data);
        setEditCountry(data.country ?? '');
        setEditType(data.type ?? 'TOURIST');
      } else setError((r as { error?: string }).error || 'Not found');
    });
  }, [accessToken, id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !id) return;
    setMessage('');
    setError('');
    setActionLoading(true);
    const res = await visaApi.update(id, { country: editCountry.trim() || undefined, type: editType || undefined }, accessToken);
    setActionLoading(false);
    if (res.success && res.data) {
      setApp(res.data as VisaApp);
      setEditing(false);
      setMessage('Application updated.');
    } else setError((res as { error?: string }).error || 'Update failed');
  };

  const handleSubmit = async () => {
    if (!accessToken || !id) return;
    setMessage('');
    setError('');
    setActionLoading(true);
    const res = await visaApi.submit(id, accessToken);
    setActionLoading(false);
    if (res.success && res.data) {
      setApp(res.data as VisaApp);
      setMessage('Application submitted.');
    } else setError((res as { error?: string }).error || 'Submit failed');
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !id || !docType.trim() || !docFileUrl.trim()) {
      setError('Type and file URL are required.');
      return;
    }
    setMessage('');
    setError('');
    setActionLoading(true);
    const res = await visaApi.addDocument(id, { type: docType.trim(), fileUrl: docFileUrl.trim() }, accessToken);
    setActionLoading(false);
    if (res.success) {
      setMessage('Document added.');
      setDocType('');
      setDocFileUrl('');
    } else setError((res as { error?: string }).error || 'Add document failed');
  };

  if (!accessToken) return null;

  if (loading && !app) {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}><p>Loading…</p></main>
        <Footer />
      </>
    );
  }

  if (error && !app) {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
          <p style={{ color: '#dc2626' }}>{error}</p>
          <Link href="/visa" style={{ color: 'var(--brand)' }}>← Back to visa applications</Link>
        </main>
        <Footer />
      </>
    );
  }

  const isDraft = app?.status === 'DRAFT';

  return (
    <>
      <Header />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          <Link href="/visa" style={{ color: 'var(--brand)' }}>← Visa applications</Link>
        </p>
        <h1 style={{ marginBottom: '0.5rem' }}>Visa application</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Status: <strong>{app?.status}</strong>
          {app?.createdAt && ` · Created ${new Date(app.createdAt).toLocaleDateString()}`}
          {app?.submittedAt && ` · Submitted ${new Date(app.submittedAt).toLocaleDateString()}`}
        </p>

        {message && <p style={{ color: 'var(--brand)', marginBottom: '0.75rem' }}>{message}</p>}
        {error && <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</p>}

        {!editing ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <p><strong>Country:</strong> {app?.country ?? '—'}</p>
            <p><strong>Type:</strong> {app?.type ?? '—'}</p>
            {isDraft && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}
              >
                Edit application
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleUpdate} style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Country
              <input
                type="text"
                value={editCountry}
                onChange={(e) => setEditCountry(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', marginTop: '0.25rem', border: '1px solid var(--border)', borderRadius: 8 }}
              />
            </label>
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              Type
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', marginTop: '0.25rem', border: '1px solid var(--border)', borderRadius: 8 }}
              >
                <option value="TOURIST">Tourist</option>
                <option value="BUSINESS">Business</option>
                <option value="STUDENT">Student</option>
                <option value="WORK">Work</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" disabled={actionLoading} style={{ padding: '0.5rem 1rem', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                Save
              </button>
              <button type="button" onClick={() => { setEditing(false); setEditCountry(app?.country ?? ''); setEditType(app?.type ?? 'TOURIST'); }} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {isDraft && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={actionLoading}
                style={{ padding: '0.5rem 1rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Submit application
              </button>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>After submission you cannot edit or add documents.</p>
            </div>

            <section style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Add document</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Provide document type and a URL to the file (e.g. after uploading via Documents page).</p>
              <form onSubmit={handleAddDocument}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Type (e.g. passport, photo)
                  <input
                    type="text"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    placeholder="passport"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', marginTop: '0.25rem', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                </label>
                <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                  File URL
                  <input
                    type="url"
                    value={docFileUrl}
                    onChange={(e) => setDocFileUrl(e.target.value)}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '0.5rem 0.75rem', marginTop: '0.25rem', border: '1px solid var(--border)', borderRadius: 8 }}
                  />
                </label>
                <button type="submit" disabled={actionLoading} style={{ padding: '0.5rem 1rem', background: 'var(--text)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                  Add document
                </button>
              </form>
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
