"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { LeadDetailModal } from "./LeadDetailModal";

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  country: { name: string; flag: string; code: string };
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

interface LeadsTableProps {
  leads: LeadRow[];
}

const INVESTMENT_LABELS: Record<string, string> = {
  RANGE_50K_100K: "$50k-$100k",
  RANGE_100K_200K: "$100k-$200k",
  RANGE_200K_PLUS: "$200k+",
};

export function LeadsTable({ leads }: LeadsTableProps) {
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch for date formatting
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRowClick = async (lead: LeadRow) => {
    setSelectedLead(lead);

    if (!lead.viewed) {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewed: true }),
      });
    }
  };

  const topScore = (lead: LeadRow) => {
    if (lead.matches.length === 0) return 0;
    return Math.max(...lead.matches.map((m) => m.score));
  };

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Pais</TableHead>
              <TableHead className="hidden md:table-cell">Inversion</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No hay leads todavia
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(lead)}
                >
                  <TableCell>
                    {!lead.viewed && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-gray-500">
                    {lead.email}
                  </TableCell>
                  <TableCell>
                    {lead.country.flag} {lead.country.code}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {INVESTMENT_LABELS[lead.investmentRange] ||
                      lead.investmentRange}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        topScore(lead) >= 80
                          ? "bg-green-100 text-green-700"
                          : topScore(lead) >= 60
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }
                    >
                      {topScore(lead)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-gray-500">
                    {isClient ? formatDate(lead.createdAt) : ""}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
      />
    </>
  );
}
