"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { FranchiseForm, type FranchiseFormData } from "./FranchiseForm";

interface FranchiseRow {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  video: string | null;
  investmentMin: number;
  investmentMax: number;
  sectorId: string;
  contactEmail: string | null;
  featured: boolean;
  active: boolean;
  sector: { id: string; name: string; emoji: string };
  coverageCountries: { country: { id: string; name: string; flag: string } }[];
  _count: { matches: number };
}

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

interface FranchisesTableProps {
  franchises: FranchiseRow[];
  sectors: Sector[];
  countries: Country[];
  onRefresh: () => void;
}

export function FranchisesTable({
  franchises,
  sectors,
  countries,
  onRefresh,
}: FranchisesTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<FranchiseRow | null>(
    null
  );
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async (data: FranchiseFormData) => {
    const res = await fetch("/api/franchises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error);
    }

    onRefresh();
  };

  const handleEdit = async (data: FranchiseFormData) => {
    if (!editingFranchise) return;

    const res = await fetch(`/api/franchises/${editingFranchise.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error);
    }

    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Estas seguro de eliminar esta franquicia?")) return;

    setDeleting(id);
    try {
      await fetch(`/api/franchises/${id}`, { method: "DELETE" });
      onRefresh();
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (franchise: FranchiseRow) => {
    setEditingFranchise(franchise);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingFranchise(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingFranchise(null);
  };

  const formInitialData = editingFranchise
    ? {
        id: editingFranchise.id,
        name: editingFranchise.name,
        description: editingFranchise.description,
        logo: editingFranchise.logo || "",
        video: editingFranchise.video || "",
        investmentMin: String(editingFranchise.investmentMin),
        investmentMax: String(editingFranchise.investmentMax),
        sectorId: editingFranchise.sectorId,
        contactEmail: editingFranchise.contactEmail || "",
        featured: editingFranchise.featured,
        active: editingFranchise.active,
        countryIds: editingFranchise.coverageCountries.map(
          (c) => c.country.id
        ),
      }
    : null;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Franquicias</h2>
          <p className="text-sm text-gray-500">
            {franchises.length} franquicia{franchises.length !== 1 ? "s" : ""}{" "}
            registrada{franchises.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          + Nueva Franquicia
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Franquicia</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="hidden md:table-cell">Inversion</TableHead>
              <TableHead className="hidden md:table-cell">Paises</TableHead>
              <TableHead className="hidden lg:table-cell">Matches</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {franchises.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-gray-500 py-12"
                >
                  <div className="space-y-2">
                    <p className="text-lg">No hay franquicias todavia</p>
                    <p className="text-sm">
                      Crea tu primera franquicia para comenzar
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              franchises.map((franchise) => (
                <TableRow
                  key={franchise.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => openEdit(franchise)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-lg shrink-0">
                        {franchise.sector.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {franchise.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {franchise.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {franchise.sector.emoji} {franchise.sector.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-gray-600">
                    {formatCurrency(franchise.investmentMin)} -{" "}
                    {formatCurrency(franchise.investmentMax)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex gap-0.5">
                      {franchise.coverageCountries.map((c) => (
                        <span
                          key={c.country.id}
                          title={c.country.name}
                          className="text-base"
                        >
                          {c.country.flag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                    {franchise._count.matches}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      {franchise.active ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          Activa
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 text-xs">
                          Inactiva
                        </Badge>
                      )}
                      {franchise.featured && (
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                          Destacada
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(franchise)}
                        className="rounded-lg text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(franchise.id)}
                        disabled={deleting === franchise.id}
                        className="rounded-lg text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        {deleting === franchise.id ? "..." : "Eliminar"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FranchiseForm
        open={showForm}
        onClose={closeForm}
        onSubmit={editingFranchise ? handleEdit : handleCreate}
        initialData={formInitialData}
        sectors={sectors}
        countries={countries}
      />
    </>
  );
}
