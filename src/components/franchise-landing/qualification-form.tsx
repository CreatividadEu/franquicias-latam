"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { LeadModuleData } from "@/lib/franchise-mapper";

const INVESTMENT_OPTIONS = [
  { value: "20k-50k", label: "$20,000 – $50,000 USD" },
  { value: "50k-100k", label: "$50,000 – $100,000 USD" },
  { value: "100k-200k", label: "$100,000 – $200,000 USD" },
  { value: "200k+", label: "Más de $200,000 USD" },
];

const EXPERIENCE_OPTIONS = [
  { value: "yes", label: "Sí, tengo experiencia operando negocios" },
  { value: "no", label: "No, es mi primera vez" },
  { value: "investor", label: "Prefiero invertir con operador" },
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  investmentRange: string;
  cityInterest: string;
  country: string;
  experience: string;
  message: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  investmentRange: "",
  cityInterest: "",
  country: "",
  experience: "",
  message: "",
};

function formatInterestCount(count: number) {
  if (count <= 0) {
    return "Sé la primera persona en registrar interés.";
  }

  return `${count} persona${count === 1 ? "" : "s"} ya ha${count === 1 ? "" : "n"} mostrado interés.`;
}

export function QualificationForm({
  module,
  listingSlug,
  listingName,
}: {
  module: LeadModuleData;
  listingSlug: string;
  listingName: string;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [interestCount, setInterestCount] = useState(module.publicInterestCount);

  useEffect(() => {
    setInterestCount(module.publicInterestCount);
  }, [module.publicInterestCount]);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const isInterestFlow = module.variant === "interest";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          city: form.cityInterest,
          franchiseSlug: listingSlug,
          listingSlug,
          listingType: module.listingType,
          sourceType: module.sourceType,
          editorialBadge: module.editorialBadge,
          landingSource: isInterestFlow ? "listing-interest" : "landing-form",
          type: isInterestFlow ? "interest" : "form",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al enviar el formulario");
      }

      if (isInterestFlow && module.publicInterestEnabled) {
        setInterestCount((prev) => prev + 1);
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        id="listing-lead-module"
        className="flex flex-col items-center justify-center gap-5 rounded-xl border border-black/8 bg-white p-10 text-center shadow-sm"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </div>
        <div className="space-y-1.5">
          <p className="text-lg font-semibold text-[#171717]">
            {module.successTitle}
          </p>
          <p className="max-w-xs text-[15px] leading-relaxed text-slate-500">
            {module.successDescription}
          </p>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-[15px] text-[#171717] outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#2563eb]/40 focus:ring-2 focus:ring-[#2563eb]/15";
  const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500";

  return (
    <div
      id="listing-lead-module"
      className="rounded-xl border border-black/8 bg-white p-6 shadow-sm lg:sticky lg:top-24"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
    >
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">
            {module.eyebrow}
          </span>
          {module.editorialBadge && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-700">
              {module.editorialBadge}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3
            className="text-xl font-bold text-[#171717]"
            style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
          >
            {module.title}
          </h3>
          <p className="text-[14px] leading-relaxed text-slate-500">
            {module.description}
          </p>
        </div>
        {isInterestFlow && module.publicInterestEnabled && (
          <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-700">
              {module.publicInterestLabel ?? "Señales de interés"}
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-700">
              {formatInterestCount(interestCount)}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="qf-name" className={labelCls}>
            Nombre completo
          </label>
          <input
            id="qf-name"
            type="text"
            required
            placeholder="Tu nombre"
            value={form.name}
            onChange={set("name")}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="qf-email" className={labelCls}>
            Email
          </label>
          <input
            id="qf-email"
            type="email"
            required
            placeholder="tu@email.com"
            value={form.email}
            onChange={set("email")}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="qf-phone" className={labelCls}>
            Teléfono
          </label>
          <input
            id="qf-phone"
            type="tel"
            required
            placeholder="+1 234 567 8900"
            value={form.phone}
            onChange={set("phone")}
            className={inputCls}
          />
        </div>

        <div>
          <label htmlFor="qf-investment" className={labelCls}>
            {isInterestFlow ? "Capital estimado / rango de inversión" : "Capacidad de inversión"}
          </label>
          <select
            id="qf-investment"
            value={form.investmentRange}
            onChange={set("investmentRange")}
            className={inputCls}
          >
            <option value="" disabled>
              Selecciona un rango
            </option>
            {INVESTMENT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="qf-city" className={labelCls}>
            {isInterestFlow ? "Ciudad de interés" : "Ciudad donde deseas operar"}
          </label>
          <input
            id="qf-city"
            type="text"
            placeholder={isInterestFlow ? "Ciudad objetivo" : "Ciudad, País"}
            value={form.cityInterest}
            onChange={set("cityInterest")}
            className={inputCls}
          />
        </div>

        {isInterestFlow ? (
          <>
            <div>
              <label htmlFor="qf-country" className={labelCls}>
                País
              </label>
              <input
                id="qf-country"
                type="text"
                placeholder="País de interés"
                value={form.country}
                onChange={set("country")}
                className={inputCls}
              />
            </div>

            <div>
              <label htmlFor="qf-message" className={labelCls}>
                Contexto adicional
              </label>
              <textarea
                id="qf-message"
                rows={4}
                placeholder={`Cuéntanos por qué ${listingName} encaja con tu ciudad o tu tesis de inversión.`}
                value={form.message}
                onChange={set("message")}
                className={inputCls}
              />
            </div>
          </>
        ) : (
          module.showExperienceField && (
            <div>
              <label htmlFor="qf-experience" className={labelCls}>
                Experiencia operando negocios
              </label>
              <select
                id="qf-experience"
                value={form.experience}
                onChange={set("experience")}
                className={inputCls}
              >
                <option value="" disabled>
                  Selecciona una opción
                </option>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 py-3 text-[15px] font-semibold text-white shadow-[0_4px_16px_-4px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-px hover:shadow-[0_8px_24px_-6px_rgba(37,99,235,0.5)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Enviando..." : module.submitLabel}
        </button>
      </form>
    </div>
  );
}
