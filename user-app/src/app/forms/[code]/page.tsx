'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formsPublicApi, type DynamicForm, type DynamicFormField } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

function getFieldOptions(field: DynamicFormField): { value: string; label: string }[] {
  const opts = field.options;
  if (!opts) return [];
  if (Array.isArray(opts)) {
    return opts.map((o) =>
      typeof o === 'string' ? { value: o, label: o } : { value: String((o as { value?: string }).value ?? o), label: String((o as { label?: string }).label ?? o) }
    );
  }
  if (typeof opts === 'object' && opts !== null) {
    return Object.entries(opts).map(([value, label]) => ({ value, label: String(label) }));
  }
  return [];
}

export default function FormByCodePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string) ?? '';
  const { accessToken } = useAuth();
  const [form, setForm] = useState<DynamicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState<Record<string, string | number>>({});
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!code) {
      setLoading(false);
      setError('Form code is required.');
      return;
    }
    setError('');
    formsPublicApi.getByCode(code).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        setForm(r.data);
        const initial: Record<string, string | number> = {};
        (r.data.fields ?? []).forEach((f) => {
          initial[f.name] = '';
        });
        setValues(initial);
      } else {
        setError((r as { error?: string }).error || (r as { message?: string }).message || 'Form not found');
      }
    });
  }, [code]);

  const handleChange = (name: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError('');
    setSubmitting(true);
    const res = await formsPublicApi.submit(form.id, { data: { ...values } }, accessToken ?? undefined);
    setSubmitting(false);
    if (res.success) {
      setSubmitSuccess(true);
    } else {
      setError((res as { error?: string }).error || (res as { message?: string }).message || 'Submission failed');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1rem' }}>
          <p>Loading form…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error && !form) {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1rem' }}>
          <p style={{ color: '#dc2626' }}>{error}</p>
          <Link href="/" style={{ color: 'var(--brand)' }}>← Back to home</Link>
        </main>
        <Footer />
      </>
    );
  }

  if (submitSuccess) {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Form submitted</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Thank you. Your response has been recorded.</p>
          <Link href="/" style={{ color: 'var(--brand)' }}>← Back to home</Link>
        </main>
        <Footer />
      </>
    );
  }

  const fields = form?.fields ?? [];

  return (
    <>
      <Header />
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{form?.name ?? 'Form'}</h1>
        {form?.description && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{form.description}</p>
        )}
        {error && <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label key={field.id} style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 600 }}>
                {field.label}
                {field.required && ' *'}
              </span>
              {field.type === 'textarea' ? (
                <textarea
                  value={String(values[field.name] ?? '')}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  rows={4}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', marginTop: '0.25rem', border: '1px solid var(--border)', borderRadius: 8 }}
                />
              ) : field.type === 'select' ? (
                <select
                  value={String(values[field.name] ?? '')}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', marginTop: '0.25rem', border: '1px solid var(--border)', borderRadius: 8 }}
                >
                  <option value="">Select…</option>
                  {getFieldOptions(field).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
                  value={String(values[field.name] ?? '')}
                  onChange={(e) =>
                    handleChange(field.name, field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)
                  }
                  required={field.required}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', marginTop: '0.25rem', border: '1px solid var(--border)', borderRadius: 8 }}
                />
              )}
            </label>
          ))}
          <button
            type="submit"
            disabled={submitting || fields.length === 0}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'var(--brand, #1e293b)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </form>
      </main>
      <Footer />
    </>
  );
}
