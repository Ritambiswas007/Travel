'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { bookingsApi } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type Booking = {
  id: string;
  status?: string;
  createdAt?: string;
  package?: { name?: string };
  packageVariant?: { name?: string; basePrice?: string; currency?: string };
};

export default function BookingsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [list, setList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      router.push('/login?redirect=/bookings');
      return;
    }
    bookingsApi.listMy(accessToken).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const d = r.data as { items?: Booking[] } | Booking[];
        setList(Array.isArray(d) ? d : (d.items ?? []));
      }
    });
  }, [accessToken, router]);

  if (!accessToken) return null;

  return (
    <>
      <Header />
      <main className="page-shell">
        <header className="page-header">
          <h1 className="page-title">My bookings</h1>
          <p className="page-subtitle">View and manage your upcoming and past trips.</p>
        </header>
        {loading ? (
          <p className="page-empty">Loading…</p>
        ) : list.length === 0 ? (
          <p className="page-empty">No bookings yet.</p>
        ) : (
          <div className="page-stack">
            {list.map((b) => (
              <div key={b.id} className="page-card">
                <div className="page-card-header">
                  <Link href={`/bookings/${b.id}`}>
                    {b.package?.name ?? b.id.slice(0, 8) + '…'}
                  </Link>
                </div>
                <div className="page-card-meta">
                  {b.status && <span>{b.status}</span>}
                  {b.createdAt && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
