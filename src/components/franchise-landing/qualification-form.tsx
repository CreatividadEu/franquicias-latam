"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

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
  city: string;
  experience: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  phone: "",
  investmentRange: "",
  city: "",
  experience: "",
};

export function QualificationForm({
  franchiseSlug,
  franchiseName,
}: {
  franchiseSlug: string;
  franchiseName: string;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/leads/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, franchiseSlug, source: "landing-form" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al enviar el formulario");
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
      <div className="flex flex-col items-center justify-center gap-5 rounded-xl border border-black/8 bg-white p-10 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
        </div>
        <div className="space-y-1.5">
          <p className="text-lg font-semibold text-[#171717]">
            Solicitud recibida
          </p>
          <p className="max-w-xs text-[15px] leading-relaxed text-slate-500">
            Nuestro equipo revisará tu perfil y se pondrá en contacto contigo pronto.
          </p>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-[15px] text-[#171717] outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#2563eb]/40 focus:ring-2 focus:ring-[#2563eb]/15";
  const labelCls = "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

  return (
    <div
      className="rounded-xl border border-black/8 bg-white p-6 shadow-sm lg:sticky lg:top-24"
      style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.06)" }}
    >
      {/* Header */}
      <div className="mb-6 space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#2563eb]">
          Calificación
        </p>
        <h3
          className="text-xl font-bold text-[#171717]"
          style={{ fontFamily: "var(--font-heading, system-ui, sans-serif)" }}
        >
          ¿Podrías ser el operador ideal?
        </h3>
        <p className="text-[14px] leading-relaxed text-slate-500">
          Responde estas preguntas y nuestro equipo evaluará tu perfil para{" "}
          <span className="font-medium text-[#171717]">{franchiseName}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
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

        {/* Email */}
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

        {/* Phone */}
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

        {/* Investment range */}
        <div>
          <label htmlFor="qf-investment" className={labelCls}>
            Capacidad de inversión
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
            {INVESTMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label htmlFor="qf-city" className={labelCls}>
            Ciudad donde deseas operar
          </label>
          <input
            id="qf-city"
            type="text"
            placeholder="Ciudad, País"
            value={form.city}
            onChange={set("city")}
            className={inputCls}
          />
        </div>

        {/* Experience */}
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
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 py-3 text-[15px] font-semibold text-white shadow-[0_4px_16px_-4px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-px hover:shadow-[0_8px_24px_-6px_rgba(37,99,235,0.5)] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Enviando..." : "Aplicar para esta franquicia"}
        </button>
      </form>
    </div>
  );
}
