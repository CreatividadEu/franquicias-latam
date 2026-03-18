import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEFAULT_FRANCHISES_BUCKET =
  (process.env.SUPABASE_FRANCHISES_BUCKET ?? "franchise-assets").trim();

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

  const { data: bucketData, error } = await client.storage.getBucket(bucket);
  if (error) {
    const missingBucket =
      error.message.toLowerCase().includes("not found") ||
      error.message.toLowerCase().includes("does not exist");

    if (!missingBucket) {
      throw error;
    }

    // Bucket doesn't exist — create it as public
    const { error: createError } = await client.storage.createBucket(bucket, {
      public: true,
    });

    if (
      createError &&
      !createError.message.toLowerCase().includes("already exists")
    ) {
      throw createError;
    }
  } else if (!bucketData?.public) {
    // Bucket exists but is private — make it public so stored URLs are accessible
    const { error: updateError } = await client.storage.updateBucket(bucket, { public: true });
    if (updateError) {
      console.warn("[supabaseAdmin] Could not set bucket to public:", updateError.message);
    }
  }

  ensuredBuckets.add(bucket);
  return { client, bucket };
}
