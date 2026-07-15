import type { Metadata } from "next";
import {
  LegalList,
  LegalShell,
  LegalStrong,
  type LegalSection,
} from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Términos y Condiciones · Franquicias LATAM",
  description:
    "Términos y condiciones de uso de los sitios y servicios de Franquicias LATAM, incluida la autorización de tratamiento de datos personales (Habeas Data).",
  robots: { index: true, follow: true },
};

const SECTIONS: LegalSection[] = [
  {
    id: "identificacion",
    title: "Quiénes somos",
    body: (
      <>
        <p>
          Estos Términos y Condiciones (los «Términos») regulan el acceso y uso
          de los sitios web y servicios de{" "}
          <LegalStrong>Franquicias LATAM</LegalStrong>, firma de consultoría en
          franquicias con oficinas en:
        </p>
        <LegalList
          items={[
            <>
              <LegalStrong>Madrid, España:</LegalStrong> Paseo de la Castellana
              77, Of. 02-113.
            </>,
            <>
              <LegalStrong>Bogotá, Colombia:</LegalStrong> Carrera 7 #116-50,
              Edificio Flormorado, Usaquén.
            </>,
            <>
              <LegalStrong>Contacto:</LegalStrong>{" "}
              <a
                className="text-[#8FDCEC] underline underline-offset-4"
                href="mailto:datos@franquiciaslatam.co"
              >
                datos@franquiciaslatam.co
              </a>{" "}
              · WhatsApp +34 695 126 804.
            </>,
          ]}
        />
        <p>
          Los Términos aplican a franquiciaslatam.com y a sus subdominios y
          sitios asociados (entre otros, franquiciar.franquiciaslatam.com,
          cal.franquiciaslatam.com y franquicias.ai), en conjunto, los
          «Sitios».
        </p>
      </>
    ),
  },
  {
    id: "aceptacion",
    title: "Aceptación de los términos",
    body: (
      <p>
        Al navegar los Sitios, enviar nuestros formularios o contratar nuestros
        servicios aceptas estos Términos y nuestra{" "}
        <a
          className="text-[#8FDCEC] underline underline-offset-4"
          href="/privacidad"
        >
          Política de Privacidad y Habeas Data
        </a>
        . Si no estás de acuerdo, por favor no uses los Sitios. El uso de los
        Sitios está reservado a mayores de edad con capacidad legal para
        contratar.
      </p>
    ),
  },
  {
    id: "servicios",
    title: "Nuestros servicios",
    body: (
      <>
        <p>A través de los Sitios ofrecemos, entre otros:</p>
        <LegalList
          items={[
            "Evaluación y diagnóstico de negocios interesados en franquiciar.",
            "Estructuración legal, comercial y financiera de franquicias.",
            "Programas de aceleración y acompañamiento en expansión.",
            "Conexión entre inversionistas y marcas franquiciantes.",
            "Herramientas de inteligencia artificial aplicadas al sector.",
          ]}
        />
        <p>
          La información publicada en los Sitios (incluidos diagnósticos,
          evaluaciones preliminares y resultados de herramientas automatizadas)
          tiene carácter informativo y orientativo: no constituye asesoría
          legal, financiera o de inversión definitiva, ni una oferta
          vinculante. Todo servicio profesional se formaliza mediante propuesta
          o contrato específico.
        </p>
      </>
    ),
  },
  {
    id: "habeas-data",
    title: "Autorización de tratamiento de datos (Habeas Data)",
    body: (
      <>
        <p>
          Al diligenciar cualquier formulario de los Sitios o escribirnos por
          WhatsApp, otorgas tu{" "}
          <LegalStrong>
            autorización previa, expresa e informada
          </LegalStrong>{" "}
          a Franquicias LATAM para tratar tus datos personales conforme a la
          Ley 1581 de 2012 y el Decreto 1377 de 2013 (Colombia) y al RGPD y la
          LOPDGDD (España / UE), con las finalidades descritas en nuestra{" "}
          <a
            className="text-[#8FDCEC] underline underline-offset-4"
            href="/privacidad"
          >
            Política de Privacidad
          </a>
          : evaluar tu solicitud, contactarte, presentarte propuestas y, cuando
          corresponda, remitir tu aplicación a la marca franquiciante.
        </p>
        <p>
          Como titular puedes conocer, actualizar, rectificar y suprimir tus
          datos, solicitar prueba de la autorización, revocarla y presentar
          quejas ante la Superintendencia de Industria y Comercio (Colombia) o
          la Agencia Española de Protección de Datos (España). El canal para
          ejercer estos derechos es{" "}
          <a
            className="text-[#8FDCEC] underline underline-offset-4"
            href="mailto:datos@franquiciaslatam.co"
          >
            datos@franquiciaslatam.co
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "uso-permitido",
    title: "Uso permitido de los sitios",
    body: (
      <>
        <p>Te comprometes a:</p>
        <LegalList
          items={[
            "Suministrar información veraz, completa y actualizada en los formularios.",
            "No usar los Sitios con fines ilícitos, fraudulentos o que infrinjan derechos de terceros.",
            "No intentar vulnerar la seguridad de los Sitios ni acceder a información de otros usuarios.",
            "No extraer de forma masiva o automatizada contenidos o datos de los Sitios sin autorización escrita.",
          ]}
        />
      </>
    ),
  },
  {
    id: "propiedad-intelectual",
    title: "Propiedad intelectual",
    body: (
      <p>
        Los contenidos de los Sitios —marcas, logotipos, textos, diseños,
        metodologías, software y bases de datos— son propiedad de Franquicias
        LATAM o de sus licenciantes y están protegidos por la normativa de
        propiedad intelectual e industrial de Colombia, España y los tratados
        internacionales aplicables. Los logotipos de clientes y de
        instituciones (incluidos los reconocimientos exhibidos en el sitio)
        pertenecen a sus respectivos titulares y se muestran con fines
        informativos de trayectoria. No se concede ninguna licencia por el
        simple uso de los Sitios.
      </p>
    ),
  },
  {
    id: "responsabilidad",
    title: "Limitación de responsabilidad",
    body: (
      <>
        <p>
          Trabajamos para que los Sitios estén disponibles y actualizados; sin
          embargo, no garantizamos disponibilidad ininterrumpida ni ausencia de
          errores. En la medida permitida por la ley aplicable, Franquicias
          LATAM no responde por:
        </p>
        <LegalList
          items={[
            "Decisiones de inversión o de negocio tomadas con base en información orientativa de los Sitios.",
            "Contenidos de sitios de terceros enlazados desde los Sitios.",
            "Daños derivados de causas fuera de nuestro control razonable.",
          ]}
        />
        <p>
          Nada en estos Términos limita derechos irrenunciables que te
          correspondan como consumidor bajo el Estatuto del Consumidor
          colombiano (Ley 1480 de 2011) o la normativa española de consumo.
        </p>
      </>
    ),
  },
  {
    id: "enlaces",
    title: "Enlaces y sitios de terceros",
    body: (
      <p>
        Los Sitios pueden enlazar a plataformas de terceros (por ejemplo,
        WhatsApp, YouTube, Google Maps o pasarelas de agenda y pago). El uso de
        esas plataformas se rige por sus propios términos y políticas de
        privacidad, que te recomendamos revisar.
      </p>
    ),
  },
  {
    id: "modificaciones",
    title: "Modificaciones",
    body: (
      <p>
        Podemos actualizar estos Términos para reflejar cambios legales,
        técnicos o de nuestros servicios. La versión vigente estará siempre
        publicada en esta página con su fecha de actualización. El uso de los
        Sitios después de una modificación implica su aceptación.
      </p>
    ),
  },
  {
    id: "ley-aplicable",
    title: "Ley aplicable y jurisdicción",
    body: (
      <p>
        Estos Términos se rigen: (i) para usuarios y operaciones en Colombia,
        por las leyes de la República de Colombia, con competencia de sus
        jueces; y (ii) para usuarios y operaciones en España, por la
        legislación española, con competencia de los juzgados y tribunales de
        Madrid, salvo los fueros imperativos que correspondan a consumidores.
        Lo anterior sin perjuicio de las normas de protección de datos y de
        consumo que resulten de aplicación obligatoria en tu país de
        residencia.
      </p>
    ),
  },
];

export default function TerminosPage() {
  return (
    <LegalShell
      title="Términos y Condiciones"
      updated="14 de julio de 2026"
      intro={
        <p>
          Estos Términos regulan el uso de los sitios y servicios de
          Franquicias LATAM en Iberoamérica, e incorporan la autorización de
          tratamiento de datos personales (Habeas Data) exigida por la
          legislación de Colombia y de España.
        </p>
      }
      sections={SECTIONS}
      crossLink={{
        href: "/privacidad",
        label: "Política de Privacidad y Habeas Data",
      }}
    />
  );
}
