'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { documentsUserApi, type DocumentType, type UserDocument } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function DocumentsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [myDocs, setMyDocs] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState('');

  const loadData = () => {
    if (!accessToken) return;
    Promise.all([
      documentsUserApi.listTypes(),
      documentsUserApi.listMy(accessToken),
    ]).then(([typesRes, docsRes]) => {
      setLoading(false);
      if (typesRes.success && typesRes.data) {
        const d = typesRes.data as { items?: DocumentType[] } | DocumentType[];
        const arr = Array.isArray(d) ? d : (d.items ?? []);
        setTypes(arr);
        if (arr.length && !selectedTypeId) setSelectedTypeId(arr[0].id);
      }
      if (docsRes.success && docsRes.data) {
        const d = docsRes.data as { items?: UserDocument[] } | UserDocument[];
        setMyDocs(Array.isArray(d) ? d : (d.items ?? []));
      }
    });
  };

  useEffect(() => {
    if (!accessToken) {
      router.push('/login?redirect=/documents');
      return;
    }
    loadData();
  }, [accessToken, router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedTypeId || !selectedFile) {
      setUploadError('Select a document type and a file.');
      return;
    }
    setUploadError('');
    setUploadSuccess('');
    setUploading(true);
    const res = await documentsUserApi.upload(selectedTypeId, selectedFile, accessToken);
    setUploading(false);
    if (res.success && res.data) {
      setMyDocs((prev) => [res.data!, ...prev]);
      setSelectedFile(null);
      setUploadSuccess('Document uploaded.');
    } else {
      setUploadError(res.error || 'Upload failed');
    }
  };

  const handleChecklistPdf = () => {
    if (!accessToken) return;
    setPdfError('');
    documentsUserApi.checklistPdf(accessToken).then((r) => {
      if (r.ok) {
        r.blob().then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'document-checklist.pdf';
          a.click();
          URL.revokeObjectURL(url);
        });
      } else {
        setPdfError('Could not generate checklist PDF.');
      }
    });
  };

  if (!accessToken) return null;

  return (
    <>
      <Header />
      <main className="page-shell">
        <header className="page-header">
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">Upload documents, view your submissions, and download the checklist.</p>
        </header>
        {loading ? (
          <p className="page-empty">Loading…</p>
        ) : (
          <div className="page-stack">
            <section className="page-card">
              <div className="page-card-header">Download checklist</div>
              <button type="button" onClick={handleChecklistPdf} className="primary-btn">
                Download checklist PDF
              </button>
              {pdfError && (
                <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>{pdfError}</p>
              )}
            </section>

            <section className="page-card">
              <div className="page-card-header">Upload document</div>
              <form onSubmit={handleUpload}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Document type
                  <select
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      marginTop: '0.25rem',
                      border: '1px solid var(--border, #e2e8f0)',
                      borderRadius: 8,
                    }}
                  >
                    {types.length === 0 && <option value="">— Select —</option>}
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name ?? t.code ?? t.id}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'block', marginBottom: '0.75rem' }}>
                  File (PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX, max 10MB)
                  <input
                    id="doc-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    required
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0',
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                    }}
                  />
                </label>
                {uploadError && (
                  <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{uploadError}</p>
                )}
                {uploadSuccess && (
                  <p style={{ color: '#16a34a', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{uploadSuccess}</p>
                )}
                <button type="submit" disabled={uploading} className="primary-btn">
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              </form>
            </section>

            <section className="page-card">
              <div className="page-card-header">My documents</div>
              {myDocs.length === 0 ? (
                <p className="page-empty">No documents uploaded yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {myDocs.map((d) => (
                    <li
                      key={d.id}
                      style={{
                        padding: '0.75rem 0',
                        borderBottom: '1px solid var(--border, #e2e8f0)',
                        fontSize: '0.875rem',
                      }}
                    >
                      <Link href={`/documents/${d.id}`} style={{ fontWeight: 600 }}>
                        {d.documentType?.name ?? d.documentType?.code ?? 'Document'}
                      </Link>
                      <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>{d.status ?? '—'}</span>
                      {d.createdAt && (
                        <span style={{ marginLeft: '0.5rem' }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
