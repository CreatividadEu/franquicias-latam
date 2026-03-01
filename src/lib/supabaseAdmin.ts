import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_FRANCHISES_BUCKET =
  process.env.SUPABASE_FRANCHISES_BUCKET ?? "franchises";

let supabaseAdminClient: SupabaseClient | null | undefined;
const ensuredBuckets = new Set<string>();

export function getSupabaseAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  if (supabaseAdminClient !== undefined) {
    return supabaseAdminClient;
  }

  supabaseAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdminClient;
}

export function getFranchiseStorageBucket() {
  return DEFAULT_FRANCHISES_BUCKET;
}

export async function ensureFranchiseStorageBucket() {
  const client = getSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const bucket = getFranchiseStorageBucket();
  if (ensuredBuckets.has(bucket)) {
    return { client, bucket };
  }

  const { error } = await client.storage.getBucket(bucket);
  if (error) {
    const missingBucket =
      error.message.toLowerCase().includes("not found") ||
      error.message.toLowerCase().includes("does not exist");

    if (!missingBucket) {
      throw error;
    }

    const { error: createError } = await client.storage.createBucket(bucket, {
      public: true,
    });

    if (
      createError &&
      !createError.message.toLowerCase().includes("already exists")
    ) {
      throw createError;
    }
  }

  ensuredBuckets.add(bucket);
  return { client, bucket };
}
