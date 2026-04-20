# Don Benítez OS — Guión de pitch (5 min)

Demo pitch-grade para reunión con Don Benítez (comida mexicana, 10 puntos Colombia). Desplaza propuesta de Dos Buhos.

**URL**: `/demos/don-benitez-os`
**Tesis**: IA que **ejecuta** (genera artefactos accionables), no IA que **observa** (dashboards).

---

## Requisitos previos

- `ANTHROPIC_API_KEY` en `.env` (ya existe en el repo).
- `npm run dev` — abrir `http://localhost:3001/demos/don-benitez-os`.
- Resolución recomendada: 1280×800+ (desktop-first).

---

## Escena 1 · Panorama (0:00 – 0:45)

**Ruta**: `/demos/don-benitez-os`

> "Esto es Don Benítez OS, un cerebro operativo para tus 10 puntos. Arriba: ingresos, ticket promedio, NPS, vacantes. Debajo, **alertas que no son gráficas, son diagnósticos**: Clawdbot ya vio que Kennedy tiene 17.4 min de espera y NPS 51. Barranquilla tiene food cost 2.3pp sobre media. Y Cali-Granada va rampando."

**Puntos clave**:
- KPIs consolidados en tiempo real.
- 3 alertas IA con narrativa, no solo números.
- Grid de 10 puntos con flags (★ estrella, ⚠ problema, ▲ rampando, $ food cost).

---

## Escena 2 · Pulso Kennedy (0:45 – 1:45)

**Ruta**: `/demos/don-benitez-os/pulso?point=kennedy`

> "Entremos a Kennedy. Aquí está el heatmap hora×día: mira el pico 13-14h y 20-21h. Pero lo importante no es el mapa — son las **palancas**. Clawdbot está generando ahora mismo tres acciones concretas para el turno de hoy."

**Puntos clave**:
- Heatmap ocupación × hora × día.
- **Stream en vivo** de palancas (texto de Claude aparece letra por letra).
- Botones "Ejecutar palanca" → se asignan al gerente con timestamp (UI optimista).
- Línea de sentimiento 14 días + VoC excerpts.

**Momento pitch**: "¿Ves cómo el texto se escribe solo? Eso es la IA generando el plan **con tus KPIs reales**, no un template."

---

## Escena 3 · Academia (CLÍMAX — 1:45 – 3:00)

**Ruta**: `/demos/don-benitez-os/academia`

> "Este es el momento. Heatmap de brechas de competencia × punto. Kennedy × Cocina está rojo — 67% de brecha. Voy a hacer click."

**Acción**: Click en la celda Kennedy × Cocina.

> "Mira lo que pasa. Clawdbot **no te está mostrando un curso pre-grabado**. Está **generando ahora mismo**, en vivo, un micro-módulo de 15-20 minutos específico para cocina Kennedy con el wait-time de 17.4 min y Camilo como gerente. Con objetivo, contenido, role-play, evaluación. Listo para ejecutar en el próximo turno."

**Puntos clave**:
- Drawer derecho abre.
- XML tags `<objetivo>`, `<contenido>`, `<evaluacion>` se llenan en stream.
- Claude cita los KPIs reales del punto — no es boilerplate.

**Remate**: "Esto es lo que significa cerrar el loop. Dos Buhos te muestra qué está mal. Nosotros **generamos la solución**."

---

## Escena 4 · Talento (3:00 – 3:45)

**Ruta**: `/demos/don-benitez-os/talento`

> "Funnel de contratación por punto. Clawdbot tiene 14 conversaciones activas en WhatsApp. Aquí tienes una en vivo: Daniela, cocina, preferencia Medellín, score IA 87."

**Acción**: Click "Agendar entrevista" → aparece toast.

> "En un click, Clawdbot agenda la entrevista y se la asigna al gerente del punto. La fila de 30 candidatos está ordenada por score IA."

---

## Escena 5 · Finanzas (3:45 – 4:30)

**Ruta**: `/demos/don-benitez-os/finanzas`

> "Acceso gerencia. P&L por punto. Barranquilla tiene food cost 2.3pp sobre media las últimas 3 semanas. Clawdbot ya lo vio. Clic."

**Acción**: Click "Generar auditoría".

> "Plan de auditoría de tres puntos, owner, plazo, y el **por qué**: 2.3pp anualizados = ~$12M COP de impacto EBITDA. El plan no es del consultor, es de la IA que mira los datos cada hora."

---

## Cierre · DosBuhos contrast (4:30 – 5:00)

> "Resumamos. Dos Buhos te vende paneles: ves los problemas. **Nosotros te vendemos el cerebro que los resuelve**. Palancas en Pulso, módulos en Academia, candidatos en Talento, auditorías en Finanzas. Todo en vivo. Todo con tus datos. Todo **accionable hoy**.
>
> El piloto arranca con un punto — Kennedy es el candidato obvio — y en 30 días mides: wait-time, NPS, food cost, contrataciones. Si no mueve la aguja, no pagas. ¿Empezamos?"

---

## Bonus · Cmd+K (cualquier momento)

Presiona **⌘K** (o **Ctrl+K**) en cualquier ruta.

> "Una cosa más. Clawdbot no vive en una página. Vive en **todo el OS**."

Sugerencias:
- "Generar plan de acción para Kennedy" → stream de plan
- "Candidatos de cocina en Medellín" → navega a Talento
- "Módulo de formación de Servicio" → stream de training

---

## Fallbacks

Si la API de Anthropic falla durante el pitch:
- Cada `StreamedOutput` tiene texto fallback pre-escrito.
- El pitch **no se rompe**. Se muestra un chip "Fallback demo (API sin respuesta)".
- Probar antes de la reunión: `/api/demos/don-benitez-os/training` con `{ pointId: "kennedy", competency: "Cocina" }`.

---

## Aislamiento técnico

- Todo vive en `src/app/demos/don-benitez-os/` y `src/app/api/demos/don-benitez-os/`.
- Cero cambios a Prisma/Supabase. Datos 100% mockeados en `_lib/seed.ts`.
- La demo existente `/benitez-os` queda intacta.
- Tokens de diseño reutilizados (`fl-base`, `fl-teal`, etc.).
