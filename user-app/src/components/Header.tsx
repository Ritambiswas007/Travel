'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/endpoints';
import styles from './Header.module.css';

const navItems = [
  { label: 'Stays', href: '/', icon: 'home' },
  { label: 'Bookings', href: '/bookings', icon: 'bookings' },
  { label: 'Support', href: '/support', icon: 'support' },
  { label: 'Visa', href: '/visa', icon: 'visa' },
  { label: 'Documents', href: '/documents', icon: 'documents' },
  { label: 'AI assistant', href: '/ai', icon: 'ai' },
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

  const handleLogout = () => {
    const t = accessToken;
    const rt = refreshToken;
    logout();
    setShowUserMenu(false);
    closeDrawer();
    router.push('/');
    router.refresh();
    if (t && rt) {
      authApi.logout(t, rt).catch(() => {});
    }
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
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <span className={styles.currency}>IND | ₹ INR</span>
          <div className={styles.userMenuWrap}>
            <button
              type="button"
              className={initialised && accessToken ? styles.accountBtn : styles.loginBtn}
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              aria-label="Account menu"
            >
              <AvatarIcon />
              <span>
                {!initialised || !accessToken
                  ? 'Login / Register'
                  : user?.name || user?.email || 'My Account'}
              </span>
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
                <div className={styles.userMenu} role="menu" onClick={(e) => e.stopPropagation()}>
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
                      <button
                        type="button"
                        className={styles.userMenuItem}
                        onClick={() => { setShowUserMenu(false); router.push('/profile'); }}
                        role="menuitem"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        className={styles.userMenuItem}
                        onClick={() => { setShowUserMenu(false); router.push('/bookings'); }}
                        role="menuitem"
                      >
                        My bookings
                      </button>
                      <button
                        type="button"
                        className={styles.userMenuItem}
                        onClick={() => { setShowUserMenu(false); router.push('/notifications'); }}
                        role="menuitem"
                      >
                        Notifications
                      </button>
                      <button
                        type="button"
                        className={styles.userMenuItem}
                        onClick={() => { handleLogout(); setShowUserMenu(false); }}
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

function NavIcon({ name }: { name: string }) {
  const size = 18;
  const props = { width: size, height: size, fill: 'currentColor', 'aria-hidden': true };
  switch (name) {
    case 'home':
      return <svg viewBox="0 0 24 24" {...props}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>;
    case 'bookings':
      return <svg viewBox="0 0 24 24" {...props}><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" /></svg>;
    case 'support':
      return <svg viewBox="0 0 24 24" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></svg>;
    case 'visa':
      return <svg viewBox="0 0 24 24" {...props}><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" /></svg>;
    case 'documents':
      return <svg viewBox="0 0 24 24" {...props}><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" /></svg>;
    case 'ai':
      return <svg viewBox="0 0 24 24" {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>;
    default:
      return null;
  }
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
