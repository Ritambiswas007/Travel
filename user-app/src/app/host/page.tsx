import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function HostPage() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <h1>List your property</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Property listing is managed via the admin portal. Contact your administrator.
        </p>
        <Link href="/">Back to stays</Link>
      </main>
      <Footer />
    </>
  );
}
