import { createBrowserClient } from "@supabase/ssr";

// Note: the Database type in ./database.types.ts documents the schema shape
// for reference, but isn't passed as a generic here — supabase-js's strict
// GenericTable constraints don't structurally match hand-written row types
// without significant boilerplate. Each api/*.ts function casts its result
// to the correct domain type instead.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True once real Supabase credentials are configured via env vars. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Lazily creates a singleton browser Supabase client. Returns null when the
 * app hasn't been configured with real project credentials yet, so callers
 * can fall back to local mock state during development.
 */
export function getSupabaseClient() {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
  }
  return browserClient;
}
