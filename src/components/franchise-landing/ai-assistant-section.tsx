// Placeholder — AI inference not yet built

export function AiAssistantSection() {
  return (
    <section className="bg-[#0f172a] py-16 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-900/40 border border-violet-700/50 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-medium text-violet-300 uppercase tracking-wide">
            Asistente IA
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Asistente IA próximamente
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Estamos preparando un asistente conversacional inteligente entrenado con la información de esta franquicia. Pronto podrás hacer preguntas y recibir respuestas personalizadas.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <span className="h-2 w-2 rounded-full bg-slate-600" />
          <span className="h-2 w-2 rounded-full bg-slate-600" />
          <span className="h-2 w-2 rounded-full bg-slate-600" />
        </div>
      </div>
    </section>
  );
}
