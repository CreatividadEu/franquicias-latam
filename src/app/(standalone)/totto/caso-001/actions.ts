"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CASO001_COOKIE, CASO001_ROUTE } from "./gate-config";

export async function submitCaso001Passcode(formData: FormData) {
  const expected = process.env.TOTTO_CASO001_PASSCODE;
  const given = String(formData.get("code") ?? "");

  if (!expected || given !== expected) redirect(`${CASO001_ROUTE}?e=1`);

  const store = await cookies();
  store.set(CASO001_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: CASO001_ROUTE,
    // Una jornada de presentación. Pasado ese tiempo, se vuelve a pedir.
    maxAge: 60 * 60 * 12,
  });

  redirect(CASO001_ROUTE);
}
