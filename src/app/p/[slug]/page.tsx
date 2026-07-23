import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { burnKey, getClient } from "@/config/clients";
import { burnGuardScript } from "@/lib/pitch";
import PitchExperience from "@/components/pitch/PitchExperience";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = getClient(slug);
  if (!client) return { robots: { index: false, follow: false } };
  return {
    title: `${client.nombre} × Franquicias LATAM`,
    description: "Presentación privada del Bootcamp de Franquicias.",
    robots: { index: false, follow: false },
  };
}

export default async function PitchPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const client = getClient(slug);
  if (!client) notFound();

  // Burn after viewing: la cookie espejo permite decidir EN EL SERVER, así la
  // recarga de un pitch ya visto ni siquiera envía el flujo al navegador. El
  // caso "solo localStorage" lo cubre el guard inline antes del primer paint.
  const reset = sp.reset === "eagle";
  const cookieStore = await cookies();
  const quemado = !reset && Boolean(cookieStore.get(burnKey(slug))?.value);

  return (
    <>
      <script
        // Bloqueante a propósito: debe correr antes de que el flujo pinte.
        dangerouslySetInnerHTML={{ __html: burnGuardScript(slug, quemado, reset) }}
      />
      <PitchExperience client={client} initialBurned={quemado} />
    </>
  );
}
