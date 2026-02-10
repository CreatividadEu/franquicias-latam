"use client";

import { useState, useEffect, useCallback } from "react";
import { FranchisesTable } from "@/components/admin/FranchisesTable";

export default function FranchisesPage() {
  const [franchises, setFranchises] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [franchiseRes, sectorRes, countryRes] = await Promise.all([
        fetch("/api/franchises"),
        fetch("/api/sectors"),
        fetch("/api/countries"),
      ]);

      const [franchiseData, sectorData, countryData] = await Promise.all([
        franchiseRes.json(),
        sectorRes.json(),
        countryRes.json(),
      ]);

      setFranchises(franchiseData);
      setSectors(sectorData);
      setCountries(countryData);
    } catch (error) {
      console.error("Error loading data:", error);
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

      <FranchisesTable
        franchises={franchises}
        sectors={sectors}
        countries={countries}
        onRefresh={loadData}
      />
    </div>
  );
}
