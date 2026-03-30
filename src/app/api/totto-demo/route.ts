import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { area, proceso, objetivo, kpi, tiendas } = await request.json();

  if (!proceso?.trim()) {
    return NextResponse.json({ error: "proceso requerido" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key no configurada" }, { status: 500 });
  }

  const prompt = `Eres un consultor experto en franquicias retail con 20 años de experiencia creando manuales operativos y planes de capacitación para cadenas como TOTTO (mochilas, 450+ tiendas, 45 países).

Un cliente TOTTO te describe este proceso actual:
- Área: ${area}
- Proceso actual: "${proceso}"
- Objetivo principal: ${objetivo}
- KPI clave: ${kpi}
- Tiendas a impactar: ${tiendas}

Genera un plan de acción con EXACTAMENTE estas 6 fases, cada una con 2-3 acciones concretas y específicas para TOTTO (mochilas, accesorios, retail). Responde SOLO en JSON válido sin backticks:

{"phases":[
  {"id":"F1","name":"Levantamiento","title":"un título corto del hallazgo","actions":["acción1","acción2"]},
  {"id":"F2","name":"Optimización","title":"un título corto de la mejora","actions":["acción1","acción2"]},
  {"id":"F3","name":"Plan de Capacitación","title":"un título corto del plan","actions":["acción1","acción2"]},
  {"id":"F4","name":"Creación de Contenido","title":"un título corto del contenido","actions":["acción1","acción2"]},
  {"id":"F5","name":"Implementación","title":"un título corto de la implementación","actions":["acción1","acción2"]},
  {"id":"F6","name":"Seguimiento","title":"un título corto del seguimiento","actions":["acción1","acción2"]}
]}`;

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!anthropicResponse.ok) {
    const err = await anthropicResponse.text();
    return NextResponse.json({ error: err }, { status: anthropicResponse.status });
  }

  const data = await anthropicResponse.json();
  return NextResponse.json(data);
}
