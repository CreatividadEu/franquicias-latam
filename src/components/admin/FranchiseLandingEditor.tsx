"use client";

import { useState, useCallback, useEffect } from "react";
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

type Country = { id: string; name: string; flag: string; code: string };

type FeatureFlags = {
  showBot: boolean; showVideo: boolean; showGallery: boolean;
  showTestimonials: boolean; showKpis: boolean; showDownloads: boolean; showContactForm: boolean;
};

type BotConfig = {
  enabled: boolean; fallbackMessage: string; systemInstructions: string; tone: string | null;
};

type BotFaq = {
  id: string; question: string; answer: string; priority: number; enabled: boolean;
};

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
  { id: "financials", label: "Financieros" },
  { id: "ctas", label: "CTAs" },
  { id: "video", label: "Video" },
  { id: "models", label: "Modelos" },
  { id: "gallery", label: "Galería" },
  { id: "faq", label: "FAQ" },
  { id: "booking", label: "Reservas" },
  { id: "brochure", label: "Descargas" },
  { id: "chatbot", label: "Chatbot" },
  { id: "base", label: "Config Base" },
  { id: "botlegacy", label: "Bot Legacy" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Plan-aware constants ───────────────────────────────────────────────────────

const PLAN_LEVEL: Record<PlanTier, number> = { BASIC: 0, GROWTH: 1, ALL_IN: 2 };

// Plan selector pill styles
const PLAN_STYLES: Record<PlanTier, { active: string; inactive: string }> = {
  BASIC: {
    active: "bg-gray-700 text-white shadow-sm",
    inactive: "border border-gray-300 text-gray-600 hover:bg-gray-50",
  },
  GROWTH: {
    active: "bg-blue-600 text-white shadow-sm",
    inactive: "border border-blue-200 text-blue-600 hover:bg-blue-50",
  },
  ALL_IN: {
    active: "bg-purple-600 text-white shadow-sm",
    inactive: "border border-purple-200 text-purple-600 hover:bg-purple-50",
  },
};

// Which module name (from plan-entitlements) each tab maps to
// Tabs not in this map are always available
const TAB_MODULE: Partial<Record<TabId, string>> = {
  video: "video",
  models: "businessModels",
  gallery: "gallery",
  faq: "faq",
  booking: "booking",
  brochure: "brochure",
  chatbot: "chatbot",
};

// Module name → moduleConfig key
const MODULE_CONFIG_KEY: Record<string, keyof NonNullable<ModuleConfig>> = {
  video: "videoEnabled",
  gallery: "galleryEnabled",
  businessModels: "businessModelsEnabled",
  faq: "faqEnabled",
  booking: "bookingEnabled",
  brochure: "brochureEnabled",
  chatbot: "chatbotEnabled",
};

const MODULE_DISPLAY_NAMES: Record<string, string> = {
  video: "Video",
  gallery: "Galería",
  businessModels: "Modelos",
  faq: "FAQ",
  booking: "Reservas",
  brochure: "Descargas",
  chatbot: "Chatbot",
  hero: "Hero",
  financials: "Financieros",
  nurturing: "Nurturing",
};

// Compute full moduleConfig from a plan (plan defines what's enabled)
function planToModuleConfig(plan: PlanTier): NonNullable<ModuleConfig> {
  const modules = PLAN_ENTITLEMENTS[plan].modules as readonly string[];
  return {
    heroEnabled: modules.includes("hero"),
    videoEnabled: modules.includes("video"),
    galleryEnabled: modules.includes("gallery"),
    businessModelsEnabled: modules.includes("businessModels"),
    financialsEnabled: modules.includes("financials"),
    faqEnabled: modules.includes("faq"),
    brochureEnabled: modules.includes("brochure"),
    bookingEnabled: modules.includes("booking"),
    chatbotEnabled: modules.includes("chatbot"),
    nurturingEnabled: modules.includes("nurturing"),
  };
}

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

// ── ModuleTabHeader ────────────────────────────────────────────────────────────

function ModuleTabHeader({
  moduleKey, label, moduleConfig, setModule,
}: {
  moduleKey: keyof NonNullable<ModuleConfig>;
  label: string;
  moduleConfig: ModuleConfig;
  setModule: (k: keyof NonNullable<ModuleConfig>, v: boolean) => void;
}) {
  const cfg = defaultModuleConfig(moduleConfig);
  const isOn = cfg[moduleKey] as boolean;

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <label className="flex cursor-pointer items-center gap-2">
        <span className="text-xs text-gray-500">{isOn ? "Activado" : "Desactivado"}</span>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={isOn}
            onChange={(e) => setModule(moduleKey, e.target.checked)}
          />
          <div className={cn("h-5 w-9 rounded-full transition-colors", isOn ? "bg-blue-600" : "bg-gray-300")} />
          <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", isOn ? "translate-x-4" : "translate-x-0.5")} />
        </div>
      </label>
    </div>
  );
}

// ── Locked message ────────────────────────────────────────────────────────────

function LockedMessage({ planRequired }: { planRequired: PlanTier }) {
  const planLabel = PLAN_ENTITLEMENTS[planRequired].label;
  const planStyles: Record<PlanTier, string> = {
    BASIC: "text-gray-700",
    GROWTH: "text-blue-700",
    ALL_IN: "text-purple-700",
  };
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
      <span className="text-3xl">🔒</span>
      <p className="text-sm font-semibold text-gray-700">
        Disponible en plan{" "}
        <span className={planStyles[planRequired]}>{planLabel}</span>
      </p>
      <p className="text-xs text-gray-400">
        Cambia el plan en la barra superior para activar este módulo.
      </p>
    </div>
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

  function handlePlanChange(newPlan: PlanTier) {
    const currentLevel = PLAN_LEVEL[plan];
    const newLevel = PLAN_LEVEL[newPlan];

    if (newLevel < currentLevel) {
      const currentModules = PLAN_ENTITLEMENTS[plan].modules as readonly string[];
      const newModules = PLAN_ENTITLEMENTS[newPlan].modules as readonly string[];
      const lostModules = currentModules.filter((m) => !newModules.includes(m));

      if (lostModules.length > 0) {
        const lostNames = lostModules.map((m) => MODULE_DISPLAY_NAMES[m] ?? m).join(", ");
        const ok = window.confirm(
          `Cambiar a ${PLAN_ENTITLEMENTS[newPlan].label} desactivará: ${lostNames}.\nLos datos no se eliminan, solo se ocultan de la landing page.\n¿Confirmar?`
        );
        if (!ok) return;
      }
    }

    const newModuleConfig = planToModuleConfig(newPlan);
    setData((prev) => ({ ...prev, planTier: newPlan, moduleConfig: newModuleConfig }));
    setSaved(false);

    // If the active tab will be locked in new plan, go back to general
    const moduleName = TAB_MODULE[activeTab];
    if (moduleName && !isModuleAllowed(newPlan, moduleName)) {
      setActiveTab("general");
    }
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

  function renderTabContent() {
    const moduleName = TAB_MODULE[activeTab];

    // Check plan lock
    if (moduleName && !isModuleAllowed(plan, moduleName)) {
      // Find which plan first enables this module
      const minPlan = (["BASIC", "GROWTH", "ALL_IN"] as PlanTier[]).find((p) =>
        isModuleAllowed(p, moduleName)
      ) ?? "GROWTH";
      return <LockedMessage planRequired={minPlan} />;
    }

    // Module tab header (toggle to disable the module within plan)
    const moduleHeader = moduleName ? (
      <ModuleTabHeader
        moduleKey={MODULE_CONFIG_KEY[moduleName]}
        label={MODULE_DISPLAY_NAMES[moduleName] ?? moduleName}
        moduleConfig={data.moduleConfig}
        setModule={setModule}
      />
    ) : null;

    switch (activeTab) {
      case "general":
        return <GeneralTab data={data} set={set} sectors={sectors} />;
      case "hero":
        return <HeroTab data={data} set={set} />;
      case "financials":
        return <FinancialsTab data={data} set={set} />;
      case "ctas":
        return <CtasTab data={data} set={set} />;
      case "video":
        return <>{moduleHeader}<VideoTab data={data} set={set} /></>;
      case "models":
        return (
          <>
            {moduleHeader}
            <ModelsTab
              franchiseId={data.id} models={data.businessModels} plan={plan}
              onRefresh={(models) => setData((p) => ({ ...p, businessModels: models }))}
            />
          </>
        );
      case "gallery":
        return (
          <>
            {moduleHeader}
            <GalleryTab
              franchiseId={data.id} media={data.media} plan={plan}
              onRefresh={(media) => setData((p) => ({ ...p, media }))}
            />
          </>
        );
      case "faq":
        return (
          <>
            {moduleHeader}
            <FaqTab
              franchiseId={data.id} faqs={data.faqs} plan={plan}
              onRefresh={(faqs) => setData((p) => ({ ...p, faqs }))}
            />
          </>
        );
      case "booking":
        return <>{moduleHeader}<BookingTab data={data} set={set} /></>;
      case "brochure":
        return <>{moduleHeader}<BrochureTab data={data} set={set} /></>;
      case "chatbot":
        return <>{moduleHeader}<ChatbotTab /></>;
      case "base":
        return <BaseConfigTab franchiseId={data.id} franchise={data} />;
      case "botlegacy":
        return <BotLegacyTab franchiseId={data.id} />;
      default:
        return null;
    }
  }

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
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-4">
        <span className="text-sm font-medium text-gray-700 mr-1">Plan:</span>
        {(["BASIC", "GROWTH", "ALL_IN"] as PlanTier[]).map((p) => {
          const styles = PLAN_STYLES[p];
          return (
            <button
              key={p}
              onClick={() => handlePlanChange(p)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                data.planTier === p ? styles.active : styles.inactive
              )}
            >
              {PLAN_ENTITLEMENTS[p].label}
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {TABS.map((tab) => {
            const moduleName = TAB_MODULE[tab.id];
            const planAllows = !moduleName || isModuleAllowed(plan, moduleName);
            const cfgKey = moduleName ? MODULE_CONFIG_KEY[moduleName] : undefined;
            const cfg = defaultModuleConfig(data.moduleConfig);
            const isOn = cfgKey ? (cfg[cfgKey] as boolean) : true;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-shrink-0 items-center gap-1 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : planAllows && isOn
                    ? "text-gray-500 hover:text-gray-700"
                    : planAllows && !isOn
                    ? "text-gray-400 hover:text-gray-600"
                    : "cursor-default text-gray-300"
                )}
              >
                {!planAllows && <span className="text-[10px]">🔒</span>}
                {tab.label}
                {planAllows && !isOn && (
                  <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-gray-300" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6 space-y-5">{renderTabContent()}</div>
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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

// ── Chatbot tab ───────────────────────────────────────────────────────────────

function ChatbotTab() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center space-y-2">
      <p className="text-sm font-medium text-gray-700">Chatbot de calificación activo</p>
      <p className="text-xs text-gray-500 max-w-sm mx-auto">
        El chatbot guía al visitante con preguntas sobre su perfil de inversión y le muestra un resultado personalizado. La lógica está preconfigurada.
      </p>
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

  async function refetch() {
    const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/models`);
    if (res.ok) onRefresh(await res.json());
  }

  async function deleteModel(id: string) {
    if (!confirm("¿Eliminar este modelo?")) return;
    await fetch(`/api/admin/landing/franchises/${franchiseId}/models/${id}`, { method: "DELETE" });
    await refetch();
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

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{images.length} / {max} imágenes</p>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
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

  // plan is kept for future per-plan FAQ limits; not used for locking (handled at tab level)
  void plan;

  async function refetch() {
    const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/faqs`);
    if (res.ok) onRefresh(await res.json());
  }

  async function deleteFaq(id: string) {
    if (!confirm("¿Eliminar esta FAQ?")) return;
    await fetch(`/api/admin/landing/franchises/${franchiseId}/faqs/${id}`, { method: "DELETE" });
    await refetch();
  }

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

// ── Base Config tab ───────────────────────────────────────────────────────────

function BaseConfigTab({
  franchiseId,
  franchise,
}: {
  franchiseId: string;
  franchise: Franchise;
}) {
  // franchise prop available for future use / initial data
  void franchise;

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    sectorId: "",
    active: true,
    featured: false,
    contactEmail: "",
    logo: "",
    video: "",
  });
  const [automation, setAutomationState] = useState({
    enabled: false,
    webhookUrl: "",
    crmDestination: "",
    nurtureSequenceId: "",
    calendlyRoutingMode: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [secRes, countryRes, fRes] = await Promise.all([
        fetch("/api/sectors"),
        fetch("/api/countries"),
        fetch(`/api/admin/landing/franchises/${franchiseId}`),
      ]);
      if (secRes.ok) {
        const d = await secRes.json();
        setSectors(d.sectors ?? d);
      }
      if (countryRes.ok) {
        const d = await countryRes.json();
        setCountries(d.countries ?? d);
      }
      if (fRes.ok) {
        const f = await fRes.json();
        setForm({
          sectorId: f.sectorId ?? "",
          active: f.active ?? true,
          featured: f.featured ?? false,
          contactEmail: f.contactEmail ?? "",
          logo: f.logo ?? "",
          video: f.video ?? "",
        });
        const ids = (f.coverageCountries ?? []).map(
          (c: { countryId: string }) => c.countryId
        );
        setSelectedCountryIds(ids);
        if (f.automationConfig) {
          setAutomationState({
            enabled: f.automationConfig.enabled ?? false,
            webhookUrl: f.automationConfig.webhookUrl ?? "",
            crmDestination: f.automationConfig.crmDestination ?? "",
            nurtureSequenceId: f.automationConfig.nurtureSequenceId ?? "",
            calendlyRoutingMode: f.automationConfig.calendlyRoutingMode ?? "",
          });
        }
      }
    }
    load();
  }, [franchiseId]);

  function toggleCountry(id: string) {
    setSelectedCountryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const headers = { "Content-Type": "application/json" };
      const base = `/api/admin/landing/franchises/${franchiseId}`;

      await Promise.all([
        fetch(base, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            sectorId: form.sectorId || undefined,
            active: form.active,
            featured: form.featured,
            contactEmail: form.contactEmail || null,
            logo: form.logo || null,
            video: form.video || null,
            coverageCountryIds: selectedCountryIds,
          }),
        }).then((r) => { if (!r.ok) throw new Error("Error guardando configuración base"); }),

        fetch(`${base}/automation`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            enabled: automation.enabled,
            webhookUrl: automation.webhookUrl || null,
            crmDestination: automation.crmDestination || null,
            nurtureSequenceId: automation.nurtureSequenceId || null,
            calendlyRoutingMode: automation.calendlyRoutingMode || null,
          }),
        }).then((r) => { if (!r.ok) console.warn("Error guardando automatización"); }),
      ]);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Sector">
          <select
            value={form.sectorId}
            onChange={(e) => { setForm((p) => ({ ...p, sectorId: e.target.value })); setSaved(false); }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">— Seleccionar sector —</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Email de contacto">
          <Input
            value={form.contactEmail}
            onChange={(v) => { setForm((p) => ({ ...p, contactEmail: v })); setSaved(false); }}
            placeholder="contacto@franquicia.com"
          />
        </Field>

        <Field label="Logo URL (legado)" hint="Campo logo heredado del sistema anterior">
          <Input
            value={form.logo}
            onChange={(v) => { setForm((p) => ({ ...p, logo: v })); setSaved(false); }}
            placeholder="https://..."
          />
        </Field>

        <Field label="Video URL (legado)" hint="Campo video heredado del sistema anterior">
          <Input
            value={form.video}
            onChange={(v) => { setForm((p) => ({ ...p, video: v })); setSaved(false); }}
            placeholder="https://..."
          />
        </Field>

        <div className="flex flex-col gap-3">
          <Toggle
            checked={form.active}
            onChange={(v) => { setForm((p) => ({ ...p, active: v })); setSaved(false); }}
            label="Activa"
          />
          <Toggle
            checked={form.featured}
            onChange={(v) => { setForm((p) => ({ ...p, featured: v })); setSaved(false); }}
            label="Destacada"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Países de cobertura
        </label>
        {countries.length === 0 ? (
          <p className="text-sm text-gray-400">Cargando países...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 rounded-lg border border-gray-200 p-3 max-h-64 overflow-y-auto">
            {countries.map((c) => (
              <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedCountryIds.includes(c.id)}
                  onChange={() => toggleCountry(c.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">{c.flag} {c.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Automatización */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
          Automatización
        </h3>
        <div className="space-y-4 rounded-xl border border-gray-200 p-4">
          <Toggle
            checked={automation.enabled}
            onChange={(v) => setAutomationState((p) => ({ ...p, enabled: v }))}
            label="Automatización habilitada"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Webhook URL">
              <Input
                value={automation.webhookUrl}
                onChange={(v) => setAutomationState((p) => ({ ...p, webhookUrl: v }))}
                placeholder="https://..."
              />
            </Field>
            <Field label="CRM destino">
              <Input
                value={automation.crmDestination}
                onChange={(v) => setAutomationState((p) => ({ ...p, crmDestination: v }))}
                placeholder="HubSpot, Pipedrive..."
              />
            </Field>
            <Field label="ID secuencia nurturing">
              <Input
                value={automation.nurtureSequenceId}
                onChange={(v) => setAutomationState((p) => ({ ...p, nurtureSequenceId: v }))}
              />
            </Field>
            <Field label="Modo routing Calendly">
              <Input
                value={automation.calendlyRoutingMode}
                onChange={(v) => setAutomationState((p) => ({ ...p, calendlyRoutingMode: v }))}
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <SaveButton saving={saving} saved={saved} onClick={save} />
      </div>
    </div>
  );
}

// ── Bot Legacy tab ─────────────────────────────────────────────────────────────

function BotLegacyTab({ franchiseId }: { franchiseId: string }) {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    showBot: false, showVideo: false, showGallery: true,
    showTestimonials: false, showKpis: true, showDownloads: false, showContactForm: true,
  });
  const [botConfig, setBotConfig] = useState<BotConfig>({
    enabled: false, fallbackMessage: "", systemInstructions: "", tone: null,
  });
  const [botFaqs, setBotFaqs] = useState<BotFaq[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingFaq, setAddingFaq] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/legacy`);
      if (res.ok) {
        const d = await res.json();
        if (d.featureFlags) {
          setFeatureFlags({
            showBot: d.featureFlags.showBot ?? false,
            showVideo: d.featureFlags.showVideo ?? false,
            showGallery: d.featureFlags.showGallery ?? true,
            showTestimonials: d.featureFlags.showTestimonials ?? false,
            showKpis: d.featureFlags.showKpis ?? true,
            showDownloads: d.featureFlags.showDownloads ?? false,
            showContactForm: d.featureFlags.showContactForm ?? true,
          });
        }
        if (d.botConfig) {
          setBotConfig({
            enabled: d.botConfig.enabled ?? false,
            fallbackMessage: d.botConfig.fallbackMessage ?? "",
            systemInstructions: d.botConfig.systemInstructions ?? "",
            tone: d.botConfig.tone ?? null,
          });
        }
        if (Array.isArray(d.botFaqs)) {
          setBotFaqs(d.botFaqs);
        }
      }
    }
    load();
  }, [franchiseId]);

  function setFlag(key: keyof FeatureFlags, val: boolean) {
    setFeatureFlags((p) => ({ ...p, [key]: val }));
    setSaved(false);
  }

  function setBot(key: keyof BotConfig, val: unknown) {
    setBotConfig((p) => ({ ...p, [key]: val }));
    setSaved(false);
  }

  async function saveAll() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/legacy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureFlags, botConfig }),
      });
      if (!res.ok) throw new Error("Error guardando configuración bot legacy");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm("¿Eliminar esta FAQ del bot?")) return;
    await fetch(`/api/admin/landing/franchises/${franchiseId}/legacy/bot-faqs/${id}`, {
      method: "DELETE",
    });
    setBotFaqs((p) => p.filter((f) => f.id !== id));
  }

  async function refetchFaqs() {
    const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/legacy`);
    if (res.ok) {
      const d = await res.json();
      if (Array.isArray(d.botFaqs)) setBotFaqs(d.botFaqs);
    }
  }

  const FLAG_LABELS: { key: keyof FeatureFlags; label: string }[] = [
    { key: "showBot", label: "Mostrar bot" },
    { key: "showVideo", label: "Mostrar video" },
    { key: "showGallery", label: "Mostrar galería" },
    { key: "showTestimonials", label: "Mostrar testimonios" },
    { key: "showKpis", label: "Mostrar KPIs" },
    { key: "showDownloads", label: "Mostrar descargas" },
    { key: "showContactForm", label: "Mostrar formulario de contacto" },
  ];

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Feature Flags */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Feature Flags (legado)
        </h3>
        <div className="space-y-3 rounded-xl border border-gray-200 p-4">
          {FLAG_LABELS.map(({ key, label }) => (
            <Toggle
              key={key}
              checked={featureFlags[key]}
              onChange={(v) => setFlag(key, v)}
              label={label}
            />
          ))}
        </div>
      </div>

      {/* Bot Config */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Configuración del Bot
        </h3>
        <div className="space-y-4 rounded-xl border border-gray-200 p-4">
          <Toggle
            checked={botConfig.enabled}
            onChange={(v) => setBot("enabled", v)}
            label="Bot habilitado"
          />
          <Field label="Tono">
            <Input
              value={botConfig.tone ?? ""}
              onChange={(v) => setBot("tone", v || null)}
              placeholder="amigable, profesional..."
            />
          </Field>
          <Field label="Mensaje de fallback">
            <Textarea
              value={botConfig.fallbackMessage}
              onChange={(v) => setBot("fallbackMessage", v)}
              rows={3}
              placeholder="Gracias por tu consulta, te contactaremos pronto..."
            />
          </Field>
          <Field label="Instrucciones del sistema">
            <Textarea
              value={botConfig.systemInstructions}
              onChange={(v) => setBot("systemInstructions", v)}
              rows={5}
              placeholder="Eres un asistente de franquicias..."
            />
          </Field>
        </div>
      </div>

      <div>
        <SaveButton saving={saving} saved={saved} onClick={saveAll} />
      </div>

      {/* Bot FAQs */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            FAQs del Bot
          </h3>
          <button
            onClick={() => setAddingFaq(true)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            + Agregar FAQ
          </button>
        </div>

        {addingFaq && (
          <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <BotFaqForm
              franchiseId={franchiseId}
              onSave={async () => { setAddingFaq(false); await refetchFaqs(); }}
              onCancel={() => setAddingFaq(false)}
            />
          </div>
        )}

        <div className="space-y-3">
          {botFaqs.length === 0 && !addingFaq && (
            <p className="text-sm text-gray-400">No hay FAQs del bot todavía.</p>
          )}
          {botFaqs.map((faq) => (
            <div key={faq.id} className="rounded-lg border border-gray-200 p-4">
              {editingFaqId === faq.id ? (
                <BotFaqForm
                  franchiseId={franchiseId}
                  faqId={faq.id}
                  initial={faq}
                  onSave={async () => { setEditingFaqId(null); await refetchFaqs(); }}
                  onCancel={() => setEditingFaqId(null)}
                />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm">{faq.question}</p>
                      <span className={cn(
                        "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                        faq.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {faq.enabled ? "Activa" : "Inactiva"}
                      </span>
                      <span className="flex-shrink-0 text-xs text-gray-400">P: {faq.priority}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditingFaqId(faq.id)} className="text-xs text-blue-600 hover:underline">Editar</button>
                    <button onClick={() => deleteFaq(faq.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BotFaqForm({
  franchiseId, faqId, initial, onSave, onCancel,
}: {
  franchiseId: string;
  faqId?: string;
  initial?: BotFaq;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [priority, setPriority] = useState(String(initial?.priority ?? 0));
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!question.trim() || !answer.trim()) return;
    setSaving(true);
    const url = faqId
      ? `/api/admin/landing/franchises/${franchiseId}/legacy/bot-faqs/${faqId}`
      : `/api/admin/landing/franchises/${franchiseId}/legacy/bot-faqs`;
    await fetch(url, {
      method: faqId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, priority: Number(priority), enabled }),
    });
    setSaving(false);
    onSave();
  }

  return (
    <div className="space-y-3">
      <Field label="Pregunta"><Input value={question} onChange={setQuestion} /></Field>
      <Field label="Respuesta"><Textarea value={answer} onChange={setAnswer} rows={3} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Prioridad (mayor = más importante)">
          <Input type="number" value={priority} onChange={setPriority} />
        </Field>
        <div className="flex items-end pb-1">
          <Toggle checked={enabled} onChange={setEnabled} label="Activa" />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving || !question.trim() || !answer.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Guardando..." : faqId ? "Actualizar" : "Agregar"}
        </button>
        <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Cancelar
        </button>
      </div>
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
