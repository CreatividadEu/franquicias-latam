import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator } from "@/lib/totto-way/i18n";
import { Placeholder } from "../../_components/atoms";

export const dynamic = "force-dynamic";

/** Panel líder (fase 2). Guard por rol desde ya. */
export default async function LeaderPage() {
  const session = await requireTwSession({ roles: ["TW_LIDER_TIENDA", "TW_JEFE_COMERCIAL", "FRANCHISE_OWNER", "TW_FORMADOR", "ADMIN"] });
  const t = createTranslator(session.locale);
  return <Placeholder title={t("placeholder.title")} body={t("placeholder.body")} />;
}
