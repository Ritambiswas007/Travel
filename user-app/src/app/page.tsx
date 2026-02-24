import { Suspense } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { CategoryFilters } from '@/components/CategoryFilters';
import { PackageCard } from '@/components/PackageCard';
import { packagesApi } from '@/api/endpoints';
import type { PackageListItem } from '@/api/endpoints';
import styles from './page.module.css';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const featured = params?.featured === 'true';
  const cityId = typeof params?.cityId === 'string' ? params.cityId : undefined;
  const search = typeof params?.search === 'string' ? params.search : undefined;
  const page = Math.max(1, Number(params?.page) || 1);
  const limit = 24;

  const query: {
    page: number;
    limit: number;
    cityId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    search?: string;
  } = {
    page,
    limit,
    isActive: true,
  };

  if (featured) query.isFeatured = true;
  if (cityId) query.cityId = cityId;
  if (search) query.search = search;

  const res = await packagesApi.list(query);

  const raw = res.success && res.data ? res.data : { items: [] as PackageListItem[], total: 0 };
  let packages: PackageListItem[] = [];
  let total = 0;

  if (Array.isArray(raw)) {
    packages = raw;
    total = raw.length;
  } else if (raw && typeof raw === 'object') {
    const anyRaw = raw as { items?: PackageListItem[]; total?: number };
    packages = anyRaw.items ?? [];
    total = anyRaw.total ?? packages.length;
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroContent}>
              <p className={styles.heroEyebrow}>Travel &amp; Pilgrimage</p>
              <h1 className={styles.heroTitle}>
                Peaceful journeys,
                <br />
                planned with clarity.
              </h1>
              <p className={styles.heroSubtitle}>
                Discover curated stays and pilgrimage routes, compare options in one place, and keep every document and
                booking in sync.
              </p>
              <div className={styles.heroActions}>
                <Link href="/book" className={styles.heroPrimary}>
                  Explore stays
                </Link>
                <a href="#stays" className={styles.heroSecondary}>
                  Browse all packages
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="stays" className={styles.content}>
          <Suspense fallback={<div className={styles.filtersPlaceholder} />}>
            <CategoryFilters />
          </Suspense>

          <div className={styles.grid}>
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>

          {packages.length === 0 && (
            <div className={styles.empty}>
              <p>No stays match your filters.</p>
              <Link href="/">Clear filters</Link>
            </div>
          )}

          {packages.length > 0 && (
            <div className={styles.showMapWrap}>
              <button type="button" className={styles.showMapBtn}>
                <MapIcon /> Show map
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
    </svg>
  );
}
