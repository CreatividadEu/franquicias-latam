"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PLAN_ENTITLEMENTS, isModuleAllowed } from "@/lib/plan-entitlements";
import type { PlanTier } from "@/lib/plan-entitlements";

// ── Types ─────────────────────────────────────────────────────────────────────

type Sector = { id: string; name: string; emoji: string };

type BusinessModel = {
  id: string; name: string; size: string | null; investmentMin: number | null;
  investmentMax: number | null; ebitda: string | null; paybackMonths: number | null;
  roiAnnual: number | null; imageUrl: string | null; description: string | null; order: number;
};

type MediaItem = {
  id: string; type: string; url: string; label: string | null; altText: string | null; order: number;
};

type FaqItem = { id: string; question: string; answer: string; order: number };

type ModuleConfig = {
  heroEnabled: boolean; videoEnabled: boolean; galleryEnabled: boolean;
  businessModelsEnabled: boolean; financialsEnabled: boolean; faqEnabled: boolean;
  brochureEnabled: boolean; bookingEnabled: boolean; chatbotEnabled: boolean; nurturingEnabled: boolean;
} | null;

type AutomationConfig = {
  enabled: boolean; bookingUrl: string | null; nurtureSequenceId: string | null;
  webhookUrl: string | null; crmDestination: string | null; calendlyRoutingMode: string | null;
} | null;

type Franchise = {
  id: string; name: string; slug: string | null; description: string;
  investmentMin: number; investmentMax: number; planTier: string; published: boolean;
  headline: string | null; subheadline: string | null; shortDescription: string | null;
  longDescription: string | null; logoUrl: string | null; heroImageUrl: string | null;
  youtubeUrl: string | null; brochureUrl: string | null; bookingUrl: string | null;
  credibilityLine: string | null; cta1Label: string | null; cta1Url: string | null;
  cta2Label: string | null; cta2Url: string | null; ebitdaReference: string | null;
  paybackMonths: number | null; royaltyInfo: string | null; operatorProfile: string | null;
  businessModels: BusinessModel[]; media: MediaItem[]; faqs: FaqItem[];
  moduleConfig: ModuleConfig; automationConfig: AutomationConfig;
};

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "general", label: "General" },
  { id: "hero", label: "Hero" },
  { id: "ctas", label: "CTAs" },
  { id: "video", label: "Video" },
  { id: "models", label: "Modelos" },
  { id: "gallery", label: "Galería" },
  { id: "financials", label: "Financieros" },
  { id: "faq", label: "FAQ" },
  { id: "brochure", label: "Descargas" },
  { id: "booking", label: "Reservas" },
  { id: "modules", label: "Módulos" },
  { id: "automation", label: "Automatización" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Field helpers ─────────────────────────────────────────────────────────────

function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Input({
  value, onChange, placeholder, type = "text",
}: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
}

function Textarea({
  value, onChange, placeholder, rows = 3,
}: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
}

function Toggle({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={cn("h-6 w-11 rounded-full transition-colors", checked ? "bg-blue-600" : "bg-gray-200")} />
        <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function SaveButton({
  saving, saved, onClick,
}: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
        saved ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700",
        saving && "opacity-60 cursor-not-allowed"
      )}
    >
      {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar cambios"}
    </button>
  );
}

// ── Main editor ───────────────────────────────────────────────────────────────

export function FranchiseLandingEditor({
  franchise: initial,
  sectors,
}: {
  franchise: Franchise;
  sectors: Sector[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [data, setData] = useState<Franchise>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = data.planTier as PlanTier;

  // Generic field setter
  function set<K extends keyof Franchise>(key: K, value: Franchise[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setModule(key: keyof NonNullable<ModuleConfig>, value: boolean) {
    setData((prev) => ({
      ...prev,
      moduleConfig: { ...defaultModuleConfig(prev.moduleConfig), [key]: value },
    }));
    setSaved(false);
  }

  function setAutomation(key: keyof NonNullable<AutomationConfig>, value: unknown) {
    setData((prev) => ({
      ...prev,
      automationConfig: { ...defaultAutomationConfig(prev.automationConfig), [key]: value },
    }));
    setSaved(false);
  }

  const saveAll = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const base = `/api/admin/landing/franchises/${data.id}`;
      const headers = { "Content-Type": "application/json" };

      await Promise.all([
        fetch(base, {
          method: "PUT", headers,
          body: JSON.stringify({
            name: data.name, slug: data.slug, planTier: data.planTier, published: data.published,
            headline: data.headline, subheadline: data.subheadline,
            shortDescription: data.shortDescription, longDescription: data.longDescription,
            logoUrl: data.logoUrl, heroImageUrl: data.heroImageUrl, youtubeUrl: data.youtubeUrl,
            brochureUrl: data.brochureUrl, bookingUrl: data.bookingUrl,
            credibilityLine: data.credibilityLine, cta1Label: data.cta1Label, cta1Url: data.cta1Url,
            cta2Label: data.cta2Label, cta2Url: data.cta2Url, ebitdaReference: data.ebitdaReference,
            paybackMonths: data.paybackMonths, royaltyInfo: data.royaltyInfo,
            operatorProfile: data.operatorProfile,
            investmentMin: data.investmentMin, investmentMax: data.investmentMax,
          }),
        }).then((r) => { if (!r.ok) throw new Error("Error guardando datos principales"); }),

        data.moduleConfig && fetch(`${base}/modules`, {
          method: "PUT", headers, body: JSON.stringify(data.moduleConfig),
        }).then((r) => { if (!r.ok) throw new Error("Error guardando módulos"); }),

        data.automationConfig && fetch(`${base}/automation`, {
          method: "PUT", headers, body: JSON.stringify(data.automationConfig),
        }).then((r) => { if (!r.ok) throw new Error("Error guardando automatización"); }),
      ].filter(Boolean));

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }, [data]);

  const slugForPreview = data.slug ?? data.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/franquicias" className="text-sm text-gray-400 hover:text-gray-600">
            ← Franquicias
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900">{data.name}</h1>
          <PlanBadge plan={plan} />
        </div>

        <div className="flex items-center gap-3">
          <Toggle
            checked={data.published}
            onChange={(v) => set("published", v)}
            label={data.published ? "Publicado" : "Borrador"}
          />
          <Link
            href={`/franquicia/${slugForPreview}?preview=true`}
            target="_blank"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Preview ↗
          </Link>
          <SaveButton saving={saving} saved={saved} onClick={saveAll} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Plan selector */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <span className="text-sm font-medium text-gray-700">Plan:</span>
        {(["BASIC", "GROWTH", "ALL_IN"] as PlanTier[]).map((p) => (
          <button
            key={p}
            onClick={() => set("planTier", p)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              data.planTier === p
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {PLAN_ENTITLEMENTS[p].label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">
          {PLAN_ENTITLEMENTS[plan].modules.join(" · ")}
        </span>
      </div>

      {/* Tabs */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <GeneralTab data={data} set={set} sectors={sectors} />
          )}
          {activeTab === "hero" && <HeroTab data={data} set={set} />}
          {activeTab === "ctas" && <CtasTab data={data} set={set} />}
          {activeTab === "video" && <VideoTab data={data} set={set} />}
          {activeTab === "models" && (
            <ModelsTab franchiseId={data.id} models={data.businessModels} plan={plan}
              onRefresh={(models) => setData((p) => ({ ...p, businessModels: models }))} />
          )}
          {activeTab === "gallery" && (
            <GalleryTab franchiseId={data.id} media={data.media} plan={plan}
              onRefresh={(media) => setData((p) => ({ ...p, media }))} />
          )}
          {activeTab === "financials" && <FinancialsTab data={data} set={set} />}
          {activeTab === "faq" && (
            <FaqTab franchiseId={data.id} faqs={data.faqs} plan={plan}
              onRefresh={(faqs) => setData((p) => ({ ...p, faqs }))} />
          )}
          {activeTab === "brochure" && <BrochureTab data={data} set={set} />}
          {activeTab === "booking" && <BookingTab data={data} set={set} />}
          {activeTab === "modules" && (
            <ModulesTab config={data.moduleConfig} plan={plan} setModule={setModule} />
          )}
          {activeTab === "automation" && (
            <AutomationTab config={data.automationConfig} setAutomation={setAutomation} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Plan badge ────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: PlanTier }) {
  const map: Record<PlanTier, string> = {
    BASIC: "bg-slate-100 text-slate-600",
    GROWTH: "bg-purple-100 text-purple-700",
    ALL_IN: "bg-teal-100 text-teal-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[plan]}`}>
      {PLAN_ENTITLEMENTS[plan].label}
    </span>
  );
}

// ── Tab components ────────────────────────────────────────────────────────────

function GeneralTab({
  data, set, sectors,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void; sectors: Sector[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Nombre">
        <Input value={data.name} onChange={(v) => set("name", v)} placeholder="Nombre de la franquicia" />
      </Field>
      <Field label="Slug (URL)" hint="Solo letras, números y guiones. Ej: crem-helado">
        <Input value={data.slug ?? ""} onChange={(v) => set("slug", v || null)} placeholder="crem-helado" />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Descripción corta">
          <Input value={data.shortDescription ?? ""} onChange={(v) => set("shortDescription", v || null)} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Descripción larga">
          <Textarea value={data.longDescription ?? ""} onChange={(v) => set("longDescription", v || null)} rows={5} />
        </Field>
      </div>
      <Field label="Inversión mínima (USD)">
        <Input type="number" value={String(data.investmentMin)} onChange={(v) => set("investmentMin", Number(v))} />
      </Field>
      <Field label="Inversión máxima (USD)">
        <Input type="number" value={String(data.investmentMax)} onChange={(v) => set("investmentMax", Number(v))} />
      </Field>
    </div>
  );
}

function HeroTab({
  data, set,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Titular (headline)">
          <Input value={data.headline ?? ""} onChange={(v) => set("headline", v || null)} placeholder="La franquicia más..." />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Subtitular (subheadline)">
          <Textarea value={data.subheadline ?? ""} onChange={(v) => set("subheadline", v || null)} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Línea de credibilidad" hint="Se muestra como badge bajo el logo. Ej: +200 puntos · 8 países">
          <Input value={data.credibilityLine ?? ""} onChange={(v) => set("credibilityLine", v || null)} />
        </Field>
      </div>
      <Field label="URL del logo">
        <Input value={data.logoUrl ?? ""} onChange={(v) => set("logoUrl", v || null)} placeholder="https://..." />
      </Field>
      <Field label="URL imagen hero">
        <Input value={data.heroImageUrl ?? ""} onChange={(v) => set("heroImageUrl", v || null)} placeholder="https://..." />
      </Field>
      {data.logoUrl && (
        <div className="sm:col-span-2">
          <p className="mb-2 text-xs text-gray-500">Preview logo:</p>
          <img src={data.logoUrl} alt="Logo preview" className="h-16 rounded border border-gray-200 object-contain" />
        </div>
      )}
    </div>
  );
}

function CtasTab({
  data, set,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="CTA Principal — Texto">
        <Input value={data.cta1Label ?? ""} onChange={(v) => set("cta1Label", v || null)} placeholder="Quiero saber más" />
      </Field>
      <Field label="CTA Principal — URL">
        <Input value={data.cta1Url ?? ""} onChange={(v) => set("cta1Url", v || null)} placeholder="/quiz" />
      </Field>
      <Field label="CTA Secundario — Texto">
        <Input value={data.cta2Label ?? ""} onChange={(v) => set("cta2Label", v || null)} placeholder="Descargar dossier" />
      </Field>
      <Field label="CTA Secundario — URL">
        <Input value={data.cta2Url ?? ""} onChange={(v) => set("cta2Url", v || null)} placeholder="https://..." />
      </Field>
    </div>
  );
}

function VideoTab({
  data, set,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void }) {
  return (
    <div className="space-y-5">
      <Field label="URL de YouTube" hint="Acepta formatos: youtu.be/ID, youtube.com/watch?v=ID">
        <Input value={data.youtubeUrl ?? ""} onChange={(v) => set("youtubeUrl", v || null)} placeholder="https://youtube.com/watch?v=..." />
      </Field>
    </div>
  );
}

function FinancialsTab({
  data, set,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="EBITDA de referencia">
        <Input value={data.ebitdaReference ?? ""} onChange={(v) => set("ebitdaReference", v || null)} placeholder="28–35%" />
      </Field>
      <Field label="Retorno estimado (meses)">
        <Input type="number" value={String(data.paybackMonths ?? "")} onChange={(v) => set("paybackMonths", v ? Number(v) : null)} />
      </Field>
      <Field label="Información de royalty">
        <Input value={data.royaltyInfo ?? ""} onChange={(v) => set("royaltyInfo", v || null)} placeholder="6% sobre ventas brutas" />
      </Field>
      <Field label="Perfil del operador">
        <Input value={data.operatorProfile ?? ""} onChange={(v) => set("operatorProfile", v || null)} placeholder="Emprendedor con capital propio..." />
      </Field>
    </div>
  );
}

function BrochureTab({
  data, set,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void }) {
  return (
    <div className="space-y-5">
      <Field label="URL del dossier / brochure" hint="PDF u otro archivo descargable">
        <Input value={data.brochureUrl ?? ""} onChange={(v) => set("brochureUrl", v || null)} placeholder="https://..." />
      </Field>
    </div>
  );
}

function BookingTab({
  data, set,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void }) {
  return (
    <div className="space-y-5">
      <Field label="URL de reserva de llamada" hint="Calendly, Cal.com u otro agendador">
        <Input value={data.bookingUrl ?? ""} onChange={(v) => set("bookingUrl", v || null)} placeholder="https://calendly.com/..." />
      </Field>
    </div>
  );
}

// ── Models tab ────────────────────────────────────────────────────────────────

function ModelsTab({
  franchiseId, models, plan, onRefresh,
}: { franchiseId: string; models: BusinessModel[]; plan: PlanTier; onRefresh: (m: BusinessModel[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const max = PLAN_ENTITLEMENTS[plan].maxBusinessModels;
  const allowed = isModuleAllowed(plan, "businessModels");

  async function refetch() {
    const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/models`);
    if (res.ok) onRefresh(await res.json());
  }

  async function deleteModel(id: string) {
    if (!confirm("¿Eliminar este modelo?")) return;
    await fetch(`/api/admin/landing/franchises/${franchiseId}/models/${id}`, { method: "DELETE" });
    await refetch();
  }

  if (!allowed) {
    return <LockedMessage message={`Los modelos de negocio requieren plan GROWTH o ALL_IN.`} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{models.length} / {max} modelos</p>
        {models.length < max && (
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Agregar modelo
          </button>
        )}
      </div>

      <div className="space-y-3">
        {models.map((m) => (
          <div key={m.id} className="rounded-lg border border-gray-200 p-4">
            {editingId === m.id ? (
              <ModelForm
                initial={m} franchiseId={franchiseId} modelId={m.id}
                onSave={async () => { setEditingId(null); await refetch(); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">{m.name}</p>
                  {m.size && <p className="text-xs text-gray-500">{m.size}</p>}
                  {m.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{m.description}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setEditingId(m.id)} className="text-xs text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => deleteModel(m.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                </div>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <ModelForm
              franchiseId={franchiseId}
              onSave={async () => { setAdding(false); await refetch(); }}
              onCancel={() => setAdding(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ModelForm({
  initial, franchiseId, modelId, onSave, onCancel,
}: { initial?: BusinessModel; franchiseId: string; modelId?: string; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    size: initial?.size ?? "",
    investmentMin: String(initial?.investmentMin ?? ""),
    investmentMax: String(initial?.investmentMax ?? ""),
    ebitda: initial?.ebitda ?? "",
    paybackMonths: String(initial?.paybackMonths ?? ""),
    roiAnnual: String(initial?.roiAnnual ?? ""),
    imageUrl: initial?.imageUrl ?? "",
    description: initial?.description ?? "",
    order: String(initial?.order ?? 0),
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const url = modelId
      ? `/api/admin/landing/franchises/${franchiseId}/models/${modelId}`
      : `/api/admin/landing/franchises/${franchiseId}/models`;
    await fetch(url, {
      method: modelId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onSave();
  }

  function f(key: keyof typeof form, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Nombre"><Input value={form.name} onChange={(v) => f("name", v)} /></Field>
      <Field label="Tamaño (m²)"><Input value={form.size} onChange={(v) => f("size", v)} placeholder="20–35 m²" /></Field>
      <Field label="Inversión mín (USD)"><Input type="number" value={form.investmentMin} onChange={(v) => f("investmentMin", v)} /></Field>
      <Field label="Inversión máx (USD)"><Input type="number" value={form.investmentMax} onChange={(v) => f("investmentMax", v)} /></Field>
      <Field label="EBITDA"><Input value={form.ebitda} onChange={(v) => f("ebitda", v)} placeholder="28%" /></Field>
      <Field label="Retorno (meses)"><Input type="number" value={form.paybackMonths} onChange={(v) => f("paybackMonths", v)} /></Field>
      <Field label="ROI anual (%)"><Input type="number" value={form.roiAnnual} onChange={(v) => f("roiAnnual", v)} /></Field>
      <Field label="URL imagen"><Input value={form.imageUrl} onChange={(v) => f("imageUrl", v)} /></Field>
      <div className="sm:col-span-2">
        <Field label="Descripción"><Textarea value={form.description} onChange={(v) => f("description", v)} /></Field>
      </div>
      <div className="sm:col-span-2 flex gap-2">
        <button onClick={save} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? "Guardando..." : modelId ? "Actualizar" : "Agregar"}
        </button>
        <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Gallery tab ───────────────────────────────────────────────────────────────

function GalleryTab({
  franchiseId, media, plan, onRefresh,
}: { franchiseId: string; media: MediaItem[]; plan: PlanTier; onRefresh: (m: MediaItem[]) => void }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const images = media.filter((m) => m.type === "image");
  const max = PLAN_ENTITLEMENTS[plan].maxGalleryImages;
  const allowed = isModuleAllowed(plan, "gallery");

  async function refetch() {
    const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/media`);
    if (res.ok) onRefresh(await res.json());
  }

  async function addImage() {
    if (!url) return;
    setAdding(true);
    const body = new FormData();
    body.append("url", url);
    body.append("type", "image");
    body.append("label", label);
    body.append("order", String(images.length));
    await fetch(`/api/admin/landing/franchises/${franchiseId}/media`, { method: "POST", body });
    setUrl(""); setLabel("");
    await refetch();
    setAdding(false);
  }

  async function deleteMedia(id: string) {
    if (!confirm("¿Eliminar esta imagen?")) return;
    await fetch(`/api/admin/landing/franchises/${franchiseId}/media/${id}`, { method: "DELETE" });
    await refetch();
  }

  if (!allowed) return <LockedMessage message="La galería requiere plan GROWTH o ALL_IN." />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{images.length} / {max} imágenes</p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="relative group">
            <img src={img.url} alt={img.altText ?? ""} className="aspect-square w-full rounded-lg border border-gray-200 object-cover" />
            <button
              onClick={() => deleteMedia(img.id)}
              className="absolute right-1 top-1 hidden group-hover:flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs"
            >
              ×
            </button>
            {img.label && <p className="mt-1 text-xs text-gray-500 text-center truncate">{img.label}</p>}
          </div>
        ))}
      </div>

      {images.length < max && (
        <div className="rounded-lg border border-dashed border-gray-300 p-4 space-y-3">
          <p className="text-xs font-medium text-gray-600">Agregar imagen por URL</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input value={url} onChange={setUrl} placeholder="https://..." />
            <Input value={label} onChange={setLabel} placeholder="Etiqueta (opcional)" />
          </div>
          <button onClick={addImage} disabled={!url || adding} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {adding ? "Agregando..." : "Agregar"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── FAQ tab ───────────────────────────────────────────────────────────────────

function FaqTab({
  franchiseId, faqs, plan, onRefresh,
}: { franchiseId: string; faqs: FaqItem[]; plan: PlanTier; onRefresh: (f: FaqItem[]) => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const allowed = isModuleAllowed(plan, "faq");

  async function refetch() {
    const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/faqs`);
    if (res.ok) onRefresh(await res.json());
  }

  async function deleteFaq(id: string) {
    if (!confirm("¿Eliminar esta FAQ?")) return;
    await fetch(`/api/admin/landing/franchises/${franchiseId}/faqs/${id}`, { method: "DELETE" });
    await refetch();
  }

  if (!allowed) return <LockedMessage message="El FAQ requiere plan GROWTH o ALL_IN." />;

  return (
    <div className="space-y-3">
      <button onClick={() => setAdding(true)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
        + Agregar pregunta
      </button>

      {adding && (
        <FaqForm franchiseId={franchiseId} onSave={async () => { setAdding(false); await refetch(); }} onCancel={() => setAdding(false)} />
      )}

      {faqs.map((faq) => (
        <div key={faq.id} className="rounded-lg border border-gray-200 p-4">
          {editingId === faq.id ? (
            <FaqForm initial={faq} franchiseId={franchiseId} faqId={faq.id}
              onSave={async () => { setEditingId(null); await refetch(); }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900 text-sm">{faq.question}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditingId(faq.id)} className="text-xs text-blue-600 hover:underline">Editar</button>
                <button onClick={() => deleteFaq(faq.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FaqForm({
  initial, franchiseId, faqId, onSave, onCancel,
}: { initial?: FaqItem; franchiseId: string; faqId?: string; onSave: () => void; onCancel: () => void }) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const url = faqId
      ? `/api/admin/landing/franchises/${franchiseId}/faqs/${faqId}`
      : `/api/admin/landing/franchises/${franchiseId}/faqs`;
    await fetch(url, {
      method: faqId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, order: initial?.order ?? 0 }),
    });
    setSaving(false);
    onSave();
  }

  return (
    <div className="space-y-3">
      <Field label="Pregunta"><Input value={question} onChange={setQuestion} /></Field>
      <Field label="Respuesta"><Textarea value={answer} onChange={setAnswer} rows={3} /></Field>
      <div className="flex gap-2">
        <button onClick={save} disabled={saving || !question || !answer} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? "Guardando..." : faqId ? "Actualizar" : "Agregar"}
        </button>
        <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
      </div>
    </div>
  );
}

// ── Modules tab ───────────────────────────────────────────────────────────────

const MODULE_LABELS: { key: keyof NonNullable<ModuleConfig>; label: string; module: string }[] = [
  { key: "heroEnabled", label: "Hero", module: "hero" },
  { key: "videoEnabled", label: "Video", module: "video" },
  { key: "galleryEnabled", label: "Galería", module: "gallery" },
  { key: "businessModelsEnabled", label: "Modelos de negocio", module: "businessModels" },
  { key: "financialsEnabled", label: "Financieros", module: "financials" },
  { key: "faqEnabled", label: "FAQ", module: "faq" },
  { key: "brochureEnabled", label: "Dossier/Brochure", module: "brochure" },
  { key: "bookingEnabled", label: "Reserva de llamada", module: "booking" },
  { key: "chatbotEnabled", label: "Chatbot de calificación", module: "chatbot" },
  { key: "nurturingEnabled", label: "Nurturing automatizado", module: "nurturing" },
];

function ModulesTab({
  config, plan, setModule,
}: { config: ModuleConfig; plan: PlanTier; setModule: (k: keyof NonNullable<ModuleConfig>, v: boolean) => void }) {
  const cfg = defaultModuleConfig(config);
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">Los módulos bloqueados por el plan aparecen desactivados.</p>
      {MODULE_LABELS.map(({ key, label, module }) => {
        const planAllows = isModuleAllowed(plan, module);
        return (
          <div key={key} className={cn("flex items-center justify-between rounded-lg border p-3", !planAllows && "opacity-40")}>
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              {!planAllows && <p className="text-xs text-gray-400">No incluido en plan {PLAN_ENTITLEMENTS[plan].label}</p>}
            </div>
            <Toggle
              checked={planAllows && (cfg[key] as boolean)}
              onChange={(v) => planAllows && setModule(key, v)}
              label=""
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Automation tab ────────────────────────────────────────────────────────────

function AutomationTab({
  config, setAutomation,
}: { config: AutomationConfig; setAutomation: (k: keyof NonNullable<AutomationConfig>, v: unknown) => void }) {
  const cfg = defaultAutomationConfig(config);
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Toggle checked={cfg.enabled} onChange={(v) => setAutomation("enabled", v)} label="Automatización habilitada" />
      </div>
      <Field label="Webhook URL">
        <Input value={cfg.webhookUrl ?? ""} onChange={(v) => setAutomation("webhookUrl", v || null)} placeholder="https://..." />
      </Field>
      <Field label="CRM destino">
        <Input value={cfg.crmDestination ?? ""} onChange={(v) => setAutomation("crmDestination", v || null)} placeholder="HubSpot, Pipedrive..." />
      </Field>
      <Field label="ID secuencia nurturing">
        <Input value={cfg.nurtureSequenceId ?? ""} onChange={(v) => setAutomation("nurtureSequenceId", v || null)} />
      </Field>
      <Field label="Modo routing Calendly">
        <Input value={cfg.calendlyRoutingMode ?? ""} onChange={(v) => setAutomation("calendlyRoutingMode", v || null)} />
      </Field>
    </div>
  );
}

// ── Locked message ────────────────────────────────────────────────────────────

function LockedMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
      <p className="text-sm font-medium text-amber-700">🔒 {message}</p>
      <p className="mt-1 text-xs text-amber-600">Cambia el plan en la barra superior para habilitar este módulo.</p>
    </div>
  );
}

// ── Default config factories ──────────────────────────────────────────────────

function defaultModuleConfig(c: ModuleConfig): NonNullable<ModuleConfig> {
  return {
    heroEnabled: true, videoEnabled: false, galleryEnabled: false,
    businessModelsEnabled: false, financialsEnabled: true, faqEnabled: false,
    brochureEnabled: false, bookingEnabled: false, chatbotEnabled: false, nurturingEnabled: false,
    ...c,
  };
}

function defaultAutomationConfig(c: AutomationConfig): NonNullable<AutomationConfig> {
  return {
    enabled: false, bookingUrl: null, nurtureSequenceId: null,
    webhookUrl: null, crmDestination: null, calendlyRoutingMode: null,
    ...c,
  };
}
