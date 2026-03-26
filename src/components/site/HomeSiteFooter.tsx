import Image from "next/image";
import Link from "next/link";
import {
  homeFooterCompanyLinks,
  homeFooterLegalLinks,
  homeFooterProductLinks,
} from "@/components/home/homeBrandData";

type FooterLink = {
  href: string;
  label: string;
  isInternal?: boolean;
};

function FooterLinkItem({ item }: { item: FooterLink }) {
  if (item.isInternal) {
    return (
      <Link href={item.href} className="hover:text-black">
        {item.label}
      </Link>
    );
  }

  return (
    <a href={item.href} className="hover:text-black">
      {item.label}
    </a>
  );
}

export function HomeSiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-transparent py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-3 sm:mb-4">
              <Image
                src="/logo_latam/franquicias_latam_logo.png"
                alt="Franquicias LATAM"
                width={640}
                height={160}
                className="h-[6.4rem] w-auto sm:h-32"
              />
            </div>
            <p className="text-xs text-gray-900 sm:text-sm">
              Plataforma de franquicias para inversionistas en
              Latinoamérica.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
              Producto
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-900 sm:space-y-2 sm:text-sm">
              {homeFooterProductLinks.map((item) => (
                <li key={item.href}>
                  <FooterLinkItem item={item} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
              Empresa
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-900 sm:space-y-2 sm:text-sm">
              {homeFooterCompanyLinks.map((item) => (
                <li key={item.href}>
                  <FooterLinkItem item={item} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold sm:mb-4 sm:text-base">
              Legal
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-900 sm:space-y-2 sm:text-sm">
              {homeFooterLegalLinks.map((item) => (
                <li key={item.label}>
                  <FooterLinkItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-6 text-center text-xs text-gray-900 sm:mt-8 sm:pt-8 sm:text-sm">
          &copy; 2026 Franquicias LATAM. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
