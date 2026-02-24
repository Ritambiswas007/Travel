'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { aiApi } from '@/api/endpoints';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type ChatMessage = { role: 'user' | 'assistant'; text: string };

export default function AiPage() {
  const { accessToken } = useAuth();
  const [recContext, setRecContext] = useState('');
  const [recLoading, setRecLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<unknown[]>([]);

  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqContext, setFaqContext] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqLoading, setFaqLoading] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleGetRecommendations = async () => {
    setRecLoading(true);
    const res = await aiApi.recommendations(
      { context: recContext || undefined, limit: 6 },
      accessToken
    );
    setRecLoading(false);
    if (res.success && res.data) {
      const d = res.data as { recommendations?: unknown[] };
      setRecommendations(d.recommendations ?? []);
    }
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim()) return;
    setFaqLoading(true);
    const res = await aiApi.faq(
      { question: faqQuestion.trim(), context: faqContext || undefined },
      accessToken
    );
    setFaqLoading(false);
    if (res.success && res.data) {
      const d = res.data as { answer?: string };
      setFaqAnswer(d.answer ?? '');
    }
  };

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = chatInput.trim();
    if (!content) return;
    setChatInput('');
    setChatMessages((msgs) => [...msgs, { role: 'user', text: content }]);
    setChatLoading(true);
    const res = await aiApi.bookingAssistant(
      { query: content, context: undefined },
      accessToken
    );
    setChatLoading(false);
    if (res.success && res.data) {
      const d = res.data as { response?: string };
      setChatMessages((msgs) => [
        ...msgs,
        { role: 'user', text: content },
        { role: 'assistant', text: d.response ?? 'No response.' },
      ]);
    }
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem 3rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>AI assistant</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Get smart recommendations, quick answers, and booking help powered by your data.
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Recommendations</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Describe what you&apos;re looking for (budget, duration, type of trip) and we&apos;ll suggest packages.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              value={recContext}
              onChange={(e) => setRecContext(e.target.value)}
              placeholder="e.g. family trip under 20k for 5 days"
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--border, #e2e8f0)',
              }}
            />
            <button
              type="button"
              onClick={handleGetRecommendations}
              disabled={recLoading}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--brand, #1e293b)',
                color: '#fff',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {recLoading ? 'Loading…' : 'Get recommendations'}
            </button>
          </div>
          {recommendations.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem' }}>
              {recommendations.map((r: any, idx) => (
                <li
                  key={r.id ?? idx}
                  style={{
                    padding: '0.75rem 0',
                    borderBottom: '1px solid var(--border, #e2e8f0)',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{r.name ?? 'Package'}</div>
                  {r.city && (
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {r.city.name}, {r.city.country}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>FAQ</h2>
          <form onSubmit={handleFaqSubmit} style={{ marginBottom: '0.75rem' }}>
            <textarea
              value={faqQuestion}
              onChange={(e) => setFaqQuestion(e.target.value)}
              placeholder="Ask a question about visas, documents, or bookings…"
              rows={3}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--border, #e2e8f0)',
                marginBottom: '0.5rem',
              }}
            />
            <input
              type="text"
              value={faqContext}
              onChange={(e) => setFaqContext(e.target.value)}
              placeholder="Context (optional, e.g. country, package)"
              style={{
                width: '100%',
                padding: '0.4rem 0.75rem',
                borderRadius: 8,
                border: '1px solid var(--border, #e2e8f0)',
                marginBottom: '0.5rem',
                fontSize: '0.85rem',
              }}
            />
            <button
              type="submit"
              disabled={faqLoading}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--text)',
                color: '#fff',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {faqLoading ? 'Answering…' : 'Get answer'}
            </button>
          </form>
          {faqAnswer && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: 8,
                background: 'var(--bg-secondary)',
                fontSize: '0.9rem',
              }}
            >
              {faqAnswer}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Booking assistant</h2>
          <div
            style={{
              borderRadius: 12,
              border: '1px solid var(--border, #e2e8f0)',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              maxHeight: 260,
              overflowY: 'auto',
              fontSize: '0.9rem',
            }}
          >
            {chatMessages.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>
                Ask me to compare packages, suggest dates, or help with next steps in your booking.
              </p>
            ) : (
              chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: '0.5rem',
                    textAlign: m.role === 'user' ? 'right' : 'left',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.4rem 0.6rem',
                      borderRadius: 12,
                      background:
                        m.role === 'user' ? 'var(--brand, #1e293b)' : 'var(--bg-secondary)',
                      color: m.role === 'user' ? '#fff' : 'var(--text)',
                    }}
                  >
                    {m.text}
                  </span>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleChatSend} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask something about your trip…"
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: 999,
                border: '1px solid var(--border, #e2e8f0)',
              }}
            />
            <button
              type="submit"
              disabled={chatLoading}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 999,
                border: 'none',
                background: 'var(--brand, #1e293b)',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              {chatLoading ? 'Thinking…' : 'Send'}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}

