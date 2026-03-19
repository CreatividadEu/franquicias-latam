export const LISTING_TYPES = [
  "ACTIVE_FRANCHISE",
  "EXTERNAL_FRANCHISE",
  "IDENTIFIED_BRAND",
] as const;

export type ListingType = (typeof LISTING_TYPES)[number];

export const VERIFICATION_STATUSES = [
  "VERIFIED_BY_FL",
  "NOT_VERIFIED",
  "UNDER_REVIEW",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const INTEREST_CTA_MODES = [
  "APPLY",
  "REQUEST_INFO",
  "EXPLORE_BRAND",
  "JOIN_INTEREST",
] as const;

export type InterestCtaMode = (typeof INTEREST_CTA_MODES)[number];

export type ListingStateInput = {
  listingType?: string | null;
  verificationStatus?: string | null;
  editorialBadge?: string | null;
  publicInterestCount?: number | null;
  publicInterestEnabled?: boolean | null;
  publicInterestLabel?: string | null;
  interestCtaMode?: string | null;
  availabilityLabel?: string | null;
  statusDisclaimer?: string | null;
  showApplicationForm?: boolean | null;
  showFinancialData?: boolean | null;
  showVerifiedBadge?: boolean | null;
};

export type ResolvedListingState = {
  listingType: ListingType;
  verificationStatus: VerificationStatus;
  editorialBadge: string | null;
  publicInterestCount: number;
  publicInterestEnabled: boolean;
  publicInterestLabel: string | null;
  interestCtaMode: InterestCtaMode;
  availabilityLabel: string;
  statusDisclaimer: string | null;
  showApplicationForm: boolean;
  showFinancialData: boolean;
  showVerifiedBadge: boolean;
};

export const LISTING_TYPE_OPTIONS: Array<{
  value: ListingType;
  label: string;
  description: string;
}> = [
  {
    value: "ACTIVE_FRANCHISE",
    label: "Franquicia activa",
    description: "Cliente activo con oportunidad disponible y flujo comercial tradicional.",
  },
  {
    value: "EXTERNAL_FRANCHISE",
    label: "Franquicia externa",
    description: "Marca con expansión activa, pero aún no verificada o comercializada por FL.",
  },
  {
    value: "IDENTIFIED_BRAND",
    label: "Marca identificada",
    description: "Marca destacada editorialmente por su potencial, sin afirmar disponibilidad de franquicia.",
  },
];

export const VERIFICATION_STATUS_OPTIONS: Array<{
  value: VerificationStatus;
  label: string;
}> = [
  { value: "VERIFIED_BY_FL", label: "Verificada por FL" },
  { value: "NOT_VERIFIED", label: "No verificada" },
  { value: "UNDER_REVIEW", label: "En revisión" },
];

export const INTEREST_CTA_MODE_OPTIONS: Array<{
  value: InterestCtaMode;
  label: string;
  description: string;
}> = [
  {
    value: "APPLY",
    label: "Aplicar",
    description: "Flujo tradicional de aplicación o precalificación.",
  },
  {
    value: "REQUEST_INFO",
    label: "Solicitar info",
    description: "Consulta comercial o solicitud de disponibilidad con Franquicias LATAM.",
  },
  {
    value: "EXPLORE_BRAND",
    label: "Explorar marca",
    description: "Registrar interés para que FL evalúe esta marca y su potencial.",
  },
  {
    value: "JOIN_INTEREST",
    label: "Unirse al interés",
    description: "Sumar señales públicas de demanda para esta marca o listing.",
  },
];

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function isListingType(value: unknown): value is ListingType {
  return (
    typeof value === "string" &&
    (LISTING_TYPES as readonly string[]).includes(value)
  );
}

export function isVerificationStatus(value: unknown): value is VerificationStatus {
  return (
    typeof value === "string" &&
    (VERIFICATION_STATUSES as readonly string[]).includes(value)
  );
}

export function isInterestCtaMode(value: unknown): value is InterestCtaMode {
  return (
    typeof value === "string" &&
    (INTEREST_CTA_MODES as readonly string[]).includes(value)
  );
}

export function getListingTypeLabel(listingType: ListingType) {
  return (
    LISTING_TYPE_OPTIONS.find((option) => option.value === listingType)?.label ??
    listingType
  );
}

export function getVerificationStatusLabel(status: VerificationStatus) {
  return (
    VERIFICATION_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

export function getInterestCtaModeLabel(mode: InterestCtaMode) {
  return (
    INTEREST_CTA_MODE_OPTIONS.find((option) => option.value === mode)?.label ??
    mode
  );
}

export function getListingDefaults(listingType: ListingType): Omit<
  ResolvedListingState,
  "editorialBadge"
> {
  switch (listingType) {
    case "EXTERNAL_FRANCHISE":
      return {
        listingType,
        verificationStatus: "NOT_VERIFIED",
        publicInterestCount: 0,
        publicInterestEnabled: false,
        publicInterestLabel: "Señales de interés",
        interestCtaMode: "REQUEST_INFO",
        availabilityLabel: "Información bajo solicitud",
        statusDisclaimer: null,
        showApplicationForm: false,
        showFinancialData: true,
        showVerifiedBadge: false,
      };
    case "IDENTIFIED_BRAND":
      return {
        listingType,
        verificationStatus: "NOT_VERIFIED",
        publicInterestCount: 0,
        publicInterestEnabled: true,
        publicInterestLabel: "Señales de interés",
        interestCtaMode: "EXPLORE_BRAND",
        availabilityLabel: "Marca identificada por Franquicias LATAM",
        statusDisclaimer:
          "Marca destacada por su potencial de expansión. Su modelo de franquicia no ha sido verificado aún por Franquicias LATAM.",
        showApplicationForm: false,
        showFinancialData: false,
        showVerifiedBadge: false,
      };
    case "ACTIVE_FRANCHISE":
    default:
      return {
        listingType: "ACTIVE_FRANCHISE",
        verificationStatus: "VERIFIED_BY_FL",
        publicInterestCount: 0,
        publicInterestEnabled: false,
        publicInterestLabel: null,
        interestCtaMode: "APPLY",
        availabilityLabel: "Franquicia disponible",
        statusDisclaimer: null,
        showApplicationForm: true,
        showFinancialData: true,
        showVerifiedBadge: true,
      };
  }
}

export function resolveListingState(
  input: ListingStateInput,
): ResolvedListingState {
  const listingType = isListingType(input.listingType)
    ? input.listingType
    : "ACTIVE_FRANCHISE";
  const defaults = getListingDefaults(listingType);

  return {
    listingType,
    verificationStatus: isVerificationStatus(input.verificationStatus)
      ? input.verificationStatus
      : defaults.verificationStatus,
    editorialBadge: normalizeText(input.editorialBadge),
    publicInterestCount:
      typeof input.publicInterestCount === "number" &&
      Number.isFinite(input.publicInterestCount)
        ? Math.max(0, Math.round(input.publicInterestCount))
        : defaults.publicInterestCount,
    publicInterestEnabled:
      typeof input.publicInterestEnabled === "boolean"
        ? input.publicInterestEnabled
        : defaults.publicInterestEnabled,
    publicInterestLabel:
      normalizeText(input.publicInterestLabel) ?? defaults.publicInterestLabel,
    interestCtaMode: isInterestCtaMode(input.interestCtaMode)
      ? input.interestCtaMode
      : defaults.interestCtaMode,
    availabilityLabel:
      normalizeText(input.availabilityLabel) ?? defaults.availabilityLabel,
    statusDisclaimer:
      normalizeText(input.statusDisclaimer) ?? defaults.statusDisclaimer,
    showApplicationForm:
      typeof input.showApplicationForm === "boolean"
        ? input.showApplicationForm
        : defaults.showApplicationForm,
    showFinancialData:
      typeof input.showFinancialData === "boolean"
        ? input.showFinancialData
        : defaults.showFinancialData,
    showVerifiedBadge:
      typeof input.showVerifiedBadge === "boolean"
        ? input.showVerifiedBadge
        : defaults.showVerifiedBadge,
  };
}

export function shouldUseInterestFlow(
  state: Pick<
    ResolvedListingState,
    "listingType" | "interestCtaMode" | "showApplicationForm"
  >,
) {
  return (
    state.listingType !== "ACTIVE_FRANCHISE" ||
    state.interestCtaMode !== "APPLY" ||
    !state.showApplicationForm
  );
}

export function getListingPrimaryCtaLabel(
  state: Pick<
    ResolvedListingState,
    "listingType" | "interestCtaMode"
  >,
  customLabel?: string | null,
) {
  const normalizedCustom = normalizeText(customLabel);
  if (normalizedCustom) return normalizedCustom;

  if (state.listingType === "ACTIVE_FRANCHISE") {
    return "Quiero saber más";
  }

  switch (state.interestCtaMode) {
    case "REQUEST_INFO":
      return "Solicitar información a FL";
    case "EXPLORE_BRAND":
      return "Quiero que FL explore esta marca";
    case "JOIN_INTEREST":
      return "Quiero esta marca en mi ciudad";
    case "APPLY":
    default:
      return "Solicitar información a FL";
  }
}

export function getListingPrimaryCtaUrl(
  state: Pick<
    ResolvedListingState,
    "listingType" | "interestCtaMode" | "showApplicationForm"
  >,
  customUrl?: string | null,
) {
  const normalizedCustom = normalizeText(customUrl);
  if (normalizedCustom) return normalizedCustom;

  return shouldUseInterestFlow(state) ? "#listing-lead-module" : "/quiz";
}

export function getLeadSourceType(
  state: Pick<
    ResolvedListingState,
    "listingType" | "interestCtaMode" | "showApplicationForm"
  >,
) {
  if (!shouldUseInterestFlow(state)) {
    return "franchise_application";
  }

  if (state.listingType === "IDENTIFIED_BRAND") {
    return "identified_brand_interest";
  }

  if (state.listingType === "EXTERNAL_FRANCHISE") {
    return "external_franchise_interest";
  }

  return "listing_interest";
}

export function getLeadModuleCopy(
  state: Pick<
    ResolvedListingState,
    | "listingType"
    | "interestCtaMode"
    | "availabilityLabel"
    | "editorialBadge"
    | "publicInterestEnabled"
    | "showApplicationForm"
  >,
  listingName: string,
  customLabel?: string | null,
): {
  variant: "apply" | "interest";
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  successTitle: string;
  successDescription: string;
  showExperienceField: boolean;
} {
  const submitLabel = getListingPrimaryCtaLabel(state, customLabel);
  const variant: "apply" | "interest" = shouldUseInterestFlow(state)
    ? "interest"
    : "apply";

  if (variant === "apply") {
    return {
      variant,
      eyebrow: "Calificación",
      title: "¿Podrías ser el operador ideal?",
      description: `Responde estas preguntas y nuestro equipo evaluará tu perfil para ${listingName}.`,
      submitLabel: "Aplicar para esta franquicia",
      successTitle: "Solicitud recibida",
      successDescription:
        "Nuestro equipo revisará tu perfil y se pondrá en contacto contigo pronto.",
      showExperienceField: true,
    };
  }

  if (state.listingType === "IDENTIFIED_BRAND") {
    return {
      variant,
      eyebrow: state.editorialBadge ?? state.availabilityLabel,
      title: `Activa el radar para ${listingName}`,
      description:
        "Comparte tu ciudad, capital estimado y contexto. Usaremos señales reales de demanda para priorizar la exploración de esta marca.",
      submitLabel,
      successTitle: "Interés registrado",
      successDescription:
        "Registramos tu mercado y tu capacidad de inversión. Si esta marca avanza en nuestro radar, te contactaremos con los siguientes pasos.",
      showExperienceField: false,
    };
  }

  return {
    variant,
    eyebrow: state.availabilityLabel,
    title: "Solicita una lectura comercial",
    description:
      "Cuéntanos tu ciudad, capital e interés. Revisaremos disponibilidad, encaje territorial y próximos pasos con el equipo de Franquicias LATAM.",
    submitLabel,
    successTitle: "Solicitud recibida",
    successDescription:
      "Nuestro equipo revisará la solicitud y te contactará con más contexto sobre disponibilidad y siguientes pasos.",
    showExperienceField: false,
  };
}
