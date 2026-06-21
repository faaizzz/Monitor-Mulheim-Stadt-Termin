import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { AvailabilityEventRow, DailyAvailabilitySummaryRow } from '../types';

interface WindowRow {
  slug: string;
  tab: string;
  name: string;
  available_at: string;
  ended_at: string | null;
}

const RECENT_EVENTS_LIMIT = 200;

export default function History() {
  const [events, setEvents] = useState<AvailabilityEventRow[]>([]);
  const [summary, setSummary] = useState<DailyAvailabilitySummaryRow[]>([]);
  const [windows, setWindows] = useState<WindowRow[]>([]);
  const [tabFilter, setTabFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    supabase
      .from('availability_events')
      .select('*')
      .order('transitioned_at', { ascending: false })
      .limit(RECENT_EVENTS_LIMIT)
      .then(({ data, error }) => {
        if (error) console.error('Failed to load availability_events:', error.message);
        setEvents(data ?? []);
      });

    supabase
      .from('daily_availability_summary')
      .select('*')
      .then(({ data, error }) => {
        if (error) console.error('Failed to load daily_availability_summary:', error.message);
        setSummary(data ?? []);
      });

    supabase
      .from('availability_windows')
      .select('slug, tab, name, available_at, ended_at')
      .then(({ data, error }) => {
        if (error) console.error('Failed to load availability_windows:', error.message);
        setWindows(data ?? []);
      });
  }, []);

  const availabilityByTab = useMemo(() => {
    const totals = new Map<string, number>();
    for (const row of summary) {
      totals.set(row.tab, (totals.get(row.tab) ?? 0) + row.became_available_count);
    }
    return [...totals.entries()].map(([tab, count]) => ({ tab, count }));
  }, [summary]);

  const errorRateByAnliegen = useMemo(() => {
    const totals = new Map<string, { name: string; errors: number }>();
    for (const row of summary) {
      const existing = totals.get(row.slug);
      totals.set(row.slug, { name: row.name, errors: (existing?.errors ?? 0) + row.error_count });
    }
    return [...totals.values()]
      .filter((entry) => entry.errors > 0)
      .sort((a, b) => b.errors - a.errors)
      .slice(0, 10);
  }, [summary]);

  const avgWindowDurationByAnliegen = useMemo(() => {
    const totals = new Map<string, { name: string; totalMinutes: number; count: number }>();
    for (const row of windows) {
      if (!row.ended_at) continue; // still open, no duration yet
      const minutes = (new Date(row.ended_at).getTime() - new Date(row.available_at).getTime()) / 60000;
      const existing = totals.get(row.slug);
      totals.set(row.slug, {
        name: row.name,
        totalMinutes: (existing?.totalMinutes ?? 0) + minutes,
        count: (existing?.count ?? 0) + 1,
      });
    }
    return [...totals.values()]
      .map((entry) => ({ name: entry.name, avgMinutes: Math.round(entry.totalMinutes / entry.count) }))
      .sort((a, b) => b.avgMinutes - a.avgMinutes)
      .slice(0, 10);
  }, [windows]);

  const filteredEvents = useMemo(() => {
    let result = events;
    if (tabFilter !== 'all') result = result.filter((e) => e.tab === tabFilter);
    if (statusFilter !== 'all') result = result.filter((e) => e.new_status === statusFilter);
    return [...result].sort((a, b) =>
      sortDesc
        ? b.transitioned_at.localeCompare(a.transitioned_at)
        : a.transitioned_at.localeCompare(b.transitioned_at)
    );
  }, [events, tabFilter, statusFilter, sortDesc]);

  const tabs = useMemo(() => [...new Set(events.map((e) => e.tab))], [events]);

  return (
    <div className="history">
      <section className="chart-card">
        <h2>Times became available, per tab</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={availabilityByTab}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tab" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#1d7a4c" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card">
        <h2>Average availability-window duration (minutes), top 10</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={avgWindowDurationByAnliegen} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" width={220} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="avgMinutes" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="chart-card">
        <h2>Error counts per Anliegen, top 10 (possible selector drift)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={errorRateByAnliegen} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" width={220} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="errors" fill="#9a6400" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="events-table-card">
        <h2>Recent events</h2>
        <div className="filters">
          <select value={tabFilter} onChange={(e) => setTabFilter(e.target.value)}>
            <option value="all">All tabs</option>
            {tabs.map((tab) => (
              <option key={tab} value={tab}>
                {tab}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="no-slot">No slot</option>
            <option value="error">Error</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th onClick={() => setSortDesc((v) => !v)} className="sortable">
                Time {sortDesc ? '↓' : '↑'}
              </th>
              <th>Anliegen</th>
              <th>Previous</th>
              <th>New status</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id} className={`row-${event.new_status}`}>
                <td>{new Date(event.transitioned_at).toLocaleString()}</td>
                <td>{event.name}</td>
                <td>{event.previous_status ?? '—'}</td>
                <td>{event.new_status}</td>
                <td>{event.new_status === 'available' ? event.termin_raw : event.error_message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
