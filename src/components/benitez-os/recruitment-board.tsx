"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  MapPin,
  ShieldAlert,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";

import {
  candidateStageLabels,
  candidateStageOrder,
  type BenitezCandidate,
} from "@/data/benitez-os";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function scoreTone(score: number) {
  if (score >= 90) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (score >= 82) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-rose-200 bg-rose-50 text-rose-700";
}

export function RecruitmentBoard({ candidates }: { candidates: BenitezCandidate[] }) {
  const [selectedCandidate, setSelectedCandidate] = useState<BenitezCandidate | null>(null);

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-5">
        {candidateStageOrder.map((stage) => {
          const stageCandidates = candidates.filter((candidate) => candidate.stage === stage);

          return (
            <section
              key={stage}
              className="flex min-h-[420px] flex-col rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_28px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                    {candidateStageLabels[stage]}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {stageCandidates.length} perfiles
                  </p>
                </div>
                <Badge className="border-slate-200 bg-slate-50 text-slate-700">
                  {stageCandidates.length}
                </Badge>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {stageCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => setSelectedCandidate(candidate)}
                    className="group rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                          {candidate.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{candidate.role}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-2 py-1 text-[11px] font-medium",
                          scoreTone(candidate.overallScore)
                        )}
                      >
                        {candidate.overallScore}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {candidate.city}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {candidate.availability}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                      {candidate.experience}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      {[
                        ["Cultura", candidate.cultureScore],
                        ["Servicio", candidate.serviceScore],
                        ["General", candidate.overallScore],
                      ].map(([label, score]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-slate-200 bg-white px-2 py-2"
                        >
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            {label}
                          </p>
                          <p className="mt-1 text-sm font-semibold tracking-[-0.03em] text-slate-950">
                            {score}
                          </p>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <Dialog
        open={Boolean(selectedCandidate)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCandidate(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl rounded-[30px] border-white/80 bg-white/95 p-0 shadow-[0_36px_90px_-34px_rgba(15,23,42,0.4)]">
          {selectedCandidate ? (
            <div className="overflow-hidden rounded-[30px]">
              <div className="bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(120,53,15,0.92))] px-6 py-6 text-white sm:px-7">
                <DialogHeader className="gap-3 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-white/15 bg-white/10 text-white/85">
                      {candidateStageLabels[selectedCandidate.stage]}
                    </Badge>
                    <Badge className="border-white/15 bg-white/10 text-white/85">
                      {selectedCandidate.role}
                    </Badge>
                  </div>
                  <DialogTitle className="text-3xl tracking-[-0.06em]">
                    {selectedCandidate.name}
                  </DialogTitle>
                  <DialogDescription className="max-w-2xl text-sm leading-6 text-white/74">
                    {selectedCandidate.experience}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="grid gap-6 px-6 py-6 sm:px-7 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                  <section className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-[-0.03em] text-slate-950">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      AI hiring summary
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {selectedCandidate.aiSummary}
                    </p>
                  </section>

                  <section className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["Score cultural", selectedCandidate.cultureScore],
                      ["Score servicio", selectedCandidate.serviceScore],
                      ["Score general", selectedCandidate.overallScore],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[22px] border border-slate-200/80 bg-white p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                          {label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
                          {value}
                        </p>
                      </div>
                    ))}
                  </section>

                  <section className="rounded-[24px] border border-slate-200/80 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-[-0.03em] text-slate-950">
                      <UserRoundSearch className="h-4 w-4 text-slate-700" />
                      Preguntas sugeridas
                    </div>
                    <div className="mt-4 space-y-3">
                      {selectedCandidate.interviewQuestions.map((question) => (
                        <div
                          key={question}
                          className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600"
                        >
                          {question}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="space-y-5">
                  <section className="rounded-[24px] border border-slate-200/80 bg-white p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-[-0.03em] text-slate-950">
                      <BriefcaseBusiness className="h-4 w-4 text-slate-700" />
                      Fit del perfil
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedCandidate.strengths.map((strength) => (
                        <Badge
                          key={strength}
                          className="border-slate-200 bg-slate-50 text-slate-700"
                        >
                          {strength}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-1 h-4 w-4 text-slate-400" />
                        <span>{selectedCandidate.city}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock3 className="mt-1 h-4 w-4 text-slate-400" />
                        <span>{selectedCandidate.availability}</span>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[24px] border border-amber-200 bg-amber-50/90 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-[-0.03em] text-amber-950">
                      <BadgeCheck className="h-4 w-4" />
                      Recomendación AI
                    </div>
                    <p className="mt-3 text-sm leading-7 text-amber-950/80">
                      {selectedCandidate.recommendation}
                    </p>
                  </section>

                  <section className="rounded-[24px] border border-rose-200 bg-rose-50/90 p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold tracking-[-0.03em] text-rose-900">
                      <ShieldAlert className="h-4 w-4" />
                      Riesgo a validar
                    </div>
                    <p className="mt-3 text-sm leading-7 text-rose-900/80">
                      {selectedCandidate.riskNote}
                    </p>
                  </section>

                  <Button
                    className="w-full"
                    onClick={() => setSelectedCandidate(null)}
                  >
                    Continuar pipeline
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
