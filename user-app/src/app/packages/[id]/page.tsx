import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { packagesApi } from '@/api/endpoints';
import styles from './page.module.css';

type Pkg = {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  summary?: string;
  imageUrl?: string | null;
  isFeatured?: boolean;
  city?: { name: string; country: string } | null;
  variants?: { id: string; name: string; basePrice: string; currency: string; durationDays: number; isDefault?: boolean }[];
  itineraries?: { dayNumber: number; title: string; description?: string }[];
  schedules?: { startDate: string; endDate: string; availableSeats: number }[];
};

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await packagesApi.getById(id);
  const pkg = res.success && res.data ? (res.data as Pkg) : null;

  if (!pkg) {
    return (
      <>
        <Header />
        <div className={styles.container}>
          <p>Package not found.</p>
          <Link href="/">Browse stays</Link>
        </div>
        <Footer />
      </>
    );
  }

  const defaultVariant = pkg.variants?.find((v) => v.isDefault) ?? pkg.variants?.[0];
  const price = defaultVariant ? Number(defaultVariant.basePrice) : null;
  const currency = defaultVariant?.currency ?? 'INR';

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.hero}>
          {pkg.imageUrl ? (
            <img
              src={pkg.imageUrl}
              alt={pkg.name ?? ''}
              className={styles.heroImage}
            />
          ) : (
            <div className={styles.heroPlaceholder}>No image</div>
          )}
        </div>

        <div className={styles.content}>
          <div className={styles.primary}>
            <div className={styles.head}>
              <h1 className={styles.title}>{pkg.name ?? 'Package'}</h1>
              <div className={styles.location}>
                {pkg.city ? `${pkg.city.name}, ${pkg.city.country}` : ''}
              </div>
            </div>
            {pkg.summary && <p className={styles.summary}>{pkg.summary}</p>}
            {pkg.description && (
              <div className={styles.description}>
                <h2>About this stay</h2>
                <p>{pkg.description}</p>
              </div>
            )}
            {pkg.itineraries && pkg.itineraries.length > 0 && (
              <div className={styles.itinerary}>
                <h2>Itinerary</h2>
                <ul>
                  {pkg.itineraries.map((day) => (
                    <li key={day.dayNumber}>
                      <strong>Day {day.dayNumber}:</strong> {day.title}
                      {day.description && ` — ${day.description}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.card}>
              {price != null && (
                <div className={styles.priceRow}>
                  <span className={styles.price}>
                    {currency === 'INR' ? '₹' : '$'}
                    {price.toLocaleString()}
                  </span>
                  <span className={styles.priceUnit}> night</span>
                </div>
              )}
              <Link href={`/book?packageId=${pkg.id}`} className={styles.reserveBtn}>
                Reserve
              </Link>
              <p className={styles.noCharge}>You won&apos;t be charged yet</p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
