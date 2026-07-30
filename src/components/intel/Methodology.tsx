import { METHOD, SECTIONS } from "@/lib/intel/copy";

function AnchorList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <p className="intel-eyebrow">{title}</p>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item} className="text-[13px] leading-relaxed" style={{ color: "var(--text-3)" }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Methodology() {
  return (
    <footer className="border-t border-[var(--border)] pt-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <p className="intel-eyebrow">{SECTIONS.method}</p>
          <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: "var(--text-3)" }}>
            {METHOD.body}
          </p>
        </div>
        <AnchorList title={METHOD.anchorsTottoTitle} items={METHOD.anchorsTotto} />
        <AnchorList title={METHOD.anchorsExtTitle} items={METHOD.anchorsExt} />
      </div>

      <p
        className="mono mt-8 border-t border-[var(--border)] pt-6 text-[11.5px] leading-relaxed"
        style={{ color: "var(--text-3)", letterSpacing: "0.04em" }}
      >
        {METHOD.disclaimer}
      </p>
    </footer>
  );
}
