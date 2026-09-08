import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator } from "@/lib/totto-way/i18n";
import { Placeholder } from "../../_components/atoms";

export const dynamic = "force-dynamic";

/** Estudio de contenido (fase 3). Guard por rol desde ya. */
export default async function StudioPage() {
  const session = await requireTwSession({ roles: ["TW_FORMADOR", "ADMIN"] });
  const t = createTranslator(session.locale);
  return <Placeholder title={t("placeholder.title")} body={t("placeholder.body")} />;
}
