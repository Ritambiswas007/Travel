import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function OnlinePage() {
  return (
    <>
      <Header />
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <h1>Online Experiences</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Online experiences — coming soon.</p>
        <Link href="/">Browse stays</Link>
      </main>
      <Footer />
    </>
  );
}
