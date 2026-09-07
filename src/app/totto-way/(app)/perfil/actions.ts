"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTwSessionOrNull } from "@/lib/totto-way/auth";
import { NAV_HREF } from "@/lib/totto-way/nav";

const PrefsSchema = z.object({
  locale: z.enum(["es", "en"]),
  dailyReminder: z.boolean(),
  leagueAlerts: z.boolean(),
});

export type PreferencesInput = z.infer<typeof PrefsSchema>;

/** Guarda idioma y avisos del colaborador. Solo toca su propia ficha. */
export async function updatePreferences(
  input: PreferencesInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getTwSessionOrNull();
  if (!session?.employee) return { ok: false, error: "Tu sesión expiró. Vuelve a ingresar." };

  const parsed = PrefsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Preferencias inválidas." };

  await prisma.twEmployee.update({
    where: { id: session.employee.id },
    data: {
      locale: parsed.data.locale,
      prefs: { dailyReminder: parsed.data.dailyReminder, leagueAlerts: parsed.data.leagueAlerts },
    },
  });

  revalidatePath(NAV_HREF.profile);
  return { ok: true };
}
