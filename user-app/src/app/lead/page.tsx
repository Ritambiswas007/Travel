'use client';

import { useState } from 'react';
import { leadsApi } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function LeadPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    const res = await leadsApi.create({
      name: name || undefined,
      email: email || undefined,
      phone: phone || undefined,
      message: message || undefined,
      sourceId: undefined,
    });
    setSubmitting(false);
    if (res.success) {
      setStatus({ type: 'success', text: 'Thanks, we will contact you shortly.' });
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } else {
      setStatus({ type: 'error', text: res.error || 'Could not submit your request.' });
    }
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Contact us</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Share your details and we&apos;ll reach out with the best packages for you.
        </p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                marginTop: '0.25rem',
                borderRadius: 8,
                border: '1px solid var(--border, #e2e8f0)',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                marginTop: '0.25rem',
                borderRadius: 8,
                border: '1px solid var(--border, #e2e8f0)',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Phone
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                marginTop: '0.25rem',
                borderRadius: 8,
                border: '1px solid var(--border, #e2e8f0)',
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                marginTop: '0.25rem',
                borderRadius: 8,
                border: '1px solid var(--border, #e2e8f0)',
              }}
            />
          </label>
          {status && (
            <p
              style={{
                marginBottom: '0.75rem',
                fontSize: '0.9rem',
                color: status.type === 'success' ? '#16a34a' : '#dc2626',
              }}
            >
              {status.text}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'var(--brand, #1e293b)',
              color: '#fff',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit enquiry'}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}

