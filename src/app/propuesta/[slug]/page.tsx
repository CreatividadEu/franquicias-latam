import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProposalExperience } from "@/components/propuesta/ProposalExperience";
import { getProposal, resolveDeadline } from "@/lib/propuestas/data";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ k?: string }>;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { slug } = await params;
  const { k } = await searchParams;
  const proposal = await getProposal(slug);
  // notFound() aquí (antes del streaming) para que el status HTTP sea 404;
  // en el page llegaría tarde y la respuesta ya salió como 200.
  if (!proposal || (proposal.accessKey && k !== proposal.accessKey)) {
    notFound();
  }
  return {
    title: `Hecho a medida para ${proposal.cliente} — Franquicias LATAM`,
    description: `El futuro de la red de franquicias de ${proposal.cliente}. En 5 fases.`,
    // Propuesta privada: nunca indexar.
    robots: { index: false, follow: false },
  };
}

export default async function PropuestaPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { k } = await searchParams;

  const proposal = await getProposal(slug);
  if (!proposal) {
    notFound();
  }
  // Privacidad opcional: si la propuesta define accessKey, exige ?k=
  if (proposal.accessKey && k !== proposal.accessKey) {
    notFound();
  }

  const deadlineIso = resolveDeadline(proposal).toISOString();

  return <ProposalExperience proposal={proposal} deadlineIso={deadlineIso} />;
}
