import type { Metadata } from "next";
import {
  LegalList,
  LegalShell,
  LegalStrong,
  type LegalSection,
} from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Política de Privacidad y Habeas Data · Franquicias LATAM",
  description:
    "Política de tratamiento de datos personales de Franquicias LATAM conforme a la Ley 1581 de 2012 (Colombia) y al RGPD y la LOPDGDD (España / Unión Europea).",
  robots: { index: true, follow: true },
};

const SECTIONS: LegalSection[] = [
  {
    id: "responsable",
    title: "Responsable del tratamiento",
    body: (
      <>
        <p>
          El responsable del tratamiento de tus datos personales es{" "}
          <LegalStrong>Franquicias LATAM</LegalStrong> (en adelante,
          «Franquicias LATAM», «nosotros»), firma de consultoría en franquicias
          con presencia en España y Colombia:
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
              <LegalStrong>Correo para asuntos de datos personales:</LegalStrong>{" "}
              <a
                className="text-[#8FDCEC] underline underline-offset-4"
                href="mailto:datos@franquiciaslatam.co"
              >
                datos@franquiciaslatam.co
              </a>
              .
            </>,
            <>
              <LegalStrong>WhatsApp:</LegalStrong> +34 695 126 804.
            </>,
          ]}
        />
        <p>
          Esta política constituye la Política de Tratamiento de la Información
          exigida por la Ley 1581 de 2012 y el Decreto 1377 de 2013 (Colombia)
          y la información sobre protección de datos exigida por los artículos
          13 y 14 del Reglamento (UE) 2016/679 («RGPD») y la Ley Orgánica
          3/2018 («LOPDGDD») de España.
        </p>
      </>
    ),
  },
  {
    id: "datos",
    title: "Datos que recolectamos",
    body: (
      <>
        <p>Podemos recolectar los siguientes datos personales:</p>
        <LegalList
          items={[
            <>
              <LegalStrong>Datos de identificación y contacto:</LegalStrong>{" "}
              nombre, correo electrónico, teléfono / WhatsApp, país y ciudad.
            </>,
            <>
              <LegalStrong>Datos de tu negocio o interés de inversión:</LegalStrong>{" "}
              nombre de la empresa, sector, número de puntos de venta, redes
              sociales del negocio, capacidad de inversión, experiencia
              empresarial y los mensajes que decidas enviarnos.
            </>,
            <>
              <LegalStrong>Datos de navegación:</LegalStrong> dirección IP,
              tipo de dispositivo y páginas visitadas, recolectados mediante
              cookies y tecnologías similares.
            </>,
          ]}
        />
        <p>
          Los datos se recolectan a través de los formularios de nuestros
          sitios (evaluaciones, diagnósticos, formularios de contacto y de
          aplicación a franquicias), por WhatsApp y en reuniones comerciales.
        </p>
      </>
    ),
  },
  {
    id: "finalidades",
    title: "Finalidades del tratamiento",
    body: (
      <LegalList
        items={[
          "Evaluar tu negocio como candidato a franquiciar o tu perfil como candidato a franquiciado.",
          "Contactarte por teléfono, correo o WhatsApp para dar respuesta a tus solicitudes y presentarte propuestas de servicios.",
          "Cuando corresponda, presentar tu solicitud a la marca franquiciante de tu interés.",
          "Enviarte información comercial sobre nuestros servicios, programas y oportunidades de franquicia, cuando lo hayas autorizado.",
          "Cumplir obligaciones legales, contables y contractuales.",
          "Mejorar nuestros sitios, productos y servicios mediante analítica agregada.",
        ]}
      />
    ),
  },
  {
    id: "base-legal",
    title: "Base legal del tratamiento",
    body: (
      <>
        <p>
          <LegalStrong>En Colombia (Ley 1581 de 2012):</LegalStrong> tratamos
          tus datos con base en la autorización previa, expresa e informada que
          otorgas al enviar nuestros formularios o al comunicarte con nosotros.
          Puedes revocar esa autorización en cualquier momento.
        </p>
        <p>
          <LegalStrong>En España / Unión Europea (art. 6 RGPD):</LegalStrong>{" "}
          según el caso, la base es (i) tu consentimiento; (ii) la ejecución de
          medidas precontractuales o de un contrato que nos solicitas; (iii)
          nuestro interés legítimo en responder tus solicitudes y mantener la
          relación comercial; y (iv) el cumplimiento de obligaciones legales.
        </p>
      </>
    ),
  },
  {
    id: "derechos-colombia",
    title: "Tus derechos en Colombia (Habeas Data)",
    body: (
      <>
        <p>
          Como titular de datos personales, la Ley 1581 de 2012 te reconoce los
          siguientes derechos:
        </p>
        <LegalList
          items={[
            "Conocer, actualizar y rectificar tus datos personales frente a Franquicias LATAM.",
            "Solicitar prueba de la autorización otorgada para el tratamiento.",
            "Ser informado, previa solicitud, sobre el uso que se ha dado a tus datos.",
            "Revocar la autorización y/o solicitar la supresión de tus datos cuando no exista un deber legal o contractual que lo impida.",
            "Acceder de forma gratuita a tus datos personales que hayan sido objeto de tratamiento.",
            "Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones al régimen de protección de datos, una vez agotado el trámite de consulta o reclamo ante nosotros.",
          ]}
        />
      </>
    ),
  },
  {
    id: "derechos-espana",
    title: "Tus derechos en España / UE (RGPD)",
    body: (
      <>
        <p>
          Si te encuentras en España o en la Unión Europea, el RGPD y la
          LOPDGDD te reconocen los derechos de:
        </p>
        <LegalList
          items={[
            "Acceso: saber qué datos tuyos tratamos y obtener una copia.",
            "Rectificación: corregir datos inexactos o incompletos.",
            "Supresión («derecho al olvido»): pedir que eliminemos tus datos.",
            "Oposición: oponerte al tratamiento, incluido el envío de comunicaciones comerciales.",
            "Limitación del tratamiento en los supuestos previstos por la ley.",
            "Portabilidad: recibir tus datos en un formato estructurado y de uso común.",
            "No ser objeto de decisiones basadas únicamente en tratamientos automatizados que produzcan efectos jurídicos sobre ti.",
          ]}
        />
        <p>
          También puedes presentar una reclamación ante la Agencia Española de
          Protección de Datos (AEPD, <span className="whitespace-nowrap">www.aepd.es</span>) si
          consideras que el tratamiento no se ajusta a la normativa.
        </p>
      </>
    ),
  },
  {
    id: "ejercicio",
    title: "Cómo ejercer tus derechos",
    body: (
      <>
        <p>
          Envía tu solicitud a{" "}
          <a
            className="text-[#8FDCEC] underline underline-offset-4"
            href="mailto:datos@franquiciaslatam.co"
          >
            datos@franquiciaslatam.co
          </a>{" "}
          indicando: (i) tu nombre completo; (ii) el derecho que deseas
          ejercer; (iii) la descripción de los hechos; y (iv) un medio de
          contacto. Podremos pedirte información adicional para verificar tu
          identidad.
        </p>
        <LegalList
          items={[
            <>
              <LegalStrong>Colombia:</LegalStrong> las consultas se responden
              en un máximo de diez (10) días hábiles y los reclamos en un
              máximo de quince (15) días hábiles, prorrogables en los términos
              de los artículos 14 y 15 de la Ley 1581 de 2012.
            </>,
            <>
              <LegalStrong>España / UE:</LegalStrong> respondemos en el plazo
              de un (1) mes desde la recepción de la solicitud, prorrogable dos
              meses más en casos complejos (art. 12 RGPD).
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: "transferencias",
    title: "Transferencias internacionales",
    body: (
      <p>
        Por operar desde Madrid y Bogotá, tus datos pueden ser tratados en
        España y en Colombia, y por proveedores tecnológicos ubicados en otros
        países (por ejemplo, servicios de hosting, correo y mensajería). Cuando
        transferimos datos desde el Espacio Económico Europeo a países sin
        decisión de adecuación —como Colombia—, lo hacemos con garantías
        adecuadas, tales como cláusulas contractuales tipo aprobadas por la
        Comisión Europea, y solo con proveedores que ofrecen niveles adecuados
        de protección.
      </p>
    ),
  },
  {
    id: "conservacion",
    title: "Conservación de los datos",
    body: (
      <p>
        Conservamos tus datos mientras exista una relación comercial o
        precontractual contigo, mientras sean necesarios para las finalidades
        descritas y, después, bloqueados durante los plazos de prescripción de
        las acciones legales aplicables. Si solicitas la supresión y no existe
        un deber legal de conservación, los eliminamos de forma segura.
      </p>
    ),
  },
  {
    id: "seguridad",
    title: "Seguridad de la información",
    body: (
      <p>
        Aplicamos medidas técnicas, humanas y administrativas razonables para
        proteger tus datos contra pérdida, acceso no autorizado, uso indebido o
        alteración: cifrado en tránsito, control de accesos, mínimo privilegio
        y acuerdos de confidencialidad con nuestro equipo y proveedores.
      </p>
    ),
  },
  {
    id: "menores-sensibles",
    title: "Datos de menores y datos sensibles",
    body: (
      <p>
        Nuestros servicios están dirigidos a mayores de edad. No solicitamos
        datos de menores de edad ni datos sensibles (salud, origen étnico,
        creencias, etc.). Si detectamos que se han recolectado por error, los
        eliminaremos. En Colombia, el suministro de datos sensibles es
        facultativo y ninguna actividad está condicionada a ello.
      </p>
    ),
  },
  {
    id: "cookies",
    title: "Cookies y tecnologías similares",
    body: (
      <p>
        Usamos cookies técnicas necesarias para el funcionamiento del sitio y,
        previa aceptación cuando la ley lo exige, cookies de analítica para
        entender cómo se usan nuestras páginas. Puedes configurar tu navegador
        para bloquear o eliminar cookies; algunas funciones podrían dejar de
        estar disponibles.
      </p>
    ),
  },
  {
    id: "encargados",
    title: "Encargados y terceros",
    body: (
      <>
        <p>
          Compartimos datos únicamente con: (i) proveedores que actúan como
          encargados del tratamiento bajo contrato (hosting, correo
          transaccional, mensajería SMS/WhatsApp, agenda de reuniones y
          analítica); (ii) las marcas franquiciantes a las que decidas aplicar;
          y (iii) autoridades, cuando exista obligación legal.
        </p>
        <p>
          <LegalStrong>Nunca vendemos tus datos personales.</LegalStrong>
        </p>
      </>
    ),
  },
  {
    id: "autoridades",
    title: "Autoridades de control",
    body: (
      <LegalList
        items={[
          <>
            <LegalStrong>Colombia:</LegalStrong> Superintendencia de Industria
            y Comercio (SIC) — <span className="whitespace-nowrap">www.sic.gov.co</span>.
          </>,
          <>
            <LegalStrong>España:</LegalStrong> Agencia Española de Protección
            de Datos (AEPD) — <span className="whitespace-nowrap">www.aepd.es</span>.
          </>,
        ]}
      />
    ),
  },
  {
    id: "vigencia",
    title: "Vigencia y cambios",
    body: (
      <p>
        Esta política rige desde su publicación y permanece vigente mientras
        Franquicias LATAM trate datos personales. Podemos actualizarla para
        reflejar cambios legales u operativos; publicaremos siempre la versión
        vigente en esta página con su fecha de actualización. Los cambios
        sustanciales serán comunicados por los canales habituales.
      </p>
    ),
  },
];

export default function PrivacidadPage() {
  return (
    <LegalShell
      title="Política de Privacidad y Tratamiento de Datos Personales (Habeas Data)"
      updated="14 de julio de 2026"
      intro={
        <>
          <p>
            En Franquicias LATAM tratamos tus datos personales conforme a la{" "}
            <LegalStrong>Ley Estatutaria 1581 de 2012</LegalStrong> y el
            Decreto 1377 de 2013 (Colombia), y al{" "}
            <LegalStrong>Reglamento (UE) 2016/679 (RGPD)</LegalStrong> y la Ley
            Orgánica 3/2018 (LOPDGDD) de España. Este documento explica qué
            datos recolectamos, para qué los usamos y cómo puedes ejercer tus
            derechos.
          </p>
        </>
      }
      sections={SECTIONS}
      crossLink={{ href: "/terminos", label: "Términos y Condiciones" }}
    />
  );
}
