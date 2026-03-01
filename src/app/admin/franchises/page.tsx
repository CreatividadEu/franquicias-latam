"use client";

import { useState, useEffect, useCallback } from "react";
import { FranchisesTable } from "@/components/admin/FranchisesTable";

interface AdminSectorOption {
  id: string;
  name: string;
  emoji: string;
}

interface AdminCountryOption {
  id: string;
  name: string;
  flag: string;
  code: string;
}

type AdminFranchiseRow = Parameters<typeof FranchisesTable>[0]["franchises"][number];

async function fetchJson<T>(
  url: string,
  init?: RequestInit,
  fallbackIfEmpty?: T
): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`[${res.status}] ${url} -> ${text.slice(0, 300)}`);
  }

  if (!text) {
    if (fallbackIfEmpty !== undefined) {
      return fallbackIfEmpty;
    }

    throw new Error(`Empty JSON response from ${url}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON from ${url}: ${text.slice(0, 300)}`);
  }
}

export default function FranchisesPage() {
  const [franchises, setFranchises] = useState<AdminFranchiseRow[]>([]);
  const [sectors, setSectors] = useState<AdminSectorOption[]>([]);
  const [countries, setCountries] = useState<AdminCountryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const [franchiseData, sectorData, countryData] = await Promise.all([
        fetchJson<AdminFranchiseRow[]>("/api/franchises", undefined, []),
        fetchJson<{ sectors: AdminSectorOption[] }>(
          "/api/sectors",
          undefined,
          { sectors: [] }
        ),
        fetchJson<{ countries: AdminCountryOption[] }>(
          "/api/countries",
          undefined,
          { countries: [] }
        ),
      ]);

      setFranchises(franchiseData);
      setSectors(sectorData.sectors);
      setCountries(countryData.countries);
    } catch (err) {
      console.error("Error loading data:", err);
      setFranchises([]);
      setSectors([]);
      setCountries([]);
      setLoadError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las franquicias."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Franquicias</h1>
          <p className="text-gray-500 text-sm">
            Gestiona las franquicias disponibles
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Cargando franquicias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Franquicias</h1>
        <p className="text-gray-500 text-sm">
          Gestiona las franquicias disponibles
        </p>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <FranchisesTable
        franchises={franchises}
        sectors={sectors}
        countries={countries}
        onRefresh={loadData}
      />
    </div>
  );
}
