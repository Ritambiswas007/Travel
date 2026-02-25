'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usersApi, authApi } from '@/api/endpoints';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import styles from './page.module.css';

type ProfileUser = { id?: string; email?: string; name?: string; phone?: string };

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const { accessToken, refreshToken, user, setUser, logout } = useAuth();

  useEffect(() => {
    if (!accessToken) {
      router.push('/login?redirect=/profile');
      return;
    }
    usersApi.getMe(accessToken).then((r) => {
      setLoading(false);
      if (r.success && r.data) {
        const p = r.data as ProfileUser;
        setProfile(p);
        setName(p.name ?? '');
        setEmail(p.email ?? '');
        setPhone(p.phone ?? '');
      } else if (!r.success) {
        router.push('/login?redirect=/profile');
      }
    });
  }, [accessToken, router]);

  const handleSave = async () => {
    const token = accessToken;
    if (!token) return;
    setMessage('');
    setIsError(false);
    const res = await usersApi.updateMe(
      { name: name || undefined, email: email || undefined, phone: phone || undefined },
      token
    );
    if (res.success && res.data) {
      const updated = res.data as ProfileUser;
      setProfile(updated);
      setEditing(false);
      setMessage('Profile updated.');
      if (user) {
        setUser({ ...user, name: updated.name ?? user.name ?? '', email: updated.email ?? user.email });
      }
    } else {
      setMessage(res.error || 'Update failed');
      setIsError(true);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setName(profile?.name ?? '');
    setEmail(profile?.email ?? '');
    setPhone(profile?.phone ?? '');
    setMessage('');
  };

  const handleLogoutAll = () => {
    const t = accessToken;
    logout();
    router.push('/login');
    if (t) {
      authApi.logoutAll(t).catch(() => {});
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loading}>Loading…</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.wrap}>
        <h1 className={styles.title}>My profile</h1>
        {message && (
          <p className={isError ? `${styles.message} ${styles.messageError}` : styles.message}>
            {message}
          </p>
        )}
        <div className={styles.card}>
          {!editing ? (
            <>
              <div className={styles.field}>
                <span className={styles.label}>Name</span>
                <div className={styles.value}>{profile?.name ?? '—'}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Email</span>
                <div className={styles.value}>{profile?.email ?? '—'}</div>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Phone</span>
                <div className={styles.value}>{profile?.phone ?? '—'}</div>
              </div>
              <div className={styles.actions}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setEditing(true)}>
                  Edit profile
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="profile-name">Name</label>
                <input
                  id="profile-name"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="profile-email">Email</label>
                <input
                  id="profile-email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="profile-phone">Phone</label>
                <input
                  id="profile-phone"
                  className={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className={styles.actions}>
                <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
                  Save
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
        <div className={styles.footer}>
          <Link href="/bookings">My bookings</Link>
          <span style={{ margin: '0 0.5rem' }}>·</span>
          <button
            type="button"
            onClick={handleLogoutAll}
            style={{
              border: 'none',
              background: 'transparent',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--brand)',
            }}
          >
            Logout all devices
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
