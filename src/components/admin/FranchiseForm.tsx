"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { buildFranchiseSlug } from "@/lib/franchiseSlug";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Sector {
  id: string;
  name: string;
  emoji: string;
}

interface Country {
  id: string;
  name: string;
  flag: string;
  code: string;
}

type PlanTier = "BASIC" | "PLUS" | "PRO";

interface BotFaqFormData {
  id?: string;
  question: string;
  answer: string;
  priority: number;
  enabled: boolean;
}

interface FranchiseProfileFormData {
  headline: string;
  subheadline: string;
  heroImageUrl: string;
  heroVideoUrl: string;
  galleryUrls: string[];
  brochureUrl: string;
  investmentMin: string;
  investmentMax: string;
  countryCoverage: string;
}

interface FranchiseFeatureFlagsFormData {
  showVideo: boolean;
  showGallery: boolean;
  showTestimonials: boolean;
  showKpis: boolean;
  showBot: boolean;
  showDownloads: boolean;
  showContactForm: boolean;
  planTier: PlanTier;
}

interface FranchiseBotConfigFormData {
  enabled: boolean;
  systemInstructions: string;
  fallbackMessage: string;
  tone: string;
  faqs: BotFaqFormData[];
}

export interface FranchiseFormData {
  id?: string;
  name: string;
  description: string;
  logo: string;
  video: string;
  investmentMin: string;
  investmentMax: string;
  sectorId: string;
  contactEmail: string;
  featured: boolean;
  active: boolean;
  countryIds: string[];
  profile: FranchiseProfileFormData;
  featureFlags: FranchiseFeatureFlagsFormData;
  botConfig: FranchiseBotConfigFormData;
}

interface FranchiseFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FranchiseFormData) => Promise<void>;
  initialData?: FranchiseFormData | null;
  sectors: Sector[];
  countries: Country[];
}

type FormTab = "landing" | "features" | "bot" | "preview";

const emptyForm: FranchiseFormData = {
  name: "",
  description: "",
  logo: "",
  video: "",
  investmentMin: "",
  investmentMax: "",
  sectorId: "",
  contactEmail: "",
  featured: false,
  active: true,
  countryIds: [],
  profile: {
    headline: "",
    subheadline: "",
    heroImageUrl: "",
    heroVideoUrl: "",
    galleryUrls: [],
    brochureUrl: "",
    investmentMin: "",
    investmentMax: "",
    countryCoverage: "",
  },
  featureFlags: {
    showVideo: false,
    showGallery: true,
    showTestimonials: false,
    showKpis: true,
    showBot: false,
    showDownloads: false,
    showContactForm: true,
    planTier: "BASIC",
  },
  botConfig: {
    enabled: false,
    systemInstructions:
      "Responde unicamente con la informacion cargada para esta franquicia. Si no tienes una respuesta, usa el mensaje de fallback.",
    fallbackMessage:
      "Puedo ayudarte con informacion general de esta franquicia. Si necesitas detalles especificos, deja tus datos y un asesor te contacta.",
    tone: "consultivo",
    faqs: [],
  },
};

const tabs: { id: FormTab; label: string }[] = [
  { id: "landing", label: "Landing" },
  { id: "features", label: "Features / Plan" },
  { id: "bot", label: "Bot (Franchise Assist)" },
  { id: "preview", label: "Preview" },
];

export function FranchiseForm({
  open,
  onClose,
  onSubmit,
  initialData,
  sectors,
  countries,
}: FranchiseFormProps) {
  const [form, setForm] = useState<FranchiseFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<"hero" | "gallery" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FormTab>("landing");

  const isEditing = !!initialData?.id;
  const previewHref =
    isEditing && form.id ? `/franquicia/${buildFranchiseSlug(form.name, form.id)}` : null;

  useEffect(() => {
    setForm(initialData || emptyForm);
    setError(null);
    setActiveTab("landing");
  }, [initialData, open]);

  const setProfileField = <K extends keyof FranchiseProfileFormData>(
    key: K,
    value: FranchiseProfileFormData[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [key]: value,
      },
    }));
  };

  const setFeatureFlag = <K extends keyof FranchiseFeatureFlagsFormData>(
    key: K,
    value: FranchiseFeatureFlagsFormData[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      featureFlags: {
        ...prev.featureFlags,
        [key]: value,
      },
    }));
  };

  const setBotConfigField = <K extends keyof FranchiseBotConfigFormData>(
    key: K,
    value: FranchiseBotConfigFormData[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      botConfig: {
        ...prev.botConfig,
        [key]: value,
      },
    }));
  };

  const toggleCountry = (countryId: string) => {
    setForm((prev) => ({
      ...prev,
      countryIds: prev.countryIds.includes(countryId)
        ? prev.countryIds.filter((id) => id !== countryId)
        : [...prev.countryIds, countryId],
    }));
  };

  const uploadSingleImage = async (file: File) => {
    const payload = new FormData();
    payload.append("file", file);

    const res = await fetch("/api/admin/upload-logo", {
      method: "POST",
      body: payload,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "No se pudo subir la imagen");
    }

    return data.url as string;
  };

  const handleHeroImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadingAsset("hero");

    try {
      const url = await uploadSingleImage(file);
      setForm((prev) => ({
        ...prev,
        logo: url,
        profile: {
          ...prev.profile,
          heroImageUrl: url,
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setUploadingAsset(null);
      e.target.value = "";
    }
  };

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);
    setUploadingAsset("gallery");

    try {
      const urls: string[] = [];
      for (const file of files) {
        urls.push(await uploadSingleImage(file));
      }

      setForm((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          galleryUrls: [...prev.profile.galleryUrls, ...urls],
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la galeria");
    } finally {
      setUploadingAsset(null);
      e.target.value = "";
    }
  };

  const addFaq = () => {
    setBotConfigField("faqs", [
      ...form.botConfig.faqs,
      {
        question: "",
        answer: "",
        priority: form.botConfig.faqs.length,
        enabled: true,
      },
    ]);
  };

  const updateFaq = (
    index: number,
    field: keyof BotFaqFormData,
    value: string | number | boolean
  ) => {
    setBotConfigField(
      "faqs",
      form.botConfig.faqs.map((faq, faqIndex) =>
        faqIndex === index ? { ...faq, [field]: value } : faq
      )
    );
  };

  const removeFaq = (index: number) => {
    setBotConfigField(
      "faqs",
      form.botConfig.faqs.filter((_, faqIndex) => faqIndex !== index)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.description || !form.sectorId) {
      setError("Por favor completa nombre, descripcion y sector.");
      setActiveTab("landing");
      return;
    }

    if (!form.investmentMin || !form.investmentMax) {
      setError("Por favor indica el rango de inversion.");
      setActiveTab("landing");
      return;
    }

    if (parseFloat(form.investmentMin) >= parseFloat(form.investmentMax)) {
      setError("La inversion minima debe ser menor que la maxima.");
      setActiveTab("landing");
      return;
    }

    if (form.countryIds.length === 0) {
      setError("Selecciona al menos un pais de cobertura.");
      setActiveTab("landing");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        logo: form.profile.heroImageUrl || form.logo,
        video: form.profile.heroVideoUrl || form.video,
      });
      onClose();
    } catch {
      setError("Error al guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Editar Franquicia" : "Nueva Franquicia"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                    : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "landing" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Nombre *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        name: value,
                        profile: {
                          ...prev.profile,
                          headline:
                            prev.profile.headline === prev.name ? value : prev.profile.headline,
                        },
                      }));
                    }}
                    placeholder="Ej: Subway Colombia"
                    className="rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Sector *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {sectors.map((sector) => (
                      <button
                        key={sector.id}
                        type="button"
                        onClick={() => setForm({ ...form, sectorId: sector.id })}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all ${
                          form.sectorId === sector.id
                            ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span>{sector.emoji}</span>
                        <span>{sector.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Descripcion *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe la franquicia..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Inversion Min (USD) *
                  </label>
                  <Input
                    type="number"
                    value={form.investmentMin}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        investmentMin: value,
                        profile: {
                          ...prev.profile,
                          investmentMin: value,
                        },
                      }));
                    }}
                    placeholder="50000"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Inversion Max (USD) *
                  </label>
                  <Input
                    type="number"
                    value={form.investmentMax}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        investmentMax: value,
                        profile: {
                          ...prev.profile,
                          investmentMax: value,
                        },
                      }));
                    }}
                    placeholder="100000"
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Paises de Cobertura *
                </label>
                <div className="flex flex-wrap gap-2">
                  {countries.map((country) => (
                    <button
                      key={country.id}
                      type="button"
                      onClick={() => toggleCountry(country.id)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-all ${
                        form.countryIds.includes(country.id)
                          ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Headline Landing
                  </label>
                  <Input
                    value={form.profile.headline}
                    onChange={(e) => setProfileField("headline", e.target.value)}
                    placeholder="Titulo principal"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Subheadline Landing
                  </label>
                  <Input
                    value={form.profile.subheadline}
                    onChange={(e) => setProfileField("subheadline", e.target.value)}
                    placeholder="Subtitulo o propuesta de valor"
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Hero Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleHeroImageUpload}
                  disabled={uploadingAsset !== null}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:font-medium file:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Input
                  value={form.profile.heroImageUrl}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      logo: value,
                      profile: {
                        ...prev.profile,
                        heroImageUrl: value,
                      },
                    }));
                  }}
                  placeholder="https://... o /uploads/..."
                  className="rounded-lg"
                />
                {uploadingAsset === "hero" && (
                  <p className="text-xs text-blue-600">Subiendo hero image...</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Hero Video URL
                  </label>
                  <Input
                    value={form.profile.heroVideoUrl}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        video: value,
                        profile: {
                          ...prev.profile,
                          heroVideoUrl: value,
                        },
                      }));
                    }}
                    placeholder="https://youtube.com/... o mp4"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Cobertura visible en landing
                  </label>
                  <Input
                    value={form.profile.countryCoverage}
                    onChange={(e) => setProfileField("countryCoverage", e.target.value)}
                    placeholder="Ej: Colombia, Mexico, Chile"
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Gallery</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleGalleryUpload}
                  disabled={uploadingAsset !== null}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:font-medium file:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {uploadingAsset === "gallery" && (
                  <p className="text-xs text-blue-600">Subiendo galeria...</p>
                )}
                <div className="space-y-2">
                  {form.profile.galleryUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) =>
                          setProfileField(
                            "galleryUrls",
                            form.profile.galleryUrls.map((item, itemIndex) =>
                              itemIndex === index ? e.target.value : item
                            )
                          )
                        }
                        className="rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setProfileField(
                            "galleryUrls",
                            form.profile.galleryUrls.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                        className="rounded-lg"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setProfileField("galleryUrls", [...form.profile.galleryUrls, ""])
                  }
                  className="rounded-lg"
                >
                  + Agregar URL de galeria
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Brochure URL / PDF
                  </label>
                  <Input
                    value={form.profile.brochureUrl}
                    onChange={(e) => setProfileField("brochureUrl", e.target.value)}
                    placeholder="https://.../brochure.pdf"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Email de Contacto
                  </label>
                  <Input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="contacto@franquicia.com"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Plan Tier</label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["BASIC", "PLUS", "PRO"] as PlanTier[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setFeatureFlag("planTier", tier)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                        form.featureFlags.planTier === tier
                          ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["showVideo", "Mostrar video"],
                  ["showGallery", "Mostrar galeria"],
                  ["showTestimonials", "Mostrar testimoniales"],
                  ["showKpis", "Mostrar KPIs"],
                  ["showBot", "Mostrar bot"],
                  ["showDownloads", "Mostrar descargas"],
                  ["showContactForm", "Mostrar formulario/contacto"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-gray-700">{label}</span>
                    <input
                      type="checkbox"
                      checked={
                        form.featureFlags[key as keyof FranchiseFeatureFlagsFormData] as boolean
                      }
                      onChange={(e) =>
                        setFeatureFlag(
                          key as keyof FranchiseFeatureFlagsFormData,
                          e.target.checked as never
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>

              <div className="flex gap-6">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Franquicia activa</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Card destacada en results</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === "bot" && (
            <div className="space-y-5">
              <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm">
                <span className="font-medium text-gray-700">Bot habilitado</span>
                <input
                  type="checkbox"
                  checked={form.botConfig.enabled}
                  onChange={(e) => {
                    setBotConfigField("enabled", e.target.checked);
                    setFeatureFlag("showBot", e.target.checked);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  System Instructions
                </label>
                <textarea
                  value={form.botConfig.systemInstructions}
                  onChange={(e) =>
                    setBotConfigField("systemInstructions", e.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Fallback message
                  </label>
                  <textarea
                    value={form.botConfig.fallbackMessage}
                    onChange={(e) =>
                      setBotConfigField("fallbackMessage", e.target.value)
                    }
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Tono</label>
                  <Input
                    value={form.botConfig.tone}
                    onChange={(e) => setBotConfigField("tone", e.target.value)}
                    placeholder="consultivo"
                    className="rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">FAQs</h3>
                    <p className="text-xs text-gray-500">
                      Usa priority para ordenar respuestas sugeridas.
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={addFaq} className="rounded-lg">
                    + Add FAQ
                  </Button>
                </div>

                <div className="space-y-3">
                  {form.botConfig.faqs.length === 0 && (
                    <div className="rounded-xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500">
                      No hay FAQs cargadas todavia.
                    </div>
                  )}

                  {form.botConfig.faqs.map((faq, index) => (
                    <div
                      key={`${faq.id || "new"}-${index}`}
                      className="space-y-3 rounded-xl border border-gray-200 p-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-[1fr_120px_110px_auto]">
                        <Input
                          value={faq.question}
                          onChange={(e) => updateFaq(index, "question", e.target.value)}
                          placeholder="Pregunta"
                          className="rounded-lg"
                        />
                        <Input
                          type="number"
                          value={faq.priority}
                          onChange={(e) =>
                            updateFaq(index, "priority", Number(e.target.value || 0))
                          }
                          placeholder="Priority"
                          className="rounded-lg"
                        />
                        <label className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={faq.enabled}
                            onChange={(e) => updateFaq(index, "enabled", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Activa
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeFaq(index)}
                          className="rounded-lg"
                        >
                          Eliminar
                        </Button>
                      </div>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, "answer", e.target.value)}
                        placeholder="Respuesta"
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">Slug publico</p>
                <p className="mt-1 text-sm text-gray-600">
                  {previewHref || "Guarda la franquicia para habilitar el preview exacto."}
                </p>
              </div>

              {previewHref ? (
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="rounded-lg bg-blue-600 hover:bg-blue-700">
                    <a href={previewHref} target="_blank" rel="noreferrer">
                      Abrir landing en nueva pestaña
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-lg">
                    <a href={previewHref}>Ir a preview</a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  El preview publico se habilita despues de crear la franquicia.
                </p>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">Landing</p>
                  <p className="mt-2">
                    Headline: {form.profile.headline || "Pendiente"}
                  </p>
                  <p className="mt-1">
                    Hero media:{" "}
                    {form.profile.heroVideoUrl
                      ? "Video"
                      : form.profile.heroImageUrl
                        ? "Imagen"
                        : "Sin media"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-900">Features</p>
                  <p className="mt-2">Plan: {form.featureFlags.planTier}</p>
                  <p className="mt-1">
                    Bot: {form.featureFlags.showBot ? "Visible" : "Oculto"}
                  </p>
                  <p className="mt-1">
                    Gallery: {form.featureFlags.showGallery ? "Visible" : "Oculta"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-700"
            >
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar Cambios"
                  : "Crear Franquicia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
