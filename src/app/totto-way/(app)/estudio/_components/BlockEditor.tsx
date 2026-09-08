"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { TwBlock } from "@/lib/totto-way/content";

/**
 * Editor de bloques del vocabulario Totto (PLAN §7.1). Solo ofrece los ocho
 * tipos del manual: no se puede meter HTML libre ni inventar formatos, que es
 * justo lo que mantiene el manual impreso y la plataforma iguales.
 */

const LABELS: Record<TwBlock["type"], string> = {
  paragraph: "Párrafo",
  simple_translation: "Traducción simple",
  rule: "Banda amarilla (!)",
  steps: "Pasos numerados",
  doc: "Chip DOC",
  image: "Imagen",
  video: "Video",
  checklist: "Checklist",
};

const EMPTY: Record<TwBlock["type"], TwBlock> = {
  paragraph: { type: "paragraph", text: "" },
  simple_translation: { type: "simple_translation", text: "" },
  rule: { type: "rule", text: "" },
  steps: { type: "steps", items: [{ text: "" }] },
  doc: { type: "doc", code: "DOC-01-01", label: "" },
  image: { type: "image", src: "", alt: "" },
  video: { type: "video", markers: [] },
  checklist: { type: "checklist", items: [""] },
};

export function BlockEditor({ blocks, onChange }: { blocks: TwBlock[]; onChange: (blocks: TwBlock[]) => void }) {
  const update = (index: number, block: TwBlock) => onChange(blocks.map((item, i) => (i === index ? block : item)));
  const remove = (index: number) => onChange(blocks.filter((_, i) => i !== index));
  const move = (index: number, delta: number) => {
    const next = [...blocks];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const add = (type: TwBlock["type"]) => onChange([...blocks, structuredClone(EMPTY[type])]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {blocks.map((block, index) => (
        <div key={index} className="tw-block-edit">
          <div className="tw-block-edit__head">
            <span className="tw-eyebrow">{LABELS[block.type]}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button type="button" className="tw-icon-btn" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Subir">
                <ChevronUp strokeWidth={1.8} />
              </button>
              <button type="button" className="tw-icon-btn" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label="Bajar">
                <ChevronDown strokeWidth={1.8} />
              </button>
              <button type="button" className="tw-icon-btn" onClick={() => remove(index)} aria-label="Eliminar bloque">
                <Trash2 strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {block.type === "paragraph" || block.type === "simple_translation" || block.type === "rule" ? (
            <textarea
              className="tw-textarea"
              rows={block.type === "paragraph" ? 4 : 2}
              value={block.text}
              placeholder={block.type === "paragraph" ? "Texto. Usa **negrita** para destacar." : "Una sola línea."}
              onChange={(event) => update(index, { ...block, text: event.target.value })}
            />
          ) : null}

          {block.type === "steps" ? (
            <div style={{ display: "grid", gap: 6 }}>
              {block.items.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "140px minmax(0,1fr) auto", gap: 6 }}>
                  <input
                    className="tw-input"
                    style={{ height: 40 }}
                    placeholder="Lead (opcional)"
                    value={item.lead ?? ""}
                    onChange={(event) =>
                      update(index, { ...block, items: block.items.map((x, j) => (j === i ? { ...x, lead: event.target.value } : x)) })
                    }
                  />
                  <input
                    className="tw-input"
                    style={{ height: 40 }}
                    placeholder={`Paso ${i + 1}`}
                    value={item.text}
                    onChange={(event) =>
                      update(index, { ...block, items: block.items.map((x, j) => (j === i ? { ...x, text: event.target.value } : x)) })
                    }
                  />
                  <button
                    type="button"
                    className="tw-icon-btn"
                    aria-label="Quitar paso"
                    onClick={() => update(index, { ...block, items: block.items.filter((_, j) => j !== i) })}
                  >
                    <Trash2 strokeWidth={1.8} />
                  </button>
                </div>
              ))}
              <button type="button" className="tw-btn tw-btn--ghost tw-btn--sm" onClick={() => update(index, { ...block, items: [...block.items, { text: "" }] })}>
                <Plus strokeWidth={1.8} /> Paso
              </button>
            </div>
          ) : null}

          {block.type === "checklist" ? (
            <div style={{ display: "grid", gap: 6 }}>
              {block.items.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 6 }}>
                  <input
                    className="tw-input"
                    style={{ height: 40 }}
                    value={item}
                    placeholder={`Ítem ${i + 1}`}
                    onChange={(event) => update(index, { ...block, items: block.items.map((x, j) => (j === i ? event.target.value : x)) })}
                  />
                  <button
                    type="button"
                    className="tw-icon-btn"
                    aria-label="Quitar ítem"
                    onClick={() => update(index, { ...block, items: block.items.filter((_, j) => j !== i) })}
                  >
                    <Trash2 strokeWidth={1.8} />
                  </button>
                </div>
              ))}
              <button type="button" className="tw-btn tw-btn--ghost tw-btn--sm" onClick={() => update(index, { ...block, items: [...block.items, ""] })}>
                <Plus strokeWidth={1.8} /> Ítem
              </button>
            </div>
          ) : null}

          {block.type === "doc" ? (
            <div style={{ display: "grid", gridTemplateColumns: "160px minmax(0,1fr)", gap: 6 }}>
              <input className="tw-input" style={{ height: 40 }} value={block.code} placeholder="DOC-01-01" onChange={(event) => update(index, { ...block, code: event.target.value })} />
              <input className="tw-input" style={{ height: 40 }} value={block.label} placeholder="Nombre del documento" onChange={(event) => update(index, { ...block, label: event.target.value })} />
            </div>
          ) : null}

          {block.type === "image" ? (
            <div style={{ display: "grid", gap: 6 }}>
              <input className="tw-input" style={{ height: 40 }} value={block.src} placeholder="/totto-way/manual/p21.png" onChange={(event) => update(index, { ...block, src: event.target.value })} />
              <input className="tw-input" style={{ height: 40 }} value={block.alt} placeholder="Texto alternativo" onChange={(event) => update(index, { ...block, alt: event.target.value })} />
            </div>
          ) : null}

          {block.type === "video" ? (
            <div style={{ display: "grid", gap: 6 }}>
              <input className="tw-input" style={{ height: 40 }} value={block.src ?? ""} placeholder="URL del video (vacío = todavía se está grabando)" onChange={(event) => update(index, { ...block, src: event.target.value })} />
              <input className="tw-input" style={{ height: 40 }} value={block.poster ?? ""} placeholder="Póster (screenshot del manual)" onChange={(event) => update(index, { ...block, poster: event.target.value })} />
            </div>
          ) : null}
        </div>
      ))}

      <div className="tw-block-add">
        {(Object.keys(LABELS) as TwBlock["type"][]).map((type) => (
          <button key={type} type="button" className="tw-chip tw-chip--outline" onClick={() => add(type)}>
            <Plus size={12} strokeWidth={2} /> {LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
