import EmbedWidget from "@/components/EmbedWidget";

interface EmbedPageProps {
  searchParams: {
    q?: string;
    clase?: string;
    estado?: string;
  };
}

export default function EmbedPage({ searchParams }: EmbedPageProps) {
  const initialQuery = searchParams.q || "";
  const clase = searchParams.clase ? Number(searchParams.clase) : undefined;
  const estado = searchParams.estado || undefined;

  return (
    <main className="min-h-screen bg-white p-3 sm:p-4">
      <EmbedWidget
        embedded
        initialQuery={initialQuery}
        initialFilters={{ clase, estado }}
      />
    </main>
  );
}
