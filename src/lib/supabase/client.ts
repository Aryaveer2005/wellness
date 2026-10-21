"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Supabase is optional. Without these env vars the app runs fully on-device.
// The anon key is designed to be public (Row Level Security protects data).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let browserClient: SupabaseClient | null = null;

/** Returns the browser Supabase client, or null when Supabase isn't configured. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!browserClient) browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
