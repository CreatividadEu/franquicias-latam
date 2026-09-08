import Image from "next/image";
import { FileText } from "lucide-react";
import type { TwBlock } from "@/lib/totto-way/content";

/**
 * Único renderizador de los bloques del vocabulario Totto (PLAN §7.1). La
 * vista de lección y la de impresión del manual comparten esta salida.
 */

/** `**negrita**` → <b> con peso 500 (Centra no tiene 700). */
function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? <b key={index}>{part.slice(2, -2)}</b> : <span key={index}>{part}</span>,
  );
}

export function BlockRenderer({ blocks }: { blocks: TwBlock[] }) {
  const docs = blocks.filter((block) => block.type === "doc");
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return <p key={index}>{renderInline(block.text)}</p>;

          case "simple_translation":
            return (
              <div key={index} className="tw-simple">
                <span className="tw-simple__label">Traducción simple</span>
                <span className="tw-simple__text">{block.text}</span>
              </div>
            );

          case "rule":
            return (
              <div key={index} className="tw-rule">
                <span className="tw-rule__icon" aria-hidden>
                  !
                </span>
                <span className="tw-rule__text">{block.text}</span>
              </div>
            );

          case "steps":
            return (
              <ol key={index} className="tw-steps">
                {block.items.map((item, i) => (
                  <li key={i}>
                    <span>
                      {item.lead ? <b>{item.lead} </b> : null}
                      {item.text}
                    </span>
                  </li>
                ))}
              </ol>
            );

          case "image":
            return (
              <figure key={index} className="tw-figure">
                <Image src={block.src} alt={block.alt} width={880} height={520} style={{ height: "auto" }} />
                {block.caption ? <figcaption>{block.caption}</figcaption> : null}
              </figure>
            );

          case "checklist":
            return (
              <ul key={index} className="tw-checklist">
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            );

          // El video se pinta con el player en la cabecera de la lección y los
          // chips DOC se agrupan al final; aquí no se repiten.
          case "video":
          case "doc":
            return null;
        }
      })}

      {docs.length > 0 ? (
        <div className="tw-docs">
          {docs.map((doc, index) =>
            doc.type === "doc" && doc.href ? (
              <a key={index} className="tw-doc" href={doc.href} target="_blank" rel="noreferrer">
                <FileText strokeWidth={1.8} />
                {doc.code} · {doc.label}
              </a>
            ) : doc.type === "doc" ? (
              <span key={index} className="tw-doc">
                <FileText strokeWidth={1.8} />
                {doc.code} · {doc.label}
              </span>
            ) : null,
          )}
        </div>
      ) : null}
    </>
  );
}
