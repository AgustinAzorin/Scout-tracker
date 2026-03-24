import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!rawSupabaseUrl || !supabaseServiceRole) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

function normalizeSupabaseProjectUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;

  const match = value.match(/(?:postgres|db)\.([a-z0-9]+)\./i);
  if (match?.[1]) return `https://${match[1]}.supabase.co`;

  throw new Error("SUPABASE_URL must be an HTTPS project URL or include a recognizable project ref");
}

const supabaseUrl = normalizeSupabaseProjectUrl(rawSupabaseUrl);

export const db = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false }
});