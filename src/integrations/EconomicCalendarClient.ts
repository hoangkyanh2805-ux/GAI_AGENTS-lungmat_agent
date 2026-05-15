import axios from 'axios';
import { FileLogger } from '../memory/FileLogger';

export interface CalendarEvent {
  title: string;
  country: string;
  date_iso: string;
  impact: 'High' | 'Medium' | 'Low' | 'Holiday';
  forecast?: string;
  previous?: string;
  hours_until?: number;
}

const FF_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';

export const EconomicCalendarClient = {
  async getUpcomingEvents(opts: { hoursAhead?: number; currency?: string; minImpact?: 'High' | 'Medium' } = {}): Promise<CalendarEvent[]> {
    const hoursAhead = opts.hoursAhead ?? 24;
    const currency   = opts.currency   ?? 'USD';
    const minImpact  = opts.minImpact  ?? 'High';

    try {
      const { data } = await axios.get(FF_URL, {
        timeout: 10_000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!Array.isArray(data)) {
        FileLogger.error('[EconomicCalendar] unexpected response shape', { type: typeof data });
        return [];
      }

      const now = Date.now();
      const cutoff = now + hoursAhead * 3600 * 1000;
      const impactPriority: Record<string, number> = { Low: 1, Medium: 2, High: 3, Holiday: 0 };
      const minPriority = impactPriority[minImpact] ?? 3;

      const events: CalendarEvent[] = [];
      for (const raw of data as Array<Record<string, unknown>>) {
        const dateStr = String(raw.date ?? '');
        const t = Date.parse(dateStr);
        if (isNaN(t) || t < now || t > cutoff) continue;
        const impact = String(raw.impact ?? 'Low');
        if ((impactPriority[impact] ?? 0) < minPriority) continue;
        const country = String(raw.country ?? '');
        if (currency && country !== currency) continue;

        events.push({
          title:    String(raw.title ?? '').trim(),
          country,
          date_iso: new Date(t).toISOString(),
          impact:   impact as CalendarEvent['impact'],
          forecast: raw.forecast ? String(raw.forecast) : undefined,
          previous: raw.previous ? String(raw.previous) : undefined,
          hours_until: Math.round((t - now) / 3600_000 * 10) / 10,
        });
      }
      events.sort((a, b) => a.date_iso.localeCompare(b.date_iso));
      FileLogger.info('[EconomicCalendar] fetched', { count: events.length, currency, hoursAhead });
      return events;
    } catch (err) {
      FileLogger.error('[EconomicCalendar] fetch failed', err);
      return [];
    }
  },
};
