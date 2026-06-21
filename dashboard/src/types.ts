export type Status = 'available' | 'no-slot' | 'error';

export interface CurrentStatusRow {
  slug: string;
  tab: string;
  name: string;
  status: Status;
  termin_raw: string | null;
  termin_date: string | null;
  error_message: string | null;
  checked_at: string;
}

export interface AvailabilityEventRow {
  id: number;
  slug: string;
  tab: string;
  name: string;
  previous_status: Status | null;
  new_status: Status;
  termin_raw: string | null;
  termin_date: string | null;
  error_message: string | null;
  transitioned_at: string;
}

export interface DailyAvailabilitySummaryRow {
  slug: string;
  tab: string;
  name: string;
  day: string;
  became_available_count: number;
  error_count: number;
}
