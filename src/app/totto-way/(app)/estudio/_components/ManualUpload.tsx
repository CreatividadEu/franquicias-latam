"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/app/totto-way/_components/TwToast";
import { MediaUpload } from "./MediaUpload";

/** Sube el PDF del manual impreso de un capítulo y refresca la vista. */
export function ManualUpload({ chapterSlug }: { chapterSlug: string }) {
  const { showToast } = useToast();
  const router = useRouter();
  return (
    <MediaUpload
      kind="PDF"
      label="Subir PDF del manual"
      chapterSlug={chapterSlug}
      onUploaded={(_, fileName) => {
        showToast(`Manual subido · ${fileName}`);
        router.refresh();
      }}
    />
  );
}
