import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getTwSession } from "@/lib/totto-way/auth";
import { createTranslator } from "@/lib/totto-way/i18n";
import { safeNextPath, TW_HOME_PATH, TW_SSO_PATH } from "@/lib/totto-way/paths";
import { LoginForm } from "../_components/LoginForm";

export const metadata: Metadata = { title: "Ingreso" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ next?: string; error?: string }>;

export default async function TottoWayLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  // Con sesión válida no tiene sentido ver el login.
  const session = await getTwSession();
  if (session) redirect(next ?? TW_HOME_PATH);

  const t = createTranslator("es");
  const initialError = params.error === "sso" ? t("login.errorSso") : null;

  return (
    <main className="tw-login">
      <section className="tw-login__visual" aria-hidden>
        <Image src="/totto-way/photo-mision.png" alt="" fill sizes="50vw" priority className="tw-login__photo" />
        <div className="tw-login__scrim" />
        <div className="tw-login__brand">
          <Image src="/totto-way/logo-white.png" alt="TOTTO" width={120} height={32} style={{ height: 28, width: "auto" }} />
          <span className="tw-eyebrow tw-eyebrow--yellow">{t("login.eyebrow")}</span>
        </div>
        <p className="tw-login__motto">
          {t("brand.mottoLine1")}
          <br />
          <em>{t("brand.mottoLine2")}</em>
        </p>
      </section>

      <section className="tw-login__form">
        <div className="tw-login__panel">
          <div style={{ display: "grid", gap: 8 }}>
            <span className="tw-eyebrow">{t("login.title")}</span>
            <h1>{t("brand.name")}</h1>
            <p className="tw-muted">{t("login.subtitle")}</p>
          </div>
          <LoginForm
            next={next}
            initialError={initialError}
            copy={{
              identifier: t("login.identifier"),
              identifierPlaceholder: t("login.identifierPlaceholder"),
              password: t("login.password"),
              passwordPlaceholder: t("login.passwordPlaceholder"),
              submit: t("login.submit"),
              submitting: t("login.submitting"),
              forgot: t("login.forgot"),
              forgotHint: t("login.forgotHint"),
              errorGeneric: t("login.errorGeneric"),
              errorNetwork: t("login.errorNetwork"),
              errorNoAccess: t("login.errorNoAccess"),
            }}
          />
          <p className="tw-small tw-muted">
            <a className="tw-link" href={`${TW_SSO_PATH}?next=${encodeURIComponent(next ?? TW_HOME_PATH)}`}>
              {t("login.adminSso")}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
