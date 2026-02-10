"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  exportLeadsToCSV,
  exportLeadsToExcel,
  fetchAllLeadsForExport,
} from "@/lib/export";

interface ExportLeadsButtonProps {
  variant?: "default" | "outline";
  className?: string;
}

export function ExportLeadsButton({
  variant = "outline",
  className = "",
}: ExportLeadsButtonProps) {
  const [exporting, setExporting] = useState<"csv" | "excel" | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format: "csv" | "excel") => {
    try {
      setExporting(format);
      setShowMenu(false);

      // Fetch all leads
      const leads = await fetchAllLeadsForExport();

      if (leads.length === 0) {
        alert("No hay leads para exportar");
        return;
      }

      // Export based on format
      if (format === "csv") {
        exportLeadsToCSV(leads);
      } else {
        exportLeadsToExcel(leads);
      }
    } catch (error) {
      console.error("Error exporting leads:", error);
      alert("Error al exportar leads. Por favor intenta de nuevo.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="relative">
      {/* Main export button */}
      <Button
        variant={variant}
        onClick={() => setShowMenu(!showMenu)}
        disabled={!!exporting}
        className={`rounded-lg ${className}`}
      >
        {exporting ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Exportando...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Exportar Leads
          </>
        )}
      </Button>

      {/* Dropdown menu */}
      {showMenu && !exporting && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <button
              onClick={() => handleExport("csv")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-gray-600" />
              <span>Exportar como CSV</span>
            </button>
            <button
              onClick={() => handleExport("excel")}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span>Exportar como Excel</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
