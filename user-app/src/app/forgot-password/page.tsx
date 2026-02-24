'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const res = await authApi.forgotPassword(email);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Request failed');
      return;
    }
    setMessage('If that email exists, a reset link has been sent.');
    setTimeout(() => router.push('/login'), 4000);
  };

  return (
    <>
      <Header />
      <div className="container" style={{ maxWidth: '420px', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Forgot password</h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Enter the email associated with your account and we&apos;ll send you a reset link.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Remembered your password? <Link href="/login">Back to sign in</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}

