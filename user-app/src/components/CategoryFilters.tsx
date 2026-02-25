'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { citiesApi } from '@/api/endpoints';
import styles from './CategoryFilters.module.css';

type City = { id: string; name: string; slug?: string; country?: string };

export function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityId = searchParams.get('cityId') ?? '';
  const [cities, setCities] = useState<City[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    citiesApi
      .list({ limit: 50 })
      .then((r) => {
        if (r.success && r.data && typeof r.data === 'object' && 'items' in r.data) {
          setCities((r.data as { items: City[] }).items ?? []);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const setFilter = (id: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (id === 'all') {
      next.delete('cityId');
    } else {
      next.set('cityId', id);
    }
    setDropdownOpen(false);
    router.push(`/?${next.toString()}`, { scroll: false });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.filterTriggerWrap} ref={dropdownRef}>
        <button
          type="button"
          className={styles.filtersBtn}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          aria-haspopup="listbox"
          aria-label="Filter by city"
        >
          <FiltersIcon /> Filter by city {dropdownOpen ? '▴' : '▾'}
        </button>
        {dropdownOpen && (
          <div className={styles.dropdown} role="listbox">
            <button
              type="button"
              className={!cityId ? `${styles.dropdownItem} ${styles.active}` : styles.dropdownItem}
              onClick={() => setFilter('all')}
              role="option"
              aria-selected={!cityId}
            >
              All
            </button>
            {cities.map((c) => (
              <button
                key={c.id}
                type="button"
                className={cityId === c.id ? `${styles.dropdownItem} ${styles.active}` : styles.dropdownItem}
                onClick={() => setFilter(c.id)}
                role="option"
                aria-selected={cityId === c.id}
              >
                {c.name}
              </button>
            ))}
            {cities.length === 0 && (
              <div className={styles.dropdownEmpty}>Loading cities…</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FiltersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
    </svg>
  );
}
