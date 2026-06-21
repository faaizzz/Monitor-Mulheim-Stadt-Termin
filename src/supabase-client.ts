import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to run the sync job');
  }
  return createClient(url, serviceRoleKey);
}
