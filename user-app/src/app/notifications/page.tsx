'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { notificationsApi, type UserNotification } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function NotificationsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [items, setItems] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      router.push('/login?redirect=/notifications');
      return;
    }
    notificationsApi.listMy(accessToken, { unreadOnly }).then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        const d = res.data as { items?: UserNotification[] } | UserNotification[];
        setItems(Array.isArray(d) ? d : d.items ?? []);
      }
    });
  }, [accessToken, router, unreadOnly]);

  const handleMarkRead = async (id: string) => {
    if (!accessToken) return;
    await notificationsApi.markRead(id, accessToken);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n))
    );
  };

  if (!accessToken) return null;

  return (
    <>
      <Header />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Notifications</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Updates about your bookings, visas, and documents.
        </p>
        <div style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>
          <label>
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Show unread only
          </label>
        </div>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
        ) : items.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No notifications.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((n) => (
              <li
                key={n.id}
                style={{
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border, #e2e8f0)',
                  opacity: n.readAt ? 0.7 : 1,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {n.notification?.title ?? 'Notification'}
                  {n.notification?.type && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      · {n.notification.type}
                    </span>
                  )}
                </div>
                {n.notification?.body && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {n.notification.body}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </span>
                  {!n.readAt && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--brand)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </>
  );
}

