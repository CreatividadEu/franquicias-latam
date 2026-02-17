"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface LeadDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  country: { name: string; flag: string };
  sectors: { name: string; emoji: string }[];
  investmentRange: string;
  experienceLevel: string;
  viewed: boolean;
  createdAt: string;
  matches: {
    franchise: { name: string };
    score: number;
    contacted: boolean;
  }[];
}

interface LeadDetailModalProps {
  lead: LeadDetail | null;
  open: boolean;
  onClose: () => void;
}

const INVESTMENT_LABELS: Record<string, string> = {
  RANGE_50K_100K: "$50k - $100k",
  RANGE_100K_200K: "$100k - $200k",
  RANGE_200K_PLUS: "$200k+",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  INVERSOR: "Inversor",
  OPERACIONES: "Operaciones",
  VENTAS: "Ventas",
  OTRO: "Otro",
};

export function LeadDetailModal({
  lead,
  open,
  onClose,
}: LeadDetailModalProps) {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{lead.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">
              Contacto
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium">{lead.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Telefono:</span>
                <p className="font-medium">
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {lead.phone}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-gray-500">Pais:</span>
                <p className="font-medium">
                  {lead.country.flag} {lead.country.name}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Fecha:</span>
                <p className="font-medium" suppressHydrationWarning>
                  {formatDate(lead.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Quiz Answers */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">
              Perfil
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Sectores:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {lead.sectors.map((s) => (
                    <Badge key={s.name} variant="secondary" className="text-xs">
                      {s.emoji} {s.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Inversion:</span>
                <p className="font-medium">
                  {INVESTMENT_LABELS[lead.investmentRange] ||
                    lead.investmentRange}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Experiencia:</span>
                <p className="font-medium">
                  {EXPERIENCE_LABELS[lead.experienceLevel] ||
                    lead.experienceLevel}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Verificado:</span>
                <p className="font-medium">
                  {lead.phoneVerified ? "Si" : "No"}
                </p>
              </div>
            </div>
          </div>

          {/* Matches */}
          {lead.matches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-500 uppercase">
                Franquicias Matcheadas
              </h4>
              <div className="space-y-2">
                {lead.matches.map((match, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm font-medium">
                      {match.franchise.name}
                    </span>
                    <Badge
                      className={
                        match.score >= 80
                          ? "bg-green-100 text-green-700"
                          : match.score >= 60
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }
                    >
                      {match.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
