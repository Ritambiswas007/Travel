'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { bookingsApi } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type Booking = {
  id: string;
  status?: string;
  step?: number;
  createdAt?: string;
  package?: { name?: string };
  packageVariant?: { name?: string; basePrice?: string; currency?: string };
  packageSchedule?: { startDate?: string; endDate?: string };
  travelers?: { firstName?: string; lastName?: string; email?: string }[];
};

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { accessToken } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    if (!accessToken || !id) {
      if (!accessToken) router.push('/login?redirect=/bookings/' + id);
      return;
    }
    bookingsApi.getById(id, accessToken).then((r) => {
      setLoading(false);
      if (r.success && r.data) setBooking(r.data as Booking);
    });
  }, [accessToken, id, router]);

  const handleConfirm = async () => {
    if (!accessToken || !id) return;
    setMessage('');
    setActionLoading(true);
    const res = await bookingsApi.confirm(id, accessToken);
    setActionLoading(false);
    if (res.success && res.data) {
      setBooking(res.data as Booking);
      setMessage('Booking confirmed.');
    } else setMessage((res as { error?: string }).error || 'Failed to confirm');
  };

  const handleCancel = async () => {
    if (!accessToken || !id) return;
    if (!confirm('Cancel this booking?')) return;
    setMessage('');
    setActionLoading(true);
    const res = await bookingsApi.cancel(id, accessToken);
    setActionLoading(false);
    if (res.success) {
      router.push('/bookings');
      router.refresh();
    } else setMessage((res as { error?: string }).error || 'Failed to cancel');
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !id || !couponCode.trim()) return;
    setMessage('');
    setActionLoading(true);
    const res = await bookingsApi.applyCoupon(id, { couponCode: couponCode.trim() }, accessToken);
    setActionLoading(false);
    if (res.success && res.data) {
      setBooking(res.data as Booking);
      setMessage('Coupon applied.');
      setCouponCode('');
    } else setMessage((res as { error?: string }).error || 'Coupon invalid or failed');
  };

  if (!accessToken) return null;

  if (loading || !booking) {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
          <p>Loading…</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          <Link href="/bookings" style={{ color: 'var(--brand)' }}>← My bookings</Link>
        </p>
        <h1 style={{ marginBottom: '0.5rem' }}>{booking.package?.name ?? 'Booking'}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Status: <strong>{booking.status}</strong>
          {booking.createdAt && ` · ${new Date(booking.createdAt).toLocaleDateString()}`}
        </p>
        {booking.packageSchedule && (
          <p style={{ marginBottom: '0.5rem' }}>
            Dates: {new Date(booking.packageSchedule.startDate!).toLocaleDateString()} – {new Date(booking.packageSchedule.endDate!).toLocaleDateString()}
          </p>
        )}
        {booking.packageVariant && (
          <p style={{ marginBottom: '1rem' }}>
            {booking.packageVariant.name} – {booking.packageVariant.currency === 'INR' ? '₹' : '$'}
            {Number(booking.packageVariant.basePrice).toLocaleString()}
          </p>
        )}
        {booking.travelers && booking.travelers.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Travelers</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {booking.travelers.map((t, i) => (
                <li key={i} style={{ marginBottom: '0.25rem' }}>
                  {t.firstName} {t.lastName}
                  {t.email && ` · ${t.email}`}
                </li>
              ))}
            </ul>
          </section>
        )}
        {message && <p style={{ marginBottom: '0.75rem', color: message.startsWith('Failed') ? '#dc2626' : 'var(--brand)' }}>{message}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          {booking.status !== 'CONFIRMED' && booking.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={actionLoading}
              style={{ padding: '0.5rem 1rem', background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              Confirm booking
            </button>
          )}
          {booking.status !== 'CANCELLED' && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={actionLoading}
              style={{ padding: '0.5rem 1rem', border: '1px solid #dc2626', color: '#dc2626', background: 'transparent', borderRadius: 8, cursor: 'pointer' }}
            >
              Cancel booking
            </button>
          )}
        </div>
        {booking.status !== 'CONFIRMED' && booking.status !== 'CANCELLED' && (
          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{ padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 8, width: 140 }}
            />
            <button type="submit" disabled={actionLoading} style={{ padding: '0.5rem 1rem', background: 'var(--text)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
              Apply
            </button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
