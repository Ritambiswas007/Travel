'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
};

export default function VisaPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [list, setList] = useState<VisaApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [country, setCountry] = useState('');
  const [type, setType] = useState('TOURIST');
  const [createError, setCreateError] = useState('');

  const loadList = () => {
    if (!accessToken) return;
    visaApi.listMy(accessToken).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: VisaApp[] } | VisaApp[];
        setList(Array.isArray(d) ? d : (d.items ?? []));
      }
    });
  };

  useEffect(() => {
    if (!accessToken) {
      router.push('/login?redirect=/visa');
      return;
    }
    loadList();
  }, [accessToken, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !country.trim()) {
      setCreateError('Country is required.');
      return;
    }
    setCreateError('');
    setCreating(true);
    const res = await visaApi.create({ country: country.trim(), type: type || 'TOURIST' }, accessToken);
    setCreating(false);
    if (res.success && res.data) {
      const app = res.data as VisaApp;
      setList((prev) => [app, ...prev]);
      setShowCreate(false);
      setCountry('');
      setType('TOURIST');
      router.push(`/visa/${app.id}`);
    } else {
      setCreateError((res as { error?: string }).error || (res as { message?: string }).message || 'Failed to create');
    }
  };

  if (!accessToken) return null;

  return (
    <>
      <Header />
      <main className="page-shell">
        <header className="page-header">
          <h1 className="page-title">Visa applications</h1>
          <p className="page-subtitle">Create, submit, and track your visa applications.</p>
        </header>

        <div className="page-stack">
          <section className="page-card">
            {!showCreate ? (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="primary-btn"
              >
                New application
              </button>
            ) : (
              <form onSubmit={handleCreate}>
                <div className="page-card-header">Create visa application</div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Country
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. USA"
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      marginTop: '0.25rem',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  />
                </label>
                <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                  Type
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      marginTop: '0.25rem',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                    }}
                  >
                    <option value="TOURIST">Tourist</option>
                    <option value="BUSINESS">Business</option>
                    <option value="STUDENT">Student</option>
                    <option value="WORK">Work</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
                {createError && (
                  <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{createError}</p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" disabled={creating} className="primary-btn">
                    {creating ? 'Creating…' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      setCreateError('');
                    }}
                    className="secondary-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="page-card">
            <div className="page-card-header">Your applications</div>
            {loading ? (
              <p className="page-empty">Loading…</p>
            ) : list.length === 0 ? (
              <p className="page-empty">No visa applications yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {list.map((v) => (
                  <li
                    key={v.id}
                    style={{
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--border, #e2e8f0)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <Link href={`/visa/${v.id}`} style={{ fontWeight: 600 }}>
                      {v.country ?? '—'} · {v.type ?? '—'}
                    </Link>
                    <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {v.status}
                    </span>
                    {v.createdAt && (
                      <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
