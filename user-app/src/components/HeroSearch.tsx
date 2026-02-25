'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import styles from '@/app/page.module.css';

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}
function CalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

export function HeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [destination, setDestination] = useState(() => searchParams.get('search') ?? '');
  const [dateValue, setDateValue] = useState(() => searchParams.get('from') ?? '');

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (destination.trim()) params.set('search', destination.trim());
    else params.delete('search');
    if (dateValue) params.set('from', dateValue);
    else params.delete('from');
    params.delete('page');
    startTransition(() => {
      router.push(`/?${params.toString()}#stays`);
      setTimeout(() => document.getElementById('stays')?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  };

  return (
    <div className={styles.heroSearch}>
      <label className={styles.heroSearchInput} style={{ flex: 1, minWidth: 140 }}>
        <PinIcon />
        <input
          type="text"
          placeholder="Find Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 0, outline: 'none', fontSize: 'inherit' }}
        />
      </label>
      <span className={styles.heroSearchDivider} />
      <label className={styles.heroSearchInput} style={{ flex: 1, minWidth: 140, position: 'relative' }}>
        <CalIcon />
        {!dateValue && (
          <span style={{ position: 'absolute', left: '2.5rem', color: 'var(--text-muted)', pointerEvents: 'none' }}>
            Anytime
          </span>
        )}
        <input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          title="Travel date (optional)"
          style={{
            border: 'none',
            background: 'transparent',
            flex: 1,
            minWidth: 0,
            outline: 'none',
            fontSize: 'inherit',
            position: 'relative',
            zIndex: 1,
            color: dateValue ? 'var(--text)' : 'transparent',
          }}
        />
      </label>
      <button
        type="button"
        className={styles.heroSearchBtn}
        onClick={handleSearch}
        disabled={isPending}
      >
        <SearchIcon /> {isPending ? 'Searching…' : 'Search'}
      </button>
    </div>
  );
}
