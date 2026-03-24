#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function normalizeScoutNumbers() {
  console.log("Normalizing scout numbers...");

  const { data: scouts, error: fetchError } = await db
    .from("scouts")
    .select("id,numero,created_at")
    .eq("is_active", true)
    .order("numero", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (fetchError) {
    console.error("Failed to fetch scouts:", fetchError.message);
    process.exit(1);
  }

  if (!scouts || scouts.length === 0) {
    console.log("No active scouts found.");
    process.exit(0);
  }

  for (let i = 0; i < scouts.length; i += 1) {
    const scout = scouts[i];
    const numero = i + 1;

    const { error: updateError } = await db
      .from("scouts")
      .update({ numero })
      .eq("id", scout.id);

    if (updateError) {
      console.error(`Failed to update scout ${scout.id}:`, updateError.message);
      process.exit(1);
    }
  }

  console.log(`Done. ${scouts.length} scouts renumbered from 1 to ${scouts.length}.`);
}

normalizeScoutNumbers().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
