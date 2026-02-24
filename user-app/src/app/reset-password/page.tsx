'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!token) {
      setError('Reset token is missing.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const res = await authApi.resetPassword(token, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Reset failed');
      return;
    }
    setMessage('Password updated. You can now sign in.');
    setTimeout(() => router.push('/login'), 3000);
  };

  return (
    <>
      <Header />
      <div className="container" style={{ maxWidth: '420px', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Reset password</h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Choose a strong password for your Travel &amp; Pilgrimage account.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            New password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.25rem',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                marginTop: '0.25rem',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
              }}
            />
          </label>
          {error && <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</p>}
          {message && !error && <p style={{ color: '#16a34a', marginBottom: '0.75rem' }}>{message}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: '#1e293b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Back to <Link href="/login">sign in</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}

