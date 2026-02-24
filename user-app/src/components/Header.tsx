'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/endpoints';
import styles from './Header.module.css';

const navItems = [
  { label: 'Stays', href: '/' },
  { label: 'Bookings', href: '/bookings' },
  { label: 'Support', href: '/support' },
  { label: 'Visa', href: '/visa' },
  { label: 'Documents', href: '/documents' },
  { label: 'AI assistant', href: '/ai' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { user, accessToken, refreshToken, logout } = useAuth();
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    setInitialised(true);
  }, []);

  useEffect(() => {
    if (showDrawer) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDrawer]);

  const closeDrawer = () => setShowDrawer(false);

  const handleLogout = async () => {
    if (accessToken && refreshToken) {
      await authApi.logout(accessToken, refreshToken);
    }
    logout();
    setShowUserMenu(false);
    closeDrawer();
    router.push('/');
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          Travel<span className={styles.logoDot}>.</span>Pilgrimage
        </Link>

        <nav className={styles.navMain} aria-label="Main">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? `${styles.navItem} ${styles.active}` : styles.navItem}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <div className={styles.userMenuWrap}>
            <button
              type="button"
              className={styles.userMenuBtn}
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              aria-label="Account menu"
            >
              <MenuIcon />
              <AvatarIcon />
            </button>
            {showUserMenu && (
              <>
                <div
                  className={styles.backdrop}
                  role="presentation"
                  aria-hidden
                  onClick={() => setShowUserMenu(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 98 }}
                />
                <div className={styles.userMenu} role="menu">
                  {!initialised || !accessToken ? (
                    <>
                      <Link href="/login" onClick={() => setShowUserMenu(false)} role="menuitem">
                        Sign in
                      </Link>
                      <Link href="/register" onClick={() => setShowUserMenu(false)} role="menuitem">
                        Sign up
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className={styles.userMenuSignedIn}>
                        Signed in as <strong>{user?.name || user?.email}</strong>
                      </div>
                      <hr />
                      <Link href="/profile" onClick={() => setShowUserMenu(false)} role="menuitem">
                        Profile
                      </Link>
                      <Link href="/bookings" onClick={() => setShowUserMenu(false)} role="menuitem">
                        My bookings
                      </Link>
                      <Link href="/notifications" onClick={() => setShowUserMenu(false)} role="menuitem">
                        Notifications
                      </Link>
                      <button
                        type="button"
                        className={styles.userMenuItem}
                        onClick={handleLogout}
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setShowDrawer(!showDrawer)}
            aria-expanded={showDrawer}
            aria-label="Open menu"
          >
            {showDrawer ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      <div
        className={`${styles.overlay} ${showDrawer ? styles.open : ''}`}
        role="presentation"
        aria-hidden
        onClick={closeDrawer}
      />

      <aside
        className={`${styles.drawer} ${showDrawer ? styles.open : ''}`}
        aria-label="Mobile menu"
        aria-hidden={!showDrawer}
      >
        <div className={styles.drawerHeader}>
          <Link href="/" className={styles.logo} onClick={closeDrawer}>
            Travel<span className={styles.logoDot}>.</span>Pilgrimage
          </Link>
          <button
            type="button"
            className={styles.drawerClose}
            onClick={closeDrawer}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>
        <nav className={styles.drawerNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? `${styles.drawerNavLink} ${styles.active}` : styles.drawerNavLink}
              onClick={closeDrawer}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.drawerUser}>
          {!initialised || !accessToken ? (
            <>
              <Link href="/login" onClick={closeDrawer}>Sign in</Link>
              <Link href="/register" onClick={closeDrawer}>Sign up</Link>
            </>
          ) : (
            <>
              <div className={styles.drawerUserSignedIn}>
                Signed in as <strong>{user?.name || user?.email}</strong>
              </div>
              <Link href="/profile" onClick={closeDrawer}>Profile</Link>
              <Link href="/bookings" onClick={closeDrawer}>My bookings</Link>
              <Link href="/notifications" onClick={closeDrawer}>Notifications</Link>
              <button type="button" className={`${styles.drawerUserItem} ${styles.logout}`} onClick={handleLogout}>
                Sign out
              </button>
            </>
          )}
        </div>
      </aside>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
}

function AvatarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
      <path d="M16 16c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}
