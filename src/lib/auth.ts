import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

// Resolve the secret lazily (at request time), not at module load. Importing
// this module during `next build` (page-data collection) must not throw when
// JWT_SECRET is absent; the secret is only required when a token is actually
// signed or verified.
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required. Set JWT_SECRET in the environment.");
  }
  return secret;
}

export function signToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(
  token: string
): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.role !== "ADMIN") return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.role !== "ADMIN") return null;
  return user;
}
