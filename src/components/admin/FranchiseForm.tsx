"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Popover as PopoverPrimitive, Select as SelectPrimitive } from "radix-ui";
import { z } from "zod";
import { buildFranchiseSlug } from "@/lib/franchiseSlug";
import { fetchJsonSafely } from "@/lib/safeApiJson";
import { cn } from "@/lib/utils";
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

interface HeroStatFormItem {
  value: string;
  label: string;
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
  // Landing phase 1
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroStats: HeroStatFormItem[];
  showReviewsBadge: boolean;
  reviewRating: string;
  reviewBadgeLabel: string;
  reviewAvatarUrls: string[];
  showFranchiseLogo: boolean;
  franchiseLogoUrl: string;
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
  coverageCountryIds: string[];
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

const franchiseFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Ingresa el nombre de la franquicia."),
  description: z.string().trim().min(1, "Ingresa una descripcion."),
  logo: z.string(),
  video: z.string(),
  investmentMin: z.string().trim().min(1, "Ingresa la inversion minima."),
  investmentMax: z.string().trim().min(1, "Ingresa la inversion maxima."),
  sectorId: z.string().min(1, "Selecciona un sector"),
  contactEmail: z
    .union([z.literal(""), z.string().email("Ingresa un email valido.")])
    .default(""),
  featured: z.boolean(),
  active: z.boolean(),
  coverageCountryIds: z
    .array(z.string())
    .min(1, "Selecciona al menos 1 pais"),
  profile: z.object({
    headline: z.string(),
    subheadline: z.string(),
    heroImageUrl: z.string(),
    heroVideoUrl: z.string(),
    galleryUrls: z.array(z.string()),
    brochureUrl: z.string(),
    investmentMin: z.string(),
    investmentMax: z.string(),
    countryCoverage: z.string(),
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    heroCtaLabel: z.string(),
    heroStats: z.array(z.object({ value: z.string(), label: z.string() })),
    showReviewsBadge: z.boolean(),
    reviewRating: z.string(),
    reviewBadgeLabel: z.string(),
    reviewAvatarUrls: z.array(z.string()),
    showFranchiseLogo: z.boolean(),
    franchiseLogoUrl: z.string(),
  }),
  featureFlags: z.object({
    showVideo: z.boolean(),
    showGallery: z.boolean(),
    showTestimonials: z.boolean(),
    showKpis: z.boolean(),
    showBot: z.boolean(),
    showDownloads: z.boolean(),
    showContactForm: z.boolean(),
    planTier: z.enum(["BASIC", "PLUS", "PRO"]),
  }),
  botConfig: z.object({
    enabled: z.boolean(),
    systemInstructions: z.string(),
    fallbackMessage: z.string(),
    tone: z.string(),
    faqs: z.array(
      z.object({
        id: z.string().optional(),
        question: z.string(),
        answer: z.string(),
        priority: z.number(),
        enabled: z.boolean(),
      })
    ),
  }),
});

const tabs: { id: FormTab; label: string }[] = [
  { id: "landing", label: "Landing" },
  { id: "features", label: "Features / Plan" },
  { id: "bot", label: "Bot (Franchise Assist)" },
  { id: "preview", label: "Preview" },
];

function createEmptyForm(): FranchiseFormData {
  return {
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
    coverageCountryIds: [],
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
      heroTitle: "",
      heroSubtitle: "",
      heroCtaLabel: "",
      heroStats: [],
      showReviewsBadge: false,
      reviewRating: "",
      reviewBadgeLabel: "",
      reviewAvatarUrls: [],
      showFranchiseLogo: false,
      franchiseLogoUrl: "",
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
}

function cloneFormData(data?: FranchiseFormData | null): FranchiseFormData {
  if (!data) {
    return createEmptyForm();
  }

  return {
    ...data,
    coverageCountryIds: [...data.coverageCountryIds],
    profile: {
      ...data.profile,
      galleryUrls: [...(data.profile.galleryUrls || [])],
      heroStats: (data.profile.heroStats || []).map((s) => ({ ...s })),
      reviewAvatarUrls: [...(data.profile.reviewAvatarUrls || [])],
    },
    featureFlags: {
      ...data.featureFlags,
    },
    botConfig: {
      ...data.botConfig,
      faqs: data.botConfig.faqs.map((faq) => ({ ...faq })),
    },
  };
}

export function FranchiseForm({
  open,
  onClose,
  onSubmit,
  initialData,
  sectors: initialSectors,
  countries: initialCountries,
}: FranchiseFormProps) {
  const [form, setForm] = useState<FranchiseFormData>(() =>
    cloneFormData(initialData)
  );
  const [saving, setSaving] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState<"hero" | "gallery" | "navbarLogo" | "reviewAvatar" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<FormTab>("landing");
  const [availableSectors, setAvailableSectors] = useState<Sector[]>(initialSectors);
  const [availableCountries, setAvailableCountries] =
    useState<Country[]>(initialCountries);
  const [loadingSectors, setLoadingSectors] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const isEditing = !!initialData?.id;
  const previewHref =
    isEditing && form.id ? `/franquicia/${buildFranchiseSlug(form.name, form.id)}` : null;

  useEffect(() => {
    setAvailableSectors(initialSectors);
  }, [initialSectors]);

  useEffect(() => {
    setAvailableCountries(initialCountries);
  }, [initialCountries]);

  useEffect(() => {
    setForm(cloneFormData(initialData));
    setError(null);
    setFieldErrors({});
    setActiveTab("landing");
    setCountryPickerOpen(false);
    setCountrySearch("");
  }, [initialData, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadOptions() {
      setOptionsError(null);
      setLoadingSectors(true);
      setLoadingCountries(true);

      const [sectorResult, countryResult] = await Promise.allSettled([
        fetchJsonSafely<{ sectors: Sector[] }>("/api/sectors"),
        fetchJsonSafely<{ countries: Country[] }>("/api/countries"),
      ]);

      if (cancelled) {
        return;
      }

      let hasError = false;

      if (sectorResult.status === "fulfilled") {
        setAvailableSectors(sectorResult.value.sectors);
      } else {
        hasError = true;
      }

      if (countryResult.status === "fulfilled") {
        setAvailableCountries(countryResult.value.countries);
      } else {
        hasError = true;
      }

      setLoadingSectors(false);
      setLoadingCountries(false);
      setOptionsError(
        hasError
          ? "No se pudieron actualizar sectores o paises. Usa la informacion cargada."
          : null
      );
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!countryPickerOpen) {
      setCountrySearch("");
    }
  }, [countryPickerOpen]);

  const selectedCountries = useMemo(() => {
    const orderMap = new Map(
      form.coverageCountryIds.map((countryId, index) => [countryId, index])
    );

    return availableCountries
      .filter((country) => orderMap.has(country.id))
      .sort(
        (a, b) =>
          (orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
          (orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER)
      );
  }, [availableCountries, form.coverageCountryIds]);

  const filteredCountries = useMemo(() => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) {
      return availableCountries;
    }

    return availableCountries.filter((country) =>
      `${country.name} ${country.code}`.toLowerCase().includes(query)
    );
  }, [availableCountries, countrySearch]);

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const setRootField = <K extends keyof FranchiseFormData>(
    key: K,
    value: FranchiseFormData[K]
  ) => {
    clearFieldError(String(key));
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

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

  const toggleCoverageCountry = (countryId: string) => {
    clearFieldError("coverageCountryIds");
    setForm((prev) => ({
      ...prev,
      coverageCountryIds: prev.coverageCountryIds.includes(countryId)
        ? prev.coverageCountryIds.filter((id) => id !== countryId)
        : [...prev.coverageCountryIds, countryId],
    }));
  };

  const removeCoverageCountry = (countryId: string) => {
    clearFieldError("coverageCountryIds");
    setForm((prev) => ({
      ...prev,
      coverageCountryIds: prev.coverageCountryIds.filter((id) => id !== countryId),
    }));
  };

  const handleCountryTriggerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setCountryPickerOpen((prev) => !prev);
    }
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

  const handleNavbarLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingAsset("navbarLogo");
    try {
      const url = await uploadSingleImage(file);
      setProfileField("franchiseLogoUrl", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el logo");
    } finally {
      setUploadingAsset(null);
      e.target.value = "";
    }
  };

  const handleReviewAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setUploadingAsset("reviewAvatar");
    try {
      const urls: string[] = [];
      for (const file of files) {
        urls.push(await uploadSingleImage(file));
      }
      setProfileField("reviewAvatarUrls", [...form.profile.reviewAvatarUrls, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir avatares");
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

    const validation = franchiseFormSchema.safeParse(form);
    if (!validation.success) {
      const nextErrors: Record<string, string> = {};

      for (const issue of validation.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }

      setFieldErrors(nextErrors);
      setActiveTab("landing");
      setError(nextErrors.form || "Revisa los campos obligatorios.");
      return;
    }

    const parsedInvestmentMin = Number(form.investmentMin);
    const parsedInvestmentMax = Number(form.investmentMax);

    if (
      !Number.isFinite(parsedInvestmentMin) ||
      !Number.isFinite(parsedInvestmentMax)
    ) {
      setFieldErrors((prev) => ({
        ...prev,
        investmentMin: "Usa valores numericos validos.",
        investmentMax: "Usa valores numericos validos.",
      }));
      setActiveTab("landing");
      setError("Usa valores numericos validos para la inversion.");
      return;
    }

    if (parsedInvestmentMin >= parsedInvestmentMax) {
      setFieldErrors((prev) => ({
        ...prev,
        investmentMin: "La inversion minima debe ser menor que la maxima.",
        investmentMax: "La inversion maxima debe ser mayor que la minima.",
      }));
      setActiveTab("landing");
      setError("La inversion minima debe ser menor que la maxima.");
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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto overflow-x-visible">
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
                      clearFieldError("name");
                      setForm((prev) => ({
                        ...prev,
                        name: value,
                        profile: {
                          ...prev.profile,
                          headline:
                            prev.profile.headline === prev.name
                              ? value
                              : prev.profile.headline,
                        },
                      }));
                    }}
                    placeholder="Ej: Subway Colombia"
                    className="rounded-lg"
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-600">{fieldErrors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Sector *</label>
                  <SelectPrimitive.Root
                    value={form.sectorId}
                    onValueChange={(value) => setRootField("sectorId", value)}
                    disabled={loadingSectors}
                  >
                    <SelectPrimitive.Trigger
                      className={cn(
                        "flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-left text-sm outline-none transition-all data-[placeholder]:text-gray-400",
                        fieldErrors.sectorId &&
                          "border-red-300 ring-1 ring-red-200 focus:border-red-400"
                      )}
                      aria-label="Sector"
                    >
                      <SelectPrimitive.Value
                        placeholder={
                          loadingSectors
                            ? "Cargando sectores..."
                            : "Selecciona un sector"
                        }
                      />
                      <SelectPrimitive.Icon asChild>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </SelectPrimitive.Icon>
                    </SelectPrimitive.Trigger>

                    <SelectPrimitive.Portal>
                      <SelectPrimitive.Content
                        position="popper"
                        sideOffset={8}
                        className="z-[100] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                      >
                        <SelectPrimitive.Viewport className="p-1">
                          {availableSectors.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">
                              No hay sectores disponibles.
                            </div>
                          ) : (
                            availableSectors.map((sector) => (
                              <SelectPrimitive.Item
                                key={sector.id}
                                value={String(sector.id)}
                                className="relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none hover:bg-gray-50 data-[highlighted]:bg-blue-50 data-[highlighted]:text-blue-700"
                              >
                                <span className="pr-5">{sector.emoji}</span>
                                <SelectPrimitive.ItemText>
                                  {sector.name}
                                </SelectPrimitive.ItemText>
                                <SelectPrimitive.ItemIndicator className="absolute right-3">
                                  <Check className="h-4 w-4" />
                                </SelectPrimitive.ItemIndicator>
                              </SelectPrimitive.Item>
                            ))
                          )}
                        </SelectPrimitive.Viewport>
                      </SelectPrimitive.Content>
                    </SelectPrimitive.Portal>
                  </SelectPrimitive.Root>
                  {fieldErrors.sectorId && (
                    <p className="text-xs text-red-600">{fieldErrors.sectorId}</p>
                  )}
                  {optionsError && (
                    <p className="text-xs text-amber-600">{optionsError}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Descripcion *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => {
                    clearFieldError("description");
                    setRootField("description", e.target.value);
                  }}
                  placeholder="Describe la franquicia..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {fieldErrors.description && (
                  <p className="text-xs text-red-600">{fieldErrors.description}</p>
                )}
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
                      clearFieldError("investmentMin");
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
                  {fieldErrors.investmentMin && (
                    <p className="text-xs text-red-600">{fieldErrors.investmentMin}</p>
                  )}
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
                      clearFieldError("investmentMax");
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
                  {fieldErrors.investmentMax && (
                    <p className="text-xs text-red-600">{fieldErrors.investmentMax}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Paises de Cobertura *
                </label>
                <PopoverPrimitive.Root
                  open={countryPickerOpen}
                  onOpenChange={setCountryPickerOpen}
                >
                  <PopoverPrimitive.Trigger asChild>
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={handleCountryTriggerKeyDown}
                      className={cn(
                        "min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 outline-none transition-all focus-visible:ring-2 focus-visible:ring-blue-500",
                        fieldErrors.coverageCountryIds &&
                          "border-red-300 ring-1 ring-red-200"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-h-6 flex-1 flex-wrap gap-2">
                          {selectedCountries.length === 0 ? (
                            <span className="text-sm text-gray-400">
                              {loadingCountries
                                ? "Cargando paises..."
                                : "Selecciona uno o mas paises"}
                            </span>
                          ) : (
                            selectedCountries.map((country) => (
                              <span
                                key={country.id}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                              >
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                                <button
                                  type="button"
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    removeCoverageCountry(country.id);
                                  }}
                                  className="rounded-full p-0.5 text-blue-700/80 hover:bg-blue-100 hover:text-blue-800"
                                  aria-label={`Eliminar ${country.name}`}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
                      </div>
                    </div>
                  </PopoverPrimitive.Trigger>

                  <PopoverPrimitive.Portal>
                    <PopoverPrimitive.Content
                      align="start"
                      sideOffset={8}
                      className="z-[100] w-[var(--radix-popover-trigger-width)] min-w-[320px] rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
                    >
                      <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Buscar pais..."
                          className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
                        />
                      </div>

                      <div className="mt-3 max-h-72 space-y-1 overflow-y-auto pr-1">
                        {filteredCountries.length === 0 ? (
                          <div className="rounded-lg px-3 py-2 text-sm text-gray-500">
                            No encontramos paises con esa busqueda.
                          </div>
                        ) : (
                          filteredCountries.map((country) => {
                            const isSelected = form.coverageCountryIds.includes(
                              country.id
                            );

                            return (
                              <button
                                key={country.id}
                                type="button"
                                onClick={() => toggleCoverageCountry(country.id)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                              >
                                <span
                                  className={cn(
                                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                                    isSelected
                                      ? "border-blue-600 bg-blue-600 text-white"
                                      : "border-gray-300 bg-white text-transparent"
                                  )}
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </span>
                                <span className="text-base leading-none">
                                  {country.flag}
                                </span>
                                <span className="min-w-0 flex-1 truncate">
                                  {country.name}
                                </span>
                                <span className="text-xs uppercase text-gray-400">
                                  {country.code}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </PopoverPrimitive.Content>
                  </PopoverPrimitive.Portal>
                </PopoverPrimitive.Root>
                {fieldErrors.coverageCountryIds && (
                  <p className="text-xs text-red-600">
                    {fieldErrors.coverageCountryIds}
                  </p>
                )}
                {optionsError && (
                  <p className="text-xs text-amber-600">{optionsError}</p>
                )}
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
                    <div key={index} className="flex gap-2">
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
                            form.profile.galleryUrls.filter(
                              (_, itemIndex) => itemIndex !== index
                            )
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
                    onChange={(e) => setRootField("contactEmail", e.target.value)}
                    placeholder="contacto@franquicia.com"
                    className="rounded-lg"
                  />
                  {fieldErrors.contactEmail && (
                    <p className="text-xs text-red-600">{fieldErrors.contactEmail}</p>
                  )}
                </div>
              </div>

              {/* ── Hero ─────────────────────────────────────────── */}
              <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Hero</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Título hero</label>
                    <Input
                      value={form.profile.heroTitle}
                      onChange={(e) => setProfileField("heroTitle", e.target.value)}
                      placeholder="Ej: TU MARCA, TU LEGADO"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">CTA del hero</label>
                    <Input
                      value={form.profile.heroCtaLabel}
                      onChange={(e) => setProfileField("heroCtaLabel", e.target.value)}
                      placeholder="Ej: Solicitar información"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Subtítulo hero</label>
                  <textarea
                    value={form.profile.heroSubtitle}
                    onChange={(e) => setProfileField("heroSubtitle", e.target.value)}
                    placeholder="Descripción breve visible bajo el título"
                    rows={2}
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stats del hero (máx 3)</label>
                  {form.profile.heroStats.map((stat, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={stat.value}
                        onChange={(e) =>
                          setProfileField(
                            "heroStats",
                            form.profile.heroStats.map((s, i) =>
                              i === idx ? { ...s, value: e.target.value } : s
                            )
                          )
                        }
                        placeholder="Valor (ej: $50K)"
                        className="rounded-lg"
                      />
                      <Input
                        value={stat.label}
                        onChange={(e) =>
                          setProfileField(
                            "heroStats",
                            form.profile.heroStats.map((s, i) =>
                              i === idx ? { ...s, label: e.target.value } : s
                            )
                          )
                        }
                        placeholder="Etiqueta (ej: Inversión)"
                        className="rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setProfileField(
                            "heroStats",
                            form.profile.heroStats.filter((_, i) => i !== idx)
                          )
                        }
                        className="rounded-lg"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {form.profile.heroStats.length < 3 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setProfileField("heroStats", [
                          ...form.profile.heroStats,
                          { value: "", label: "" },
                        ])
                      }
                      className="rounded-lg"
                    >
                      + Agregar stat
                    </Button>
                  )}
                </div>
              </div>

              {/* ── Reseñas ──────────────────────────────────────── */}
              <div className="space-y-3 rounded-xl border border-amber-100 bg-amber-50/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">Reseñas</p>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.profile.showReviewsBadge}
                      onChange={(e) => setProfileField("showReviewsBadge", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                    />
                    Mostrar badge
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Rating (0–5)</label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={form.profile.reviewRating}
                      onChange={(e) => setProfileField("reviewRating", e.target.value)}
                      placeholder="4.9"
                      className="rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Texto del badge</label>
                    <Input
                      value={form.profile.reviewBadgeLabel}
                      onChange={(e) => setProfileField("reviewBadgeLabel", e.target.value)}
                      placeholder="Ej: Franquiciados activos"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Avatares (URLs, máx 4)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleReviewAvatarUpload}
                    disabled={uploadingAsset !== null}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-amber-50 file:px-3 file:py-1.5 file:font-medium file:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {uploadingAsset === "reviewAvatar" && (
                    <p className="text-xs text-amber-600">Subiendo avatares...</p>
                  )}
                  {form.profile.reviewAvatarUrls.map((url, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) =>
                          setProfileField(
                            "reviewAvatarUrls",
                            form.profile.reviewAvatarUrls.map((u, i) =>
                              i === idx ? e.target.value : u
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
                            "reviewAvatarUrls",
                            form.profile.reviewAvatarUrls.filter((_, i) => i !== idx)
                          )
                        }
                        className="rounded-lg"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  {form.profile.reviewAvatarUrls.length < 4 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setProfileField("reviewAvatarUrls", [
                          ...form.profile.reviewAvatarUrls,
                          "",
                        ])
                      }
                      className="rounded-lg"
                    >
                      + Agregar URL de avatar
                    </Button>
                  )}
                </div>
              </div>

              {/* ── Navbar ───────────────────────────────────────── */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Navbar</p>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.profile.showFranchiseLogo}
                      onChange={(e) => setProfileField("showFranchiseLogo", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Mostrar logo franquicia en navbar
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Logo de franquicia (navbar)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml"
                    onChange={handleNavbarLogoUpload}
                    disabled={uploadingAsset !== null}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:font-medium file:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {uploadingAsset === "navbarLogo" && (
                    <p className="text-xs text-slate-500">Subiendo logo...</p>
                  )}
                  <Input
                    value={form.profile.franchiseLogoUrl}
                    onChange={(e) => setProfileField("franchiseLogoUrl", e.target.value)}
                    placeholder="https://... o /uploads/..."
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
                    onChange={(e) => setRootField("active", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Franquicia activa</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setRootField("featured", e.target.checked)}
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
