import Link from "next/link";
import { translate } from "@/lib/sandbox/i18n";

export default function SandboxNotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div aria-hidden className="sb-grid pointer-events-none absolute inset-0" />
      <div className="relative max-w-md">
        <p className="sb-kicker mb-5">Franquicias LATAM · Sandbox</p>
        <h1 className="sb-title">{translate("es", "notFound.title")}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--sb-muted)]">
          {translate("es", "notFound.body")}
        </p>
        <Link href="https://franquiciaslatam.com" className="sb-btn sb-btn-ghost mt-8">
          {translate("es", "notFound.cta")}
        </Link>
      </div>
    </main>
  );
}
