"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PLAN_ENTITLEMENTS, isModuleAllowed } from "@/lib/plan-entitlements";
import type { PlanTier } from "@/lib/plan-entitlements";
import { ImageUpload } from "@/components/admin/ImageUpload";

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
  showVerifiedBadge: boolean;
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
  credibilityLine: string | null; foundingYear: number | null; cta1Label: string | null; cta1Url: string | null;
  cta2Label: string | null; cta2Url: string | null; ebitdaReference: string | null;
  paybackMonths: number | null; royaltyInfo: string | null; operatorProfile: string | null;
  businessModels: BusinessModel[]; media: MediaItem[]; faqs: FaqItem[];
  moduleConfig: ModuleConfig; automationConfig: AutomationConfig;
};

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS = [
  { id: "general", label: "General" },
  { id: "financials", label: "Financieros" },
  { id: "ctas", label: "CTAs" },
  { id: "video", label: "Video" },
  { id: "models", label: "Modelos" },
  { id: "gallery", label: "Galería" },
  { id: "faq", label: "FAQ" },
  { id: "booking", label: "Reservas" },
  { id: "brochure", label: "Descargas" },
  { id: "bot", label: "Bot" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ── Plan-aware constants ───────────────────────────────────────────────────────

const PLAN_LEVEL: Record<PlanTier, number> = { BASIC: 0, GROWTH: 1, ALL_IN: 2 };

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
const TAB_MODULE: Partial<Record<TabId, string>> = {
  video: "video",
  models: "businessModels",
  gallery: "gallery",
  faq: "faq",
  booking: "booking",
  brochure: "brochure",
  bot: "chatbot",
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

const DEFAULT_CALENDLY_URL = "https://calendly.com/franquiciaslatam/programa-acelerado";

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
    showVerifiedBadge: false,
  };
}

// ── Parse / format helpers for financials ────────────────────────────────────

function parseEbitdaString(s: string | null): { min: string; max: string } {
  if (!s) return { min: "", max: "" };
  const m = s.match(/(\d+(?:\.\d+)?)\s*[%–-]+\s*(\d+(?:\.\d+)?)/);
  if (m) return { min: m[1], max: m[2] };
  const single = s.match(/(\d+(?:\.\d+)?)/);
  return single ? { min: single[1], max: "" } : { min: "", max: "" };
}

function formatEbitdaString(min: string, max: string): string | null {
  if (!min && !max) return null;
  if (!max) return `${min}%`;
  return `${min}%-${max}%`;
}

function parseRoyaltyString(s: string | null): { royalty: string; adFund: string } {
  if (!s) return { royalty: "", adFund: "" };
  const nums = s.match(/(\d+(?:\.\d+)?)/g);
  if (!nums) return { royalty: "", adFund: "" };
  return { royalty: nums[0] ?? "", adFund: nums[1] ?? "" };
}

function formatRoyaltyString(royalty: string, adFund: string): string | null {
  if (!royalty && !adFund) return null;
  if (!adFund) return `${royalty}% sobre ventas`;
  return `${royalty}% sobre ventas, ${adFund}% fondo de publicidad`;
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

  // Base config state (lifted from old BaseConfigTab)
  const [allSectors, setAllSectors] = useState<Sector[]>(sectors);
  const [allCountries, setAllCountries] = useState<Country[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [baseForm, setBaseForm] = useState({
    sectorId: "",
    active: true,
    featured: false,
    contactEmail: "",
    logo: "",
    video: "",
  });
  const [automation, setAutomation] = useState({
    enabled: false,
    webhookUrl: "",
    crmDestination: "",
    nurtureSequenceId: "",
    calendlyRoutingMode: "",
  });

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

  function setBaseFormField<K extends keyof typeof baseForm>(key: K, value: (typeof baseForm)[K]) {
    setBaseForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setAutomationField<K extends keyof typeof automation>(key: K, value: (typeof automation)[K]) {
    setAutomation((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  // Load base config, sectors, countries
  useEffect(() => {
    async function loadBase() {
      const [secRes, countryRes, fRes] = await Promise.all([
        fetch("/api/sectors"),
        fetch("/api/countries"),
        fetch(`/api/admin/landing/franchises/${initial.id}`),
      ]);
      if (secRes.ok) {
        const d = await secRes.json();
        setAllSectors(d.sectors ?? d);
      }
      if (countryRes.ok) {
        const d = await countryRes.json();
        setAllCountries(d.countries ?? d);
      }
      if (fRes.ok) {
        const f = await fRes.json();
        setBaseForm({
          sectorId: f.sectorId ?? "",
          active: f.active ?? true,
          featured: f.featured ?? false,
          contactEmail: f.contactEmail ?? "",
          logo: f.logo ?? "",
          video: f.video ?? "",
        });
        setSelectedCountryIds((f.coverageCountries ?? []).map((c: { countryId: string }) => c.countryId));
        if (f.automationConfig) {
          setAutomation({
            enabled: f.automationConfig.enabled ?? false,
            webhookUrl: f.automationConfig.webhookUrl ?? "",
            crmDestination: f.automationConfig.crmDestination ?? "",
            nurtureSequenceId: f.automationConfig.nurtureSequenceId ?? "",
            calendlyRoutingMode: f.automationConfig.calendlyRoutingMode ?? "",
          });
        }
      }
    }
    loadBase();
  }, [initial.id]);

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

    const newModuleConfig = {
      ...planToModuleConfig(newPlan),
      showVerifiedBadge: data.moduleConfig?.showVerifiedBadge ?? false,
    };
    setData((prev) => ({ ...prev, planTier: newPlan, moduleConfig: newModuleConfig }));
    setSaved(false);

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
            credibilityLine: data.credibilityLine, foundingYear: data.foundingYear, cta1Label: data.cta1Label, cta1Url: data.cta1Url,
            cta2Label: data.cta2Label, cta2Url: data.cta2Url, ebitdaReference: data.ebitdaReference,
            paybackMonths: data.paybackMonths, royaltyInfo: data.royaltyInfo,
            operatorProfile: data.operatorProfile,
            investmentMin: data.investmentMin, investmentMax: data.investmentMax,
            // base config fields
            sectorId: baseForm.sectorId || undefined,
            active: baseForm.active,
            featured: baseForm.featured,
            contactEmail: baseForm.contactEmail || null,
            logo: baseForm.logo || null,
            video: baseForm.video || null,
            coverageCountryIds: selectedCountryIds,
          }),
        }).then((r) => { if (!r.ok) throw new Error("Error guardando datos principales"); }),

        data.moduleConfig && fetch(`${base}/modules`, {
          method: "PUT", headers, body: JSON.stringify(data.moduleConfig),
        }).then((r) => { if (!r.ok) throw new Error("Error guardando módulos"); }),

        fetch(`${base}/automation`, {
          method: "PUT", headers,
          body: JSON.stringify({
            enabled: automation.enabled,
            webhookUrl: automation.webhookUrl || null,
            crmDestination: automation.crmDestination || null,
            nurtureSequenceId: automation.nurtureSequenceId || null,
            calendlyRoutingMode: automation.calendlyRoutingMode || null,
          }),
        }).then((r) => { if (!r.ok) console.warn("Error guardando automatización"); }),
      ].filter(Boolean));

      // Re-fetch to sync collections (businessModels, media, faqs) after save
      const freshRes = await fetch(`/api/admin/landing/franchises/${data.id}`);
      if (freshRes.ok) {
        const fresh = await freshRes.json();
        setData((prev) => ({
          ...prev,
          businessModels: fresh.businessModels ?? prev.businessModels,
          media: fresh.media ?? prev.media,
          faqs: fresh.faqs ?? prev.faqs,
        }));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }, [data, baseForm, selectedCountryIds, automation]);

  const slugForPreview = data.slug ?? data.name.toLowerCase().replace(/\s+/g, "-");

  function renderTabContent() {
    const moduleName = TAB_MODULE[activeTab];

    if (moduleName && !isModuleAllowed(plan, moduleName)) {
      const minPlan = (["BASIC", "GROWTH", "ALL_IN"] as PlanTier[]).find((p) =>
        isModuleAllowed(p, moduleName)
      ) ?? "GROWTH";
      return <LockedMessage planRequired={minPlan} />;
    }

    const moduleHeader = moduleName && MODULE_CONFIG_KEY[moduleName] ? (
      <ModuleTabHeader
        moduleKey={MODULE_CONFIG_KEY[moduleName]}
        label={MODULE_DISPLAY_NAMES[moduleName] ?? moduleName}
        moduleConfig={data.moduleConfig}
        setModule={setModule}
      />
    ) : null;

    switch (activeTab) {
      case "general":
        return (
          <GeneralTab
            data={data}
            set={set}
            setModule={setModule}
            allSectors={allSectors}
            allCountries={allCountries}
            selectedCountryIds={selectedCountryIds}
            setSelectedCountryIds={(ids) => { setSelectedCountryIds(ids); setSaved(false); }}
            baseForm={baseForm}
            setBaseFormField={setBaseFormField}
            automation={automation}
            setAutomationField={setAutomationField}
          />
        );
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
      case "bot":
        return <BotTab franchiseId={data.id} />;
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

// ── General Tab ───────────────────────────────────────────────────────────────

function GeneralTab({
  data,
  set,
  setModule,
  allSectors,
  allCountries,
  selectedCountryIds,
  setSelectedCountryIds,
  baseForm,
  setBaseFormField,
  automation,
  setAutomationField,
}: {
  data: Franchise;
  set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void;
  setModule: (k: keyof NonNullable<ModuleConfig>, v: boolean) => void;
  allSectors: Sector[];
  allCountries: Country[];
  selectedCountryIds: string[];
  setSelectedCountryIds: (ids: string[]) => void;
  baseForm: { sectorId: string; active: boolean; featured: boolean; contactEmail: string; logo: string; video: string };
  setBaseFormField: <K extends keyof typeof baseForm>(k: K, v: (typeof baseForm)[K]) => void;
  automation: { enabled: boolean; webhookUrl: string; crmDestination: string; nurtureSequenceId: string; calendlyRoutingMode: string };
  setAutomationField: <K extends keyof typeof automation>(k: K, v: (typeof automation)[K]) => void;
}) {
  function toggleCountry(id: string) {
    setSelectedCountryIds(
      selectedCountryIds.includes(id)
        ? selectedCountryIds.filter((x) => x !== id)
        : [...selectedCountryIds, id]
    );
  }

  const shortDescLen = (data.shortDescription ?? "").length;

  return (
    <div className="space-y-8">
      {/* SECTION: Identidad */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">Identidad</h3>
        <div className="mb-4 border-t border-gray-100" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Nombre *">
              <Input value={data.name} onChange={(v) => set("name", v)} placeholder="Nombre de la franquicia" />
            </Field>
          </div>
          <Field label="Slug (URL)" hint="Solo letras, números y guiones. Ej: crem-helado">
            <Input value={data.slug ?? ""} onChange={(v) => set("slug", v || null)} placeholder="crem-helado" />
          </Field>
          <Field label="Email de contacto" hint="Email interno para notificaciones de leads.">
            <Input
              value={baseForm.contactEmail}
              onChange={(v) => setBaseFormField("contactEmail", v)}
              placeholder="contacto@franquicia.com"
            />
          </Field>
          <Field label="Sector" hint="Categoría principal de la franquicia.">
            <select
              value={baseForm.sectorId}
              onChange={(e) => setBaseFormField("sectorId", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">— Seleccionar sector —</option>
              {allSectors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      {/* Countries */}
      <section>
        <label className="mb-2 block text-sm font-medium text-gray-700">Países de cobertura</label>
        {allCountries.length === 0 ? (
          <p className="text-sm text-gray-400">Cargando países...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 rounded-lg border border-gray-200 p-3 max-h-64 overflow-y-auto">
            {allCountries.map((c) => (
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
      </section>

      <div className="border-t border-gray-100" />

      {/* SECTION: Contenido del Hero */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">Contenido del Hero</h3>
        <p className="mb-4 text-xs text-gray-400">Esto es lo que el visitante ve primero en la landing page.</p>
        <div className="space-y-5">
          <Field label="Titular (headline) *" hint="Frase principal. Máx 2 líneas. Ej: 'Tu franquicia ideal en minutos.'">
            <Input value={data.headline ?? ""} onChange={(v) => set("headline", v || null)} placeholder="La franquicia más..." />
          </Field>
          <Field label="Subtitular (subheadline)" hint="Complementa el titular. Máx 3 líneas.">
            <Textarea value={data.subheadline ?? ""} onChange={(v) => set("subheadline", v || null)} />
          </Field>
          <Field label="Línea de credibilidad" hint="Aparece como badge bajo el logo. Ej: '45 países · +US$200M/año'">
            <Input value={data.credibilityLine ?? ""} onChange={(v) => set("credibilityLine", v || null)} />
          </Field>
          <Field label="Año de fundación de la marca" hint="Se muestra como pill sobre el titular. Ej: 'Marca fundada en 2018'">
            <Input
              type="number"
              value={String(data.foundingYear ?? "")}
              onChange={(v) => set("foundingYear", v ? Number(v) : null)}
              placeholder="Ej: 2018"
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">Badge de verificación Franquicias LATAM</p>
              <p className="text-xs text-gray-400">Muestra el sello verificado encima del logo en el hero.</p>
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <span className="text-xs text-gray-500">
                {(data.moduleConfig?.showVerifiedBadge ?? false) ? "Activado" : "Desactivado"}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={data.moduleConfig?.showVerifiedBadge ?? false}
                  onChange={(e) => setModule("showVerifiedBadge", e.target.checked)}
                />
                <div className={cn("h-5 w-9 rounded-full transition-colors", (data.moduleConfig?.showVerifiedBadge ?? false) ? "bg-blue-600" : "bg-gray-300")} />
                <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", (data.moduleConfig?.showVerifiedBadge ?? false) ? "translate-x-4" : "translate-x-0.5")} />
              </div>
            </label>
          </div>
          <Field
            label="Descripción corta"
            hint="Para tarjetas y Google. No aparece en el hero."
          >
            <div className="space-y-1">
              <Textarea
                value={data.shortDescription ?? ""}
                onChange={(v) => set("shortDescription", v || null)}
                rows={2}
                placeholder="Descripción breve para SEO y tarjetas..."
              />
              <p className={cn("text-xs", shortDescLen > 160 ? "text-red-500" : "text-gray-400")}>
                {shortDescLen}/160 caracteres
              </p>
            </div>
          </Field>
          <Field label="Descripción larga" hint="Texto expandido para secciones internas de la landing.">
            <Textarea value={data.longDescription ?? ""} onChange={(v) => set("longDescription", v || null)} rows={5} />
          </Field>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* SECTION: Imágenes */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">Imágenes</h3>
        <div className="mb-4 border-t border-gray-100" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Logo">
            <ImageUpload
              value={data.logoUrl ?? ""}
              onChange={(url) => set("logoUrl", url || null)}
              storagePath={`franchise-assets/${data.slug ?? data.id}/logo`}
              hint="PNG o SVG. Se muestra en el hero y tarjetas."
              previewHeight="h-16"
            />
          </Field>
          <Field label="Imagen Hero">
            <ImageUpload
              value={data.heroImageUrl ?? ""}
              onChange={(url) => set("heroImageUrl", url || null)}
              storagePath={`franchise-assets/${data.slug ?? data.id}/hero`}
              hint="Imagen de fondo del hero. Mín 1200px ancho. JPG o WebP."
              previewHeight="h-24"
            />
          </Field>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* SECTION: Video */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">Video</h3>
        <div className="mb-4 border-t border-gray-100" />
        <Field label="URL de YouTube" hint="Aparece en la sección de video (plan Conversión+).">
          <Input
            value={data.youtubeUrl ?? ""}
            onChange={(v) => set("youtubeUrl", v || null)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </Field>
      </section>

      <div className="border-t border-gray-100" />

      {/* SECTION: Inversión */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">Inversión</h3>
        <div className="mb-4 border-t border-gray-100" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Inversión mínima (USD) *">
            <Input type="number" value={String(data.investmentMin)} onChange={(v) => set("investmentMin", Number(v))} placeholder="50000" />
          </Field>
          <Field label="Inversión máxima (USD) *">
            <Input type="number" value={String(data.investmentMax)} onChange={(v) => set("investmentMax", Number(v))} placeholder="120000" />
          </Field>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* SECTION: Estado y visibilidad */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">Estado y visibilidad</h3>
        <div className="mb-4 border-t border-gray-100" />
        <div className="flex flex-wrap gap-6">
          <Toggle
            checked={baseForm.active}
            onChange={(v) => setBaseFormField("active", v)}
            label="Activa"
          />
          <Toggle
            checked={baseForm.featured}
            onChange={(v) => setBaseFormField("featured", v)}
            label="Destacada"
          />
          <Toggle
            checked={data.published}
            onChange={(v) => set("published", v)}
            label="Publicada (landing visible)"
          />
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* SECTION: Sistema anterior (collapsible) */}
      <section>
        <details>
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700">
            Sistema anterior
          </summary>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Logo URL (legado)" hint="Campo heredado. Usa el upload de arriba.">
              <Input
                value={baseForm.logo}
                onChange={(v) => setBaseFormField("logo", v)}
                placeholder="https://..."
              />
            </Field>
            <Field label="Video URL (legado)" hint="Campo heredado. Usa YouTube URL arriba.">
              <Input
                value={baseForm.video}
                onChange={(v) => setBaseFormField("video", v)}
                placeholder="https://..."
              />
            </Field>
          </div>
        </details>
      </section>

      <div className="border-t border-gray-100" />

      {/* SECTION: Automatización (collapsible) */}
      <section>
        <details>
          <summary className="cursor-pointer text-sm font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700">
            Automatización
          </summary>
          <div className="mt-4 space-y-4 rounded-xl border border-gray-200 p-4">
            <Toggle
              checked={automation.enabled}
              onChange={(v) => setAutomationField("enabled", v)}
              label="Automatización habilitada"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Webhook URL" hint="Endpoint donde se envían los leads capturados.">
                <Input
                  value={automation.webhookUrl}
                  onChange={(v) => setAutomationField("webhookUrl", v)}
                  placeholder="https://..."
                />
              </Field>
              <Field label="CRM destino" hint="Nombre o ID del CRM de destino.">
                <Input
                  value={automation.crmDestination}
                  onChange={(v) => setAutomationField("crmDestination", v)}
                  placeholder="HubSpot, Pipedrive..."
                />
              </Field>
              <Field label="ID secuencia nurturing" hint="ID de la secuencia de emails automática.">
                <Input
                  value={automation.nurtureSequenceId}
                  onChange={(v) => setAutomationField("nurtureSequenceId", v)}
                />
              </Field>
              <Field label="Modo routing Calendly" hint="Configuración de routing para Calendly.">
                <Input
                  value={automation.calendlyRoutingMode}
                  onChange={(v) => setAutomationField("calendlyRoutingMode", v)}
                />
              </Field>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}

// ── Financials Tab ────────────────────────────────────────────────────────────

const OPERATOR_PROFILES = [
  { value: "INVERSOR", label: "Inversor — Busco oportunidades de inversión" },
  { value: "OPERACIONES", label: "Operaciones — Experiencia en gestión operativa" },
  { value: "VENTAS", label: "Ventas — Enfocado en ventas y marketing" },
  { value: "OTRO", label: "Otro" },
];

function FinancialsTab({
  data, set,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void }) {
  const [ebitda, setEbitda] = useState(() => parseEbitdaString(data.ebitdaReference));
  const [royalty, setRoyalty] = useState(() => parseRoyaltyString(data.royaltyInfo));

  function updateEbitda(field: "min" | "max", val: string) {
    const next = { ...ebitda, [field]: val };
    setEbitda(next);
    set("ebitdaReference", formatEbitdaString(next.min, next.max));
  }

  function updateRoyalty(field: "royalty" | "adFund", val: string) {
    const next = { ...royalty, [field]: val };
    setRoyalty(next);
    set("royaltyInfo", formatRoyaltyString(next.royalty, next.adFund));
  }

  return (
    <div className="space-y-8">
      {/* SECTION: Márgenes */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">Márgenes</h3>
        <div className="mb-4 border-t border-gray-100" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="EBITDA mínimo (%)" hint="Rango de EBITDA esperado. Mínimo aceptable.">
            <Input type="number" value={ebitda.min} onChange={(v) => updateEbitda("min", v)} placeholder="17" />
          </Field>
          <Field label="EBITDA máximo (%)" hint="Rango de EBITDA esperado. Máximo proyectado.">
            <Input type="number" value={ebitda.max} onChange={(v) => updateEbitda("max", v)} placeholder="23" />
          </Field>
          <Field label="Retorno estimado (meses)" hint="Payback estimado en meses.">
            <Input type="number" value={String(data.paybackMonths ?? "")} onChange={(v) => set("paybackMonths", v ? Number(v) : null)} placeholder="12" />
          </Field>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* SECTION: Regalías */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">Regalías</h3>
        <div className="mb-4 border-t border-gray-100" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Regalía sobre ventas (%)" hint="% mensual sobre ventas brutas.">
            <Input type="number" value={royalty.royalty} onChange={(v) => updateRoyalty("royalty", v)} placeholder="5" />
          </Field>
          <Field label="Fondo de publicidad (%)" hint="% mensual sobre ventas destinado a publicidad.">
            <Input type="number" value={royalty.adFund} onChange={(v) => updateRoyalty("adFund", v)} placeholder="2" />
          </Field>
        </div>
      </section>

      <div className="border-t border-gray-100" />

      {/* SECTION: Perfil */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">Perfil</h3>
        <div className="mb-4 border-t border-gray-100" />
        <Field label="Perfil del operador" hint="Debe coincidir con las opciones del quiz de matching.">
          <select
            value={data.operatorProfile ?? ""}
            onChange={(e) => set("operatorProfile", e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">— Sin especificar —</option>
            {OPERATOR_PROFILES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </Field>
      </section>
    </div>
  );
}

// ── CTAs Tab ──────────────────────────────────────────────────────────────────

function CtasTab({
  data, set,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void }) {
  return (
    <div className="space-y-8">
      {/* SECTION: CTA Principal */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">CTA Principal (Hero)</h3>
        <div className="mb-4 border-t border-gray-100" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Texto del botón" hint="Aparece en el hero como botón primario.">
            <Input value={data.cta1Label ?? ""} onChange={(v) => set("cta1Label", v || null)} placeholder="Agendar Llamada" />
          </Field>
          <Field label="URL destino" hint="Destino del botón principal.">
            <Input value={data.cta1Url ?? ""} onChange={(v) => set("cta1Url", v || null)} placeholder={DEFAULT_CALENDLY_URL} />
          </Field>
        </div>
        <button
          onClick={() => { set("cta1Label", "Agendar Llamada"); set("cta1Url", DEFAULT_CALENDLY_URL); }}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          Restaurar default (Agendar Llamada + Calendly)
        </button>
      </section>

      <div className="border-t border-gray-100" />

      {/* SECTION: CTA Secundario */}
      <section>
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-gray-700">CTA Secundario (Hero)</h3>
        <div className="mb-4 border-t border-gray-100" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Texto del botón" hint="Aparece solo si hay brochure configurado.">
            <Input value={data.cta2Label ?? ""} onChange={(v) => set("cta2Label", v || null)} placeholder="Descargar Dossier" />
          </Field>
          <Field label="URL destino" hint="Enlace al dossier o sección interna.">
            <Input value={data.cta2Url ?? ""} onChange={(v) => set("cta2Url", v || null)} placeholder="https://..." />
          </Field>
        </div>
      </section>
    </div>
  );
}

// ── Video Tab ─────────────────────────────────────────────────────────────────

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

// ── Brochure Tab ──────────────────────────────────────────────────────────────

function BrochureTab({
  data, set,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void }) {
  return (
    <div className="space-y-5">
      <Field label="Dossier / Brochure" hint="PDF descargable. Sube un archivo o pega una URL directamente.">
        <ImageUpload
          value={data.brochureUrl ?? ""}
          onChange={(url) => set("brochureUrl", url || null)}
          storagePath={`franchise-assets/${data.slug ?? data.id}/brochure`}
          accept=".pdf,application/pdf"
          hint="PDF u otro archivo descargable."
          previewHeight="h-8"
        />
      </Field>
    </div>
  );
}

// ── Booking Tab ───────────────────────────────────────────────────────────────

function BookingTab({
  data, set,
}: { data: Franchise; set: <K extends keyof Franchise>(k: K, v: Franchise[K]) => void }) {
  return (
    <div className="space-y-5">
      <Field
        label="URL de reserva de llamada"
        hint={`Calendly, Cal.com u otro agendador. Default: ${DEFAULT_CALENDLY_URL}`}
      >
        <Input value={data.bookingUrl ?? ""} onChange={(v) => set("bookingUrl", v || null)} placeholder={DEFAULT_CALENDLY_URL} />
      </Field>
    </div>
  );
}

// ── Bot tab (merged Chatbot + BotLegacy) ──────────────────────────────────────

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
  const [formError, setFormError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setFormError(null);
    const url = modelId
      ? `/api/admin/landing/franchises/${franchiseId}/models/${modelId}`
      : `/api/admin/landing/franchises/${franchiseId}/models`;
    const res = await fetch(url, {
      method: modelId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      setFormError("Error guardando. Intenta de nuevo.");
      return;
    }
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
      {formError && (
        <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {formError}
        </div>
      )}
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

const GALLERY_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const GALLERY_MAX_MB = 5;

function GalleryTab({
  franchiseId, media, plan, onRefresh,
}: { franchiseId: string; media: MediaItem[]; plan: PlanTier; onRefresh: (m: MediaItem[]) => void }) {
  const [addMode, setAddMode] = useState<"url" | "file">("url");
  // URL mode
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  // File mode
  const [file, setFile] = useState<File | null>(null);
  const [fileLabel, setFileLabel] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Shared
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const images = media.filter((m) => m.type === "image");
  const max = PLAN_ENTITLEMENTS[plan].maxGalleryImages;

  async function refetch() {
    const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/media`);
    if (res.ok) onRefresh(await res.json());
  }

  function validateFile(f: File): string | null {
    if (!GALLERY_ACCEPTED_TYPES.includes(f.type)) return "Formato no válido. Usa JPG, PNG o WebP.";
    if (f.size > GALLERY_MAX_MB * 1024 * 1024) return `Archivo muy grande. Máximo ${GALLERY_MAX_MB} MB.`;
    return null;
  }

  function pickFile(files: FileList | null) {
    if (!files || files.length === 0) return;
    const f = files[0];
    const err = validateFile(f);
    if (err) { setAddError(err); return; }
    setAddError(null);
    setFile(f);
  }

  function clearFile() {
    setFile(null);
    setAddError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function addImage() {
    if (!url) return;
    setAdding(true);
    setAddError(null);
    const body = new FormData();
    body.append("url", url);
    body.append("type", "image");
    body.append("label", label);
    body.append("order", String(images.length));
    const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/media`, { method: "POST", body });
    if (!res.ok) {
      setAddError("Error agregando imagen. Intenta de nuevo.");
      setAdding(false);
      return;
    }
    setUrl(""); setLabel("");
    await refetch();
    setAdding(false);
  }

  async function addImageByFile() {
    if (!file) return;
    setAdding(true);
    setAddError(null);
    const body = new FormData();
    body.append("file", file);
    body.append("type", "image");
    body.append("label", fileLabel);
    body.append("order", String(images.length));
    const res = await fetch(`/api/admin/landing/franchises/${franchiseId}/media`, { method: "POST", body });
    if (!res.ok) {
      const json = await res.json().catch(() => ({})) as { error?: string };
      setAddError(json.error ?? "Error subiendo imagen. Intenta de nuevo.");
      setAdding(false);
      return;
    }
    clearFile();
    setFileLabel("");
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
          {/* Mode switcher */}
          <div className="flex gap-1 rounded-md bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => { setAddMode("url"); setAddError(null); }}
              className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                addMode === "url" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Por URL
            </button>
            <button
              type="button"
              onClick={() => { setAddMode("file"); setAddError(null); }}
              className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                addMode === "file" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Subir archivo
            </button>
          </div>

          {addMode === "url" ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input value={url} onChange={setUrl} placeholder="https://..." />
                <Input value={label} onChange={setLabel} placeholder="Etiqueta (opcional)" />
              </div>
              {addError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {addError}
                </div>
              )}
              <button onClick={addImage} disabled={!url || adding} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                {adding ? "Agregando..." : "Agregar"}
              </button>
            </>
          ) : (
            <>
              {/* Drop zone */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => !adding && fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files); }}
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 p-6 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  dragging
                    ? "border-blue-400 bg-blue-50"
                    : file
                    ? "border-gray-300 bg-gray-50"
                    : "border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                } ${adding ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {adding ? (
                  <>
                    <svg className="h-6 w-6 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span className="text-xs text-gray-500">Subiendo...</span>
                  </>
                ) : file ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <span className="max-w-full truncate text-xs text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-400">Clic o arrastra para reemplazar</span>
                  </>
                ) : (
                  <>
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0l-3 3m3-3l3 3" />
                    </svg>
                    <span className="text-sm text-gray-500">Arrastra o haz clic para subir</span>
                    <span className="text-xs text-gray-400">JPG, PNG, WebP · máx. {GALLERY_MAX_MB} MB</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => pickFile(e.target.files)}
                />
              </div>

              {file && !adding && (
                <button type="button" onClick={clearFile} className="text-xs text-red-500 hover:underline">
                  Quitar archivo
                </button>
              )}

              <Input value={fileLabel} onChange={setFileLabel} placeholder="Etiqueta (opcional)" />

              {addError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {addError}
                </div>
              )}

              <button onClick={addImageByFile} disabled={!file || adding} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                {adding ? "Subiendo..." : "Subir y agregar"}
              </button>
            </>
          )}
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
  const [formError, setFormError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setFormError(null);
    const url = faqId
      ? `/api/admin/landing/franchises/${franchiseId}/faqs/${faqId}`
      : `/api/admin/landing/franchises/${franchiseId}/faqs`;
    const res = await fetch(url, {
      method: faqId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer, order: initial?.order ?? 0 }),
    });
    setSaving(false);
    if (!res.ok) {
      setFormError("Error guardando. Intenta de nuevo.");
      return;
    }
    onSave();
  }

  return (
    <div className="space-y-3">
      <Field label="Pregunta"><Input value={question} onChange={setQuestion} /></Field>
      <Field label="Respuesta"><Textarea value={answer} onChange={setAnswer} rows={3} /></Field>
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {formError}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={save} disabled={saving || !question || !answer} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? "Guardando..." : faqId ? "Actualizar" : "Agregar"}
        </button>
        <button onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
      </div>
    </div>
  );
}

type ExtendedBotConfig = BotConfig & {
  botMode?: string;
  aiProvider?: string;
  aiModel?: string;
  maxMessagesPerConvo?: number;
  maxConvosPerMonth?: number;
};

function BotTab({ franchiseId }: { franchiseId: string }) {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    showBot: false, showVideo: false, showGallery: true,
    showTestimonials: false, showKpis: true, showDownloads: false, showContactForm: true,
  });
  const [botConfig, setBotConfig] = useState<ExtendedBotConfig>({
    enabled: false, fallbackMessage: "", systemInstructions: "", tone: null,
    botMode: "guided", aiProvider: "claude", aiModel: undefined,
    maxMessagesPerConvo: 20, maxConvosPerMonth: 500,
  });
  const [botFaqs, setBotFaqs] = useState<BotFaq[]>([]);
  const [selectedMode, setSelectedMode] = useState<"guided" | "ai_assistant">("guided");
  const [showLegacy, setShowLegacy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingFaq, setAddingFaq] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
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
          const mode = (d.botConfig.botMode ?? "guided") as "guided" | "ai_assistant";
          setBotConfig({
            enabled: d.botConfig.enabled ?? false,
            fallbackMessage: d.botConfig.fallbackMessage ?? "",
            systemInstructions: d.botConfig.systemInstructions ?? "",
            tone: d.botConfig.tone ?? null,
            botMode: mode,
            aiProvider: d.botConfig.aiProvider ?? "claude",
            aiModel: d.botConfig.aiModel ?? undefined,
            maxMessagesPerConvo: d.botConfig.maxMessagesPerConvo ?? 20,
            maxConvosPerMonth: d.botConfig.maxConvosPerMonth ?? 500,
          });
          setSelectedMode(mode);
        }
        if (Array.isArray(d.botFaqs)) {
          setBotFaqs(d.botFaqs);
        }
      }
      setLoading(false);
    }
    load();
  }, [franchiseId]);

  function setFlag(key: keyof FeatureFlags, val: boolean) {
    setFeatureFlags((p) => ({ ...p, [key]: val }));
    setSaved(false);
  }

  function setBot(key: keyof ExtendedBotConfig, val: unknown) {
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
        body: JSON.stringify({
          featureFlags,
          botConfig: { ...botConfig, botMode: selectedMode },
        }),
      });
      if (!res.ok) throw new Error("Error guardando configuración bot");
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

  const claudeModels = ["claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"];
  const openaiModels = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"];
  const modelOptions = botConfig.aiProvider === "openai" ? openaiModels : claudeModels;

  if (loading) {
    return <p className="text-sm text-gray-400">Cargando...</p>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Header: title + enabled toggle */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <span className="text-sm font-semibold text-gray-800">Bot</span>
        <label className="flex cursor-pointer items-center gap-2">
          <span className="text-xs text-gray-500">{botConfig.enabled ? "Activado" : "Desactivado"}</span>
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only"
              checked={botConfig.enabled}
              onChange={(e) => setBot("enabled", e.target.checked)}
            />
            <div className={cn("h-5 w-9 rounded-full transition-colors", botConfig.enabled ? "bg-blue-600" : "bg-gray-300")} />
            <div className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform", botConfig.enabled ? "translate-x-4" : "translate-x-0.5")} />
          </div>
        </label>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          onClick={() => { setSelectedMode("guided"); setSaved(false); }}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedMode === "guided"
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-gray-300 text-gray-600 hover:bg-gray-50"
          )}
        >
          Calificacion Guiada
        </button>
        <button
          onClick={() => { setSelectedMode("ai_assistant"); setSaved(false); }}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            selectedMode === "ai_assistant"
              ? "bg-blue-600 text-white shadow-sm"
              : "border border-gray-300 text-gray-600 hover:bg-gray-50"
          )}
        >
          Asistente IA
        </button>
      </div>

      <div className="border-t border-gray-100" />

      {selectedMode === "guided" && (
        <div className="space-y-5">
          {/* Guided mode description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
              CALIFICACION GUIADA
            </h3>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
              <p className="text-sm text-gray-700">
                El chatbot guia al visitante con preguntas predefinidas sobre su perfil de inversion y le muestra un resultado personalizado.
              </p>
              <p className="text-xs text-gray-500">
                La logica esta preconfigurada con 5 preguntas de calificacion. No consume tokens de IA.
              </p>
            </div>
          </div>

          {/* Collapsible legacy config */}
          <div className="rounded-xl border border-gray-200">
            <button
              onClick={() => setShowLegacy((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl"
            >
              <span>Configuracion legacy (sistema anterior)</span>
              <span className="text-gray-400">{showLegacy ? "▲" : "▼"}</span>
            </button>
            {showLegacy && (
              <div className="border-t border-gray-200 p-4 space-y-3">
                {FLAG_LABELS.map(({ key, label }) => (
                  <Toggle
                    key={key}
                    checked={featureFlags[key]}
                    onChange={(v) => setFlag(key, v)}
                    label={label}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedMode === "ai_assistant" && (
        <div className="space-y-6">
          {/* Premium badge */}
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-violet-800">ASISTENTE IA — Plan Super Plus</span>
              <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-medium text-white">
                Premium
              </span>
            </div>
            <p className="text-sm text-violet-700">
              Un asistente conversacional entrenado con la informacion de tu marca. Usa IA (Claude / OpenAI) para mantener conversaciones naturales y extendidas con los visitantes.
            </p>
            <p className="text-xs text-violet-600">
              Responde preguntas complejas, califica leads con mas profundidad, y representa la voz de tu marca 24/7.
            </p>
          </div>

          <div className="border-t border-gray-100" />

          {/* AI Config section */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
              CONFIGURACION DEL ASISTENTE
            </h3>
            <div className="space-y-5">
              <Field label="Proveedor de IA" hint="Motor de IA que potencia las conversaciones.">
                <select
                  value={botConfig.aiProvider ?? "claude"}
                  onChange={(e) => {
                    setBot("aiProvider", e.target.value);
                    setBot("aiModel", undefined);
                    setSaved(false);
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="openai">OpenAI</option>
                </select>
              </Field>

              <Field label="Modelo" hint="Modelos mas avanzados = respuestas mas inteligentes, mayor costo.">
                <select
                  value={botConfig.aiModel ?? ""}
                  onChange={(e) => { setBot("aiModel", e.target.value || undefined); setSaved(false); }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">— Seleccionar modelo —</option>
                  {modelOptions.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>

              <Field label="Tono" hint="Define la personalidad del asistente.">
                <select
                  value={botConfig.tone ?? ""}
                  onChange={(e) => { setBot("tone", e.target.value || null); setSaved(false); }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">— Seleccionar tono —</option>
                  <option value="consultivo">Consultivo</option>
                  <option value="amigable">Amigable</option>
                  <option value="profesional">Profesional</option>
                  <option value="tecnico">Tecnico</option>
                </select>
              </Field>

              <Field label="Instrucciones del sistema" hint="Define como se comporta el asistente.">
                <Textarea
                  value={botConfig.systemInstructions}
                  onChange={(v) => { setBot("systemInstructions", v); setSaved(false); }}
                  rows={5}
                  placeholder="Eres un asistente de franquicias..."
                />
              </Field>

              <Field label="Mensaje de fallback" hint="Se muestra cuando el asistente no puede responder.">
                <Textarea
                  value={botConfig.fallbackMessage}
                  onChange={(v) => { setBot("fallbackMessage", v); setSaved(false); }}
                  rows={3}
                  placeholder="Gracias por tu consulta, te contactaremos pronto..."
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Knowledge base FAQs */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  KNOWLEDGE BASE (FAQs del asistente)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">El asistente usa estas respuestas como base de conocimiento.</p>
              </div>
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
                <p className="text-sm text-gray-400">No hay FAQs todavia.</p>
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

          <div className="border-t border-gray-100" />

          {/* Usage limits */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">
              LIMITES DE USO
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Maximo mensajes por conversacion"
                hint="Limita la longitud de cada conversacion para controlar costos."
              >
                <input
                  type="number"
                  value={botConfig.maxMessagesPerConvo ?? 20}
                  onChange={(e) => { setBot("maxMessagesPerConvo", Number(e.target.value)); setSaved(false); }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min={1}
                />
              </Field>
              <Field
                label="Maximo conversaciones por mes"
                hint="Limite mensual."
              >
                <input
                  type="number"
                  value={botConfig.maxConvosPerMonth ?? 500}
                  onChange={(e) => { setBot("maxConvosPerMonth", Number(e.target.value)); setSaved(false); }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min={1}
                />
              </Field>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <SaveButton saving={saving} saved={saved} onClick={saveAll} />
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
    showVerifiedBadge: false,
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

// Suppress unused warning — kept for external callers
void defaultAutomationConfig;
