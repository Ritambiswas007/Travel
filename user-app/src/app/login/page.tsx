'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/endpoints';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function LoginPage() {
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';
  const { login } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    const res = await authApi.login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Login failed');
      return;
    }
    const d = (res.data || {}) as {
      accessToken?: string;
      refreshToken?: string;
      user?: { id: string; email: string; role?: string; name?: string };
    };
    if (!d.accessToken) {
      setError('Invalid response');
      return;
    }
    login({
      accessToken: d.accessToken,
      refreshToken: d.refreshToken,
      user: d.user,
    });
    router.push(redirect);
    router.refresh();
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    const res = await authApi.loginPhone(phone, otp);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Login failed');
      return;
    }
    const d = (res.data || {}) as {
      accessToken?: string;
      refreshToken?: string;
      user?: { id: string; email: string; role?: string; name?: string };
    };
    if (!d.accessToken) {
      setError('Invalid response');
      return;
    }
    login({
      accessToken: d.accessToken,
      refreshToken: d.refreshToken,
      user: d.user,
    });
    router.push(redirect);
    router.refresh();
  };

  const handleSendOtp = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('Enter your email to receive an OTP.');
      return;
    }
    const res = await authApi.sendOtp(email, 'login');
    if (!res.success) {
      setError(res.error || 'Failed to send OTP');
    } else {
      setInfo('OTP sent to your email.');
    }
  };

  return (
    <>
      <Header />
      <div className="container" style={{ maxWidth: '420px', paddingTop: '3rem', paddingBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Sign in</h1>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Access your Travel & Pilgrimage account</p>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setMode('email')}
            style={{
              flex: 1,
              padding: '0.4rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid #e2e8f0',
              background: mode === 'email' ? '#0f172a' : '#fff',
              color: mode === 'email' ? '#fff' : '#0f172a',
              fontWeight: 500,
            }}
          >
            Email &amp; password
          </button>
          <button
            type="button"
            onClick={() => setMode('phone')}
            style={{
              flex: 1,
              padding: '0.4rem 0.75rem',
              borderRadius: '999px',
              border: '1px solid #e2e8f0',
              background: mode === 'phone' ? '#0f172a' : '#fff',
              color: mode === 'phone' ? '#fff' : '#0f172a',
              fontWeight: 500,
            }}
          >
            Phone &amp; OTP
          </button>
        </div>

        {mode === 'email' ? (
          <form onSubmit={handleEmailLogin}>
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
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Password
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
            {error && <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</p>}
            {info && !error && <p style={{ color: '#16a34a', marginBottom: '0.75rem' }}>{info}</p>}
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
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
              <Link href="/forgot-password">Forgot password?</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handlePhoneLogin}>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              Phone number
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
            <label style={{ display: 'block', marginBottom: '0.75rem' }}>
              One-time password
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
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
            <button
              type="button"
              onClick={handleSendOtp}
              style={{
                marginBottom: '0.75rem',
                fontSize: '0.85rem',
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Send login OTP to my email
            </button>
            {error && <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</p>}
            {info && !error && <p style={{ color: '#16a34a', marginBottom: '0.75rem' }}>{info}</p>}
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
              {loading ? 'Signing in…' : 'Sign in with OTP'}
            </button>
          </form>
        )}

        <p style={{ marginTop: '1rem' }}>
          Don&apos;t have an account? <Link href="/register">Register</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}

