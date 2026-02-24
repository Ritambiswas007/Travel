'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { citiesApi } from '@/api/endpoints';
import styles from './CategoryFilters.module.css';

type City = { id: string; name: string; slug?: string; country?: string };

export function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cityId = searchParams.get('cityId') ?? '';
  const [cities, setCities] = useState<City[]>([]);

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

  const setFilter = (id: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (id === 'all') {
      next.delete('cityId');
    } else {
      next.set('cityId', id);
    }
    router.push(`/?${next.toString()}`, { scroll: false });
  };

  const isActive = (id: string) => {
    if (id === 'all') return !cityId;
    return cityId === id;
  };

  const categories = [
    { id: 'all', label: 'All' },
    ...cities.map((c) => ({ id: c.id, label: c.name })),
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.scroll}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id)}
            className={isActive(cat.id) ? `${styles.item} ${styles.active}` : styles.item}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <button type="button" className={styles.filtersBtn}>
        <FiltersIcon /> Filters
      </button>
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
