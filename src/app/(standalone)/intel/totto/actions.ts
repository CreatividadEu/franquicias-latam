"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { INTEL_COOKIE } from "./gate-config";

const ROUTE = "/intel/totto";

export async function submitPasscode(formData: FormData) {
  const expected = process.env.INTEL_PASSCODE;
  const given = String(formData.get("code") ?? "");

  if (!expected || given !== expected) redirect(`${ROUTE}?e=1`);

  const store = await cookies();
  store.set(INTEL_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: ROUTE,
    maxAge: 60 * 60 * 12,
  });

  redirect(ROUTE);
}
