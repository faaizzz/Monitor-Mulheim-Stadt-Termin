import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TAB_ORDER } from '../tabSlugs';
import { CurrentStatusRow } from '../types';

function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function StatusBadge({ status }: { status: CurrentStatusRow['status'] }) {
  const label = status === 'available' ? 'Available' : status === 'no-slot' ? 'No slot' : 'Error';
  return <span className={`badge badge-${status}`}>{label}</span>;
}

export default function CurrentStatus() {
  const [rows, setRows] = useState<CurrentStatusRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    supabase
      .from('current_status')
      .select('*')
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) console.error('Failed to load current_status:', error.message);
        setRows(data ?? []);
        setLoading(false);
      });

    const channel = supabase
      .channel('current_status_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'current_status' },
        (payload) => {
          const updated = payload.new as CurrentStatusRow;
          setRows((prev) => {
            const next = prev.filter((row) => row.slug !== updated.slug);
            next.push(updated);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <p className="muted">Loading…</p>;

  const byTab = new Map<string, CurrentStatusRow[]>();
  for (const row of rows) {
    byTab.set(row.tab, [...(byTab.get(row.tab) ?? []), row]);
  }

  return (
    <div className="tab-grid">
      {TAB_ORDER.filter((tab) => byTab.has(tab)).map((tab) => (
        <section className="tab-card" key={tab}>
          <h2>{tab}</h2>
          <div className="card-grid">
            {byTab
              .get(tab)!
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((row) => (
                <div className={`anliegen-card row-${row.status}`} key={row.slug}>
                  <div className="anliegen-name">{row.name}</div>
                  <StatusBadge status={row.status} />
                  {row.status === 'available' && row.termin_raw && (
                    <div className="termin">{row.termin_raw}</div>
                  )}
                  <div className="checked-at muted">checked {timeAgo(row.checked_at)}</div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
