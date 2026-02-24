'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { documentsUserApi, type UserDocument } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { accessToken } = useAuth();
  const [doc, setDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken || !id) {
      if (!accessToken) router.push('/login?redirect=/documents/' + id);
      return;
    }
    documentsUserApi.getById(id, accessToken).then((r) => {
      setLoading(false);
      if (r.success && r.data) setDoc(r.data as UserDocument);
      else setError((r as { error?: string }).error || 'Document not found');
    });
  }, [accessToken, id, router]);

  if (!accessToken) return null;

  if (loading && !doc) {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
          <p>Loading…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !doc) {
    return (
      <>
        <Header />
        <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
          <p style={{ color: '#dc2626' }}>{error || 'Document not found'}</p>
          <Link href="/documents" style={{ color: 'var(--brand)' }}>← Back to documents</Link>
        </main>
        <Footer />
      </>
    );
  }

  const typeName = doc.documentType?.name ?? doc.documentType?.code ?? 'Document';

  return (
    <>
      <Header />
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          <Link href="/documents" style={{ color: 'var(--brand)' }}>← My documents</Link>
        </p>
        <h1 style={{ marginBottom: '0.5rem' }}>{typeName}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Status: <strong>{doc.status ?? '—'}</strong>
          {doc.createdAt && ` · Uploaded ${new Date(doc.createdAt).toLocaleDateString()}`}
        </p>
        {doc.fileUrl && (
          <p style={{ marginBottom: '1rem' }}>
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--brand, #1e293b)',
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Open / download file
            </a>
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
