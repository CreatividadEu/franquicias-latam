import * as XLSX from "xlsx";

interface ExportLead {
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

const INVESTMENT_LABELS: Record<string, string> = {
  RANGE_50K_100K: "$50k-$100k",
  RANGE_100K_200K: "$100k-$200k",
  RANGE_200K_PLUS: "$200k+",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  INVERSOR: "Inversor",
  OPERACIONES: "Operaciones",
  VENTAS: "Ventas",
  OTRO: "Otro",
};

/**
 * Convert leads data to a format suitable for CSV/Excel export
 */
function prepareLeadsForExport(leads: ExportLead[]) {
  return leads.map((lead) => ({
    ID: lead.id,
    Nombre: lead.name,
    Email: lead.email,
    Teléfono: lead.phone,
    "Teléfono Verificado": lead.phoneVerified ? "Sí" : "No",
    País: lead.country.name,
    "Código País": lead.country.code,
    Sectores: lead.sectors.map((s) => s.name).join(", "),
    "Rango Inversión": INVESTMENT_LABELS[lead.investmentRange] || lead.investmentRange,
    "Nivel Experiencia": EXPERIENCE_LABELS[lead.experienceLevel] || lead.experienceLevel,
    Visto: lead.viewed ? "Sí" : "No",
    "Fecha Creación": new Date(lead.createdAt).toLocaleString("es-ES"),
    "Franquicias Matched": lead.matches.length,
    "Top Match": lead.matches.length > 0 ? lead.matches[0].franchise.name : "N/A",
    "Top Score": lead.matches.length > 0 ? `${lead.matches[0].score}%` : "N/A",
    "Franquicias Contactadas": lead.matches.filter((m) => m.contacted).length,
  }));
}

/**
 * Export leads to CSV file
 */
export function exportLeadsToCSV(leads: ExportLead[]) {
  const data = prepareLeadsForExport(leads);
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);

  // Create blob and trigger download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().split("T")[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `leads-export-${timestamp}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export leads to Excel file
 */
export function exportLeadsToExcel(leads: ExportLead[]) {
  const data = prepareLeadsForExport(leads);

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");

  // Auto-size columns
  const maxWidth = 50;
  const colWidths = Object.keys(data[0] || {}).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => String(row[key as keyof typeof row]).length)
    );
    return { wch: Math.min(maxLength + 2, maxWidth) };
  });
  ws["!cols"] = colWidths;

  // Generate Excel file and trigger download
  const timestamp = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `leads-export-${timestamp}.xlsx`);
}

/**
 * Fetch all leads for export (bypasses pagination)
 */
export async function fetchAllLeadsForExport(): Promise<ExportLead[]> {
  const response = await fetch("/api/leads/export");

  if (!response.ok) {
    throw new Error("Failed to fetch leads for export");
  }

  const data = await response.json();
  return data.leads;
}
