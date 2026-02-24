'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { packagesApi, bookingsApi } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import styles from './page.module.css';

type Schedule = { id: string; startDate: string; endDate: string; availableSeats?: number };
type Variant = { id: string; name?: string; basePrice: string; currency: string; durationDays?: number };
type Pkg = {
  id: string;
  name?: string;
  variants?: Variant[];
  schedules?: Schedule[];
};

export default function BookPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageId = searchParams.get('packageId');
  const { accessToken } = useAuth();
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [loading, setLoading] = useState(!!packageId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [scheduleId, setScheduleId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [travelers, setTravelers] = useState([{ firstName: '', lastName: '', email: '' }]);

  useEffect(() => {
    if (!packageId || !accessToken) return;
    packagesApi.getById(packageId).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const data = r.data as Pkg;
        setPkg(data);
        if (data.schedules?.length) setScheduleId(data.schedules[0].id);
        if (data.variants?.length) setVariantId(data.variants[0].id);
      }
    });
  }, [packageId, accessToken]);

  const loginUrl = packageId ? `/login?redirect=/book?packageId=${packageId}` : '/login';

  const addTraveler = () => setTravelers((t) => [...t, { firstName: '', lastName: '', email: '' }]);
  const updateTraveler = (i: number, field: string, value: string) => {
    setTravelers((t) => t.map((x, j) => (j === i ? { ...x, [field]: value } : x)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !packageId || !scheduleId || !variantId) {
      setError('Please select dates and variant.');
      return;
    }
    const list = travelers.filter((t) => t.firstName.trim() && t.lastName.trim());
    if (list.length === 0) {
      setError('Add at least one traveler with first and last name.');
      return;
    }
    setError('');
    setSubmitting(true);
    const res = await bookingsApi.create(
      {
        packageId,
        packageScheduleId: scheduleId,
        packageVariantId: variantId,
        travelers: list.map((t) => ({
          firstName: t.firstName.trim(),
          lastName: t.lastName.trim(),
          email: t.email.trim() || undefined,
        })),
      },
      accessToken
    );
    setSubmitting(false);
    if (res.success && res.data) {
      const data = res.data as { id?: string };
      router.push(data?.id ? `/bookings/${data.id}` : '/bookings');
      router.refresh();
    } else {
      setError((res as { message?: string }).message || (res as { error?: string }).error || 'Booking failed');
    }
  };

  if (!accessToken) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <h1>Sign in to book</h1>
            <p>You need to be signed in to complete your reservation.</p>
            <Link href={loginUrl} className={styles.primaryBtn}>Sign in</Link>
            <Link href="/register" className={styles.secondaryBtn}>Create an account</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!packageId) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.card}>
            <h1>Choose a package</h1>
            <p>Select a package from the home page to start your booking.</p>
            <Link href="/" className={styles.primaryBtn}>Browse packages</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (loading || !pkg) {
    return (
      <>
        <Header />
        <main className={styles.main}><div className={styles.card}><p>Loading…</p></div></main>
        <Footer />
      </>
    );
  }

  const schedules = pkg.schedules ?? [];
  const variants = pkg.variants ?? [];
  const canSubmit = schedules.length > 0 && variants.length > 0;

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.card} style={{ textAlign: 'left', maxWidth: 520 }}>
          <h1>Complete your booking</h1>
          <p style={{ marginBottom: '1rem' }}>{pkg.name ?? 'Package'}</p>
          {!canSubmit ? (
            <p style={{ color: 'var(--text-secondary)' }}>No availability at the moment. Please contact support or try another package.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                Date
                <select
                  value={scheduleId}
                  onChange={(e) => setScheduleId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid var(--border)', borderRadius: 8 }}
                >
                  {schedules.map((s) => (
                    <option key={s.id} value={s.id}>
                      {new Date(s.startDate).toLocaleDateString()} – {new Date(s.endDate).toLocaleDateString()}
                      {s.availableSeats != null ? ` (${s.availableSeats} seats)` : ''}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                Variant
                <select
                  value={variantId}
                  onChange={(e) => setVariantId(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid var(--border)', borderRadius: 8 }}
                >
                  {variants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name ?? v.id} – {v.currency === 'INR' ? '₹' : '$'}{Number(v.basePrice).toLocaleString()}
                    </option>
                  ))}
                </select>
              </label>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span>Travelers</span>
                  <button type="button" onClick={addTraveler} style={{ padding: '4px 8px', fontSize: '0.875rem' }}>Add</button>
                </div>
                {travelers.map((t, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      placeholder="First name"
                      value={t.firstName}
                      onChange={(e) => updateTraveler(i, 'firstName', e.target.value)}
                      style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 8 }}
                    />
                    <input
                      placeholder="Last name"
                      value={t.lastName}
                      onChange={(e) => updateTraveler(i, 'lastName', e.target.value)}
                      style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 8 }}
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={t.email}
                      onChange={(e) => updateTraveler(i, 'email', e.target.value)}
                      style={{ gridColumn: '1 / -1', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 8 }}
                    />
                  </div>
                ))}
              </div>
              {error && <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</p>}
              <button type="submit" disabled={submitting} className={styles.primaryBtn} style={{ marginRight: 0 }}>
                {submitting ? 'Creating…' : 'Create booking'}
              </button>
            </form>
          )}
          <p style={{ marginTop: '1rem' }}>
            <Link href={packageId ? `/packages/${packageId}` : '/'} className={styles.secondaryBtn} style={{ display: 'inline-block' }}>
              Back to package
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
