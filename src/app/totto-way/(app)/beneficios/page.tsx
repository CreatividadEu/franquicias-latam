import { requireTwSession } from "@/lib/totto-way/auth";
import { createTranslator } from "@/lib/totto-way/i18n";
import { Placeholder } from "../../_components/atoms";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await requireTwSession();
  const t = createTranslator(session.locale);
  return <Placeholder title={t("placeholder.title")} body={t("placeholder.body")} />;
}
