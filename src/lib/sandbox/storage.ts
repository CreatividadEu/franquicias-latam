/**
 * Storage del Sandbox: bucket PRIVADO `sandbox-assets` (§2). El admin sube
 * por URL firmada (el archivo va directo a Supabase, sin pasar por Vercel) y
 * solo el servidor, con service role, lee los objetos. La ruta pública jamás
 * recibe una URL de estos archivos.
 */
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const SANDBOX_BUCKET = (process.env.SUPABASE_SANDBOX_BUCKET ?? "sandbox-assets").trim();

let ensured = false;

export async function ensureSandboxBucket() {
  const client = getSupabaseAdminClient();
  if (!client) return null;
  if (ensured) return { client, bucket: SANDBOX_BUCKET };

  const { data, error } = await client.storage.getBucket(SANDBOX_BUCKET);
  if (error) {
    const missing =
      error.message.toLowerCase().includes("not found") ||
      error.message.toLowerCase().includes("does not exist");
    if (!missing) throw error;
    const { error: createError } = await client.storage.createBucket(SANDBOX_BUCKET, { public: false });
    if (createError && !createError.message.toLowerCase().includes("already exists")) {
      throw createError;
    }
  } else if (data?.public) {
    // Nunca público: los documentos del cliente no salen por URL abierta.
    const { error: updateError } = await client.storage.updateBucket(SANDBOX_BUCKET, { public: false });
    if (updateError) {
      console.warn("[sandbox/storage] No se pudo poner el bucket en privado:", updateError.message);
    }
  }

  ensured = true;
  return { client, bucket: SANDBOX_BUCKET };
}

export function safeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) : "";
  const slug =
    base
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "archivo";
  return ext ? `${slug}.${ext}` : slug;
}

export function assetStoragePath(sessionId: string, assetId: string, originalName: string): string {
  return `sessions/${sessionId}/${assetId}-${safeFileName(originalName)}`;
}

export async function createAssetUploadUrl(path: string) {
  const storage = await ensureSandboxBucket();
  if (!storage) throw new Error("Supabase storage no disponible: revisa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  const { data, error } = await storage.client.storage.from(storage.bucket).createSignedUploadUrl(path, { upsert: true });
  if (error || !data?.signedUrl) throw new Error(error?.message ?? "No se pudo firmar la subida");
  return { signedUrl: data.signedUrl, token: data.token, path: data.path };
}

export async function downloadAssetBuffer(path: string): Promise<Buffer> {
  const storage = await ensureSandboxBucket();
  if (!storage) throw new Error("Supabase storage no disponible");
  const { data, error } = await storage.client.storage.from(storage.bucket).download(path);
  if (error || !data) throw new Error(`No se pudo descargar el archivo (${error?.message ?? "desconocido"}). ¿Terminó la subida?`);
  return Buffer.from(await data.arrayBuffer());
}

export async function deleteAssetObject(path: string): Promise<void> {
  const storage = await ensureSandboxBucket();
  if (!storage) return;
  const { error } = await storage.client.storage.from(storage.bucket).remove([path]);
  if (error) console.warn("[sandbox/storage] No se pudo borrar el objeto:", path, error.message);
}

/** URL firmada de corta vida para que el ADMIN revise un documento. */
export async function createAssetDownloadUrl(path: string, downloadName: string, expiresSec = 120): Promise<string> {
  const storage = await ensureSandboxBucket();
  if (!storage) throw new Error("Supabase storage no disponible");
  const { data, error } = await storage.client.storage
    .from(storage.bucket)
    .createSignedUrl(path, expiresSec, { download: downloadName });
  if (error || !data?.signedUrl) throw new Error(error?.message ?? "No se pudo firmar la descarga");
  return data.signedUrl;
}
