'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { PackageListItem } from '@/api/endpoints';
import styles from './PackageCard.module.css';

const FAV_KEY = 'travel_favorites';

function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const s = localStorage.getItem(FAV_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function toggleFavorite(id: string): void {
  const f = getFavorites();
  const i = f.indexOf(id);
  if (i >= 0) f.splice(i, 1);
  else f.push(id);
  localStorage.setItem(FAV_KEY, JSON.stringify(f));
  window.dispatchEvent(new Event('storage'));
}

export function PackageCard({ pkg }: { pkg: PackageListItem }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(getFavorites().includes(pkg.id));
    const onStorage = () => setFav(getFavorites().includes(pkg.id));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pkg.id]);

  const defaultVariant = pkg.variants?.find((v) => v.isDefault) ?? pkg.variants?.[0];
  const price = defaultVariant?.basePrice != null ? Number(defaultVariant.basePrice) : null;
  const currency = defaultVariant?.currency ?? 'INR';
  const location = pkg.city ? `${pkg.city.name}, ${pkg.city.country}` : '';

  const handleHeart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(pkg.id);
    setFav(!fav);
  };

  return (
    <Link href={`/packages/${pkg.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={
            pkg.imageUrl ||
            'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg?auto=compress&cs=tinysrgb&w=1200'
          }
          alt={pkg.name ?? ''}
          className={styles.image}
        />
        {pkg.isFeatured && (
          <span className={styles.guestFav}>Guest favourite</span>
        )}
        <button
          type="button"
          className={styles.heart}
          onClick={handleHeart}
          aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
        >
          <HeartIcon filled={fav} />
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.location}>{location || pkg.name || 'Package'}</div>
        <div className={styles.price}>
          {price != null ? (
            <>
              <span className={styles.amount}>
                {currency === 'INR' ? '₹' : '$'}
                {price.toLocaleString()}
              </span>
              <span className={styles.unit}> night</span>
            </>
          ) : (
            <span>Price on request</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'var(--brand)' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
