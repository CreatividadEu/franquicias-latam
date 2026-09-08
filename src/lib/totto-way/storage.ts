/**
 * Storage de Totto Way: bucket PRIVADO `totto-way-assets`. El Estudio sube por
 * URL firmada (el archivo va directo a Supabase, sin pasar por Vercel) y la
 * lectura se hace siempre con una URL firmada de corta vida desde el servidor.
 * Ningún objeto se sirve por URL pública: el manual y los videos de formación
 * son material interno de la marca.
 *
 * Mismo patrón que el bucket del Sandbox.
 */
import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const TOTTO_WAY_BUCKET = (process.env.SUPABASE_TOTTO_WAY_BUCKET ?? "totto-way-assets").trim();

/** Vida de las URLs firmadas de lectura, en segundos. */
export const SIGNED_READ_TTL = 60 * 30;

/** Lo que el Estudio puede subir, con su tamaño máximo. */
export const UPLOAD_KINDS = {
  PDF: { mime: ["application/pdf"], maxBytes: 40 * 1024 * 1024 },
  POSTER: { mime: ["image/png", "image/jpeg", "image/webp"], maxBytes: 8 * 1024 * 1024 },
  IMAGE: { mime: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"], maxBytes: 8 * 1024 * 1024 },
  VIDEO: { mime: ["video/mp4", "video/webm"], maxBytes: 500 * 1024 * 1024 },
  SUBTITLE: { mime: ["text/vtt"], maxBytes: 1 * 1024 * 1024 },
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;

export function isUploadKind(value: unknown): value is UploadKind {
  return typeof value === "string" && value in UPLOAD_KINDS;
}

export function acceptsMime(kind: UploadKind, mime: string): boolean {
  return (UPLOAD_KINDS[kind].mime as readonly string[]).includes(mime);
}

let ensured = false;

export async function ensureTottoWayBucket() {
  const client = getSupabaseAdminClient();
  if (!client) return null;
  if (ensured) return { client, bucket: TOTTO_WAY_BUCKET };

  const { data, error } = await client.storage.getBucket(TOTTO_WAY_BUCKET);
  if (error) {
    const missing =
      error.message.toLowerCase().includes("not found") || error.message.toLowerCase().includes("does not exist");
    if (!missing) throw error;
    const { error: createError } = await client.storage.createBucket(TOTTO_WAY_BUCKET, { public: false });
    if (createError && !createError.message.toLowerCase().includes("already exists")) throw createError;
  } else if (data?.public) {
    // Nunca público: el manual y los videos son material interno.
    const { error: updateError } = await client.storage.updateBucket(TOTTO_WAY_BUCKET, { public: false });
    if (updateError) console.warn("[totto-way/storage] no se pudo poner el bucket en privado:", updateError.message);
  }

  ensured = true;
  return { client, bucket: TOTTO_WAY_BUCKET };
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

export function assetStoragePath(franchiseId: string, kind: UploadKind, assetId: string, originalName: string): string {
  return `${franchiseId}/${kind.toLowerCase()}/${assetId}-${safeFileName(originalName)}`;
}

export async function createUploadUrl(path: string) {
  const storage = await ensureTottoWayBucket();
  if (!storage) throw new Error("Supabase storage no disponible: revisa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  const { data, error } = await storage.client.storage.from(storage.bucket).createSignedUploadUrl(path, { upsert: true });
  if (error || !data?.signedUrl) throw new Error(error?.message ?? "No se pudo firmar la subida");
  return { signedUrl: data.signedUrl, token: data.token, path: data.path };
}

/** URL firmada de lectura, de corta vida. Nunca se guarda en la base. */
export async function createReadUrl(path: string): Promise<string | null> {
  const storage = await ensureTottoWayBucket();
  if (!storage) return null;
  const { data, error } = await storage.client.storage.from(storage.bucket).createSignedUrl(path, SIGNED_READ_TTL);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function removeAsset(path: string): Promise<void> {
  const storage = await ensureTottoWayBucket();
  if (!storage) return;
  await storage.client.storage.from(storage.bucket).remove([path]);
}
