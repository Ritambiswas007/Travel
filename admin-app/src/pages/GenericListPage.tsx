import type { ReactNode } from 'react';

type Props = {
  title: string;
  loading?: boolean;
  error?: string;
  children: ReactNode;
};

export function GenericListPage({ title, loading, error, children }: Props) {
  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error">{error}</p>;
  return (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  );
}
