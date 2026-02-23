type DashboardPreviewProps = {
  className?: string;
};

const marketRows = [
  { label: "Nuevas ubicaciones", value: 100 },
  { label: "Operaciones", value: 70 },
  { label: "Franquiciados", value: 45 },
];

const leadRows = [
  { label: "Top funnel", amount: "5000", value: 100 },
  { label: "Nurturing", amount: "3000", value: 66 },
  { label: "Listos para cierre", amount: "2000", value: 44 },
];

export function DashboardPreview({ className = "" }: DashboardPreviewProps) {
  return (
    <div
      className={`rounded-3xl border border-slate-200/60 bg-white/70 p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] backdrop-blur-sm sm:p-5 ${className}`.trim()}
    >
      <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <svg
              viewBox="0 0 20 20"
              className="h-3.5 w-3.5 text-slate-700"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 14.5V5.5M10 14.5V8.5M16 14.5V3.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            Sistema de Franquicias
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white p-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
          Revenue Growth
        </p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-emerald-600 sm:text-5xl">
          +320%
        </p>
        <svg
          viewBox="0 0 330 160"
          className="mt-3 h-36 w-full"
          role="img"
          aria-label="Crecimiento y presencia regional"
        >
          <defs>
            <pattern
              id="preview-grid"
              className="previewGridPattern"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M24 0H0V24"
                fill="none"
                stroke="rgba(148,163,184,0.22)"
                strokeWidth="1"
              />
            </pattern>
            <linearGradient id="preview-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="330" height="160" fill="url(#preview-grid)" />
          <ellipse className="previewBlob" cx="72" cy="62" rx="34" ry="16" fill="rgba(148,163,184,0.08)" />
          <ellipse className="previewBlob" cx="168" cy="58" rx="44" ry="20" fill="rgba(148,163,184,0.08)" />
          <ellipse className="previewBlob" cx="258" cy="78" rx="42" ry="18" fill="rgba(148,163,184,0.08)" />
          <path
            className="previewLine"
            d="M12 132 C 44 126, 70 122, 98 110 C 124 97, 138 92, 164 89 C 190 86, 208 76, 232 63 C 252 53, 274 40, 318 30"
            fill="none"
            stroke="url(#preview-line)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle className="previewDot dot1" cx="98" cy="110" r="4.5" fill="#2563eb" />
          <circle className="previewDot dot2" cx="164" cy="89" r="4.5" fill="#1d4ed8" />
          <circle className="previewDot dot3" cx="232" cy="63" r="4.5" fill="#0ea5e9" />
          <circle className="previewDot dot4" cx="286" cy="44" r="5.5" fill="#10b981" />
          <circle cx="70" cy="62" r="3.5" fill="rgba(30,41,59,0.34)" />
          <circle cx="168" cy="58" r="3.5" fill="rgba(30,41,59,0.34)" />
          <circle cx="258" cy="78" r="3.5" fill="rgba(30,41,59,0.34)" />
        </svg>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/60 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Pipeline de Expansi&oacute;n</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            {marketRows.map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{row.label}</span>
                  <span className="font-semibold text-slate-600">{row.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-slate-700"
                    style={{ width: `${row.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Leads Calificados
            </p>
            <div className="mt-2 space-y-2.5">
              {leadRows.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-[0.72rem]">
                    <span className="text-slate-600">{row.label}</span>
                    <span className="font-semibold text-slate-700">{row.amount}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-[#2860E7]"
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "Modelo de Franquicias",
          "Entrevistas Agendadas",
          "Franquicias compatibilizadas",
        ].map((chip) => (
          <span
            key={chip}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[0.66rem] font-medium uppercase tracking-[0.12em] text-slate-600"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
