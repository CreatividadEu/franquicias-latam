import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FranchiseLandingEditor } from "@/components/admin/FranchiseLandingEditor";

export const dynamic = "force-dynamic";

export default async function FranchiseLandingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const franchise = await prisma.franchise.findUnique({
    where: { id },
    include: {
      businessModels: { orderBy: { order: "asc" } },
      media: { orderBy: { order: "asc" } },
      faqs: { orderBy: { order: "asc" } },
      moduleConfig: true,
      automationConfig: true,
      sector: true,
    },
  });

  if (!franchise) notFound();

  const sectors = await prisma.sector.findMany({ orderBy: { name: "asc" } });

  return (
    <FranchiseLandingEditor
      franchise={JSON.parse(JSON.stringify(franchise))}
      sectors={sectors}
    />
  );
}
