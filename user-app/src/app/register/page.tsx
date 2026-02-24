'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await authApi.register({ name, email, password, role: 'USER' });
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Registration failed');
      return;
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <Header />
      <div className="container" style={{ maxWidth: '400px', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Register</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Create a user account</p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
          />
        </label>
        {error && <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.6rem', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          {loading ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
      <Footer />
    </>
  );
}
