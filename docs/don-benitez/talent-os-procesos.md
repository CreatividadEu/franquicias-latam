# Don Benítez · Talent OS — Procesos de Talento Humano

> Contenido extraído del repositorio (`src/data/benitez-os.ts`, `src/components/benitez-os/*`, `src/app/demos/don-benitez-os/*` y `src/app/api/demos/don-benitez-os/*`).
> Este documento solo recoge **los procesos**: qué se hace, en qué orden, con qué criterios y qué preguntas, guiones y reglas se usan. No describe pantallas ni estructuras de datos.
> Contexto: Don Benítez es una cadena de comida mexicana con 10 puntos en Colombia y una marca **de celebración**: energía, hospitalidad y disciplina visible en cada turno.

---

## 1. Principios del sistema de talento

1. **El cuello de botella no está en ventas, está en la ejecución desigual entre sedes**: vacantes abiertas, formación incompleta y tiempos de servicio irregulares frenan el ticket promedio.
2. **Contratar, formar y operar es un solo ciclo**: la señal operativa de cada punto (espera, quejas, ticket, celebraciones, cumplimiento formativo) decide **dónde contratar primero, qué entrenar y qué acción ejecutar**.
3. **La formación se asigna por desempeño real del punto, no por calendario.**
4. **La experiencia técnica no basta**: el fit cultural (marca experiencial y festiva) es filtro de calidad.
5. **Toda recomendación debe ser ejecutable hoy por el gerente, sin pedir presupuesto.**

---

## 2. Roles operativos cubiertos

| Rol | Foco del rol |
|---|---|
| Mesero | Servicio en mesa, venta sugerida, celebración |
| Anfitrión | Primera impresión, lista de espera, reservas, celebraciones sorpresa |
| Cocina | Velocidad de salida, mise en place, coordinación con salón |
| Cajero | Cobro ágil, cierres limpios, sugerencia breve de extras |
| Líder de punto / Gerente de punto | Liderazgo de turno, briefing, seguimiento en piso, formación del equipo |

---

## 3. Proceso de reclutamiento y selección

### 3.1 Priorización de vacantes

Cada vacante se registra con **punto, rol, número de posiciones, urgencia (Alta / Media) y justificación operativa** (qué KPI o turno afecta). Reglas de priorización:

- **Primero las vacantes que explican el riesgo operativo** del punto (ej.: cocina cuando los tiempos de preparación superan el benchmark; anfitrión cuando la experiencia de llegada es inconsistente).
- **Mover líderes antes que meseros en puntos críticos**: un punto en crisis no solo necesita manos, necesita liderazgo que ordene turno, briefing y seguimiento en piso. *(Impacto: reduce fricción de onboarding).*
- **Cerrar vacantes críticas antes de la temporada pico** (ej.: antes de mayo). *(Impacto estimado: −1.6 min en servicio).*
- Mantener **reserva de candidatos (pool)** para fines de semana cuando la rotación de un rol sube (ej.: anfitriones con rotación del 11%).
- Abrir posiciones **backup** (ej.: líder para segundo turno de fin de semana o eventos privados) en puntos referentes.

Ejemplos de justificación usados:
- Mesero: "cubrir terraza premium jueves y viernes", "vacante clave para almuerzos de alto tráfico", "atiende picos de turismo nocturno".
- Anfitrión: "reforzar picos de lista de espera en almuerzo corporativo", "reforzar acogida y primer contacto".
- Cocina: "relevo anticipado para pico de temporada", "es la brecha más sensible para mejorar tiempos de preparación".
- Cajero: "reduce tiempos en domingos familiares y cierres nocturnos", "reduce congestión al cierre".
- Líder: "se necesita consistencia operativa entre turnos", "reordenar la operación del turno noche".

### 3.2 Embudo (pipeline) de selección

Etapas en orden:

1. **Nuevos** — hoja de vida recibida / candidato captado (sourcing).
2. **Preseleccionados** — pasa filtro inicial de score y contacto.
3. **Entrevista** — entrevista estructurada con el gerente del punto.
4. **Prueba** — periodo de prueba en piso, en el punto destino.
5. **Contratados** — pasa a onboarding.

Volumen de referencia del embudo: 240 captados → 87 contactados → 23 en entrevista → 6 contratados.

### 3.3 Pre-filtro conversacional por WhatsApp (agente IA)

El asistente de Don Benítez contacta al candidato y confirma **3 cosas** en ~2 minutos:

1. **Experiencia técnica específica del rol** (ej. cocina: "¿Has manejado plancha y freidora en el mismo turno?").
2. **Disponibilidad para turnos pico**: viernes y sábado noche.
3. **Agenda de entrevista** con fecha, hora y punto concretos.

Guion de referencia:
> "Hola Daniela, soy el asistente de Don Benítez. Vi tu hoja de vida para cocinera en Medellín Poblado. ¿Tienes 2 min para confirmar 3 cosas?"
> "Tu experiencia dice 2 años en cocina caliente. ¿Has manejado plancha y freidora en el mismo turno?"
> "Segunda: disponibilidad de turno viernes y sábado noche, que son nuestros picos. Tercera: ¿puedes venir a entrevista el jueves 24 a las 3 pm en Poblado?"

Al confirmar, la entrevista **se agenda y se asigna automáticamente al gerente del punto**. La lista de candidatos se ordena por score IA.

### 3.4 Evaluación y scoring del candidato

Cada candidato se evalúa en:

- **Score cultural** — afinidad con una marca experiencial y de celebración.
- **Score de servicio** — calidez, lectura de mesa, venta sugerida, manejo de objeciones.
- **Score global** — combinación de ambos más experiencia.
- **Fortalezas** (3 por candidato, ej.: "Energía de piso", "Venta sugerida", "Gestión de espera").
- **Resumen IA** del perfil, **recomendación** (siguiente etapa y punto destino) y **nota de riesgo** (bajo / medio / medio-alto / alto + qué validar).

Reglas de decisión:

- **Score cultural > 88 = filtro de calidad**: estos candidatos muestran mejor retención y mejor recepción del entrenamiento. *(Impacto esperado: +18% retención).*
- **Fast-track para perfiles experienciales**: los mejores perfiles de servicio y celebración saltan directo a entrevista final cuando el punto depende de la experiencia para vender más. *(Impacto: time-to-hire −5 días).* Ej.: mover candidatos con score de servicio > 88 a entrevista final.
- **Perfiles técnicos con bajo fit cultural** (típico en cocina): solo avanzan con un líder fuerte de acompañamiento o si el fit mejora en entrevista estructurada.
- **Perfiles de cobertura rápida** (bajo potencial): quedan en pool secundario hasta validar fit cultural.
- **Asignar el candidato al punto donde su fortaleza cierra la brecha** (ej.: líder disciplinado → sede crítica; anfitrión con alta energía → punto con experiencia de llegada débil; bilingüe → punto turístico).

Qué se valida típicamente en la nota de riesgo:
- Estabilidad de horarios nocturnos y fines de semana; flexibilidad de turnos rotativos.
- Permanencia mínima y estabilidad en trabajos anteriores.
- Disciplina de mise en place (cocina).
- Actitud frente al feedback; referencias con fricción con jefaturas.
- Tolerancia a alta presión en fines de semana.
- Adaptación a una cultura experiencial y festiva (en perfiles muy operativos).
- Manejo de cierres con sistema POS (caja).
- Aspiración salarial vs. estructura actual; velocidad de incorporación.

### 3.5 Banco de preguntas de entrevista por rol

**Mesero**
- Cuéntame cómo subes el ticket promedio sin romper la experiencia.
- ¿Qué haces cuando una mesa llega a celebrar pero cocina está retrasada?
- Describe una situación en la que lograste recuperar a un cliente molesto.
- ¿Cómo decides qué sugerir según el tipo de mesa?
- ¿Qué significa para ti servicio memorable?
- ¿Cómo adaptarías la sugerencia de venta a turismo extranjero?
- ¿Qué detalles observas para anticipar una celebración?
- ¿Cómo recuperas un pedido tardío sin perder calidez?
- ¿Cómo te preparas antes de arrancar turno?
- ¿Qué haces para que una mesa se sienta cuidada?
- Cuéntame una vez que corregiste un error frente al cliente.
- ¿Qué vendes primero cuando la mesa viene a celebrar?
- ¿Cómo manejas cambios de último minuto en comanda?
- ¿Qué hábito te diferencia como mesero?
- ¿Cómo conviertes una visita normal en una celebración memorable?
- ¿Qué guion usas para vender una segunda ronda sin ser invasivo?
- ¿Cómo mantienes consistencia cuando el salón está lleno?

**Anfitrión**
- ¿Cómo comunicas una espera larga sin deteriorar la percepción del cliente?
- ¿Cómo priorizas entre reserva, walk-in y celebración sorpresa?
- ¿Qué haces para que el primer minuto se sienta especial?
- ¿Cómo mantienes energía alta durante todo el turno?
- ¿Qué haces cuando una mesa llega a celebrar sin reserva?
- ¿Cómo organizas lista de espera y prioridad?
- ¿Cómo manejas a un cliente que llega molesto antes de sentarse?
- ¿Cómo equilibras velocidad y calidez en recepción?

**Cocina**
- ¿Cómo priorizas comandas en hora pico sin sacrificar calidad?
- ¿Qué indicadores revisas para saber si tu estación está bajo control?
- ¿Cómo reaccionas cuando salón pide acelerar un pedido especial?
- ¿Cómo reduces reprocesos en un turno muy cargado?
- ¿Cómo entrenas a alguien más lento que tú?
- ¿Cómo mantienes estándar con volumen alto?
- ¿Qué controlas antes de arrancar hora pico?
- ¿Cómo apoyas a un compañero rezagado sin descuidar tu estación?
- ¿Cómo mantienes limpieza en medio del caos?
- ¿Qué haces cuando otro cocinero no está dando el nivel?
- ¿Qué haces si recibes varias comandas urgentes al mismo tiempo?
- ¿Cómo te aseguras de no cometer errores con presión?

**Cajero**
- ¿Cómo mantienes velocidad sin que el cliente sienta prisa?
- ¿Qué haces cuando hay error en cuenta y la fila sigue creciendo?
- ¿Cómo sugieres un extra en una interacción muy corta?
- ¿Cómo manejas una fila larga sin perder precisión?
- ¿Cómo explicas una corrección de cuenta con calma?
- ¿Cómo mantienes foco con muchas órdenes simultáneas?
- ¿Qué haces cuando un cliente siente que la cuenta está mal?
- ¿Cómo conviertes un cierre rápido en una experiencia correcta?

**Líder de punto**
- ¿Cuál es tu rutina de apertura para anticipar fallas del turno?
- ¿Cómo corriges un equipo sin bajar energía ni servicio?
- ¿Qué harías en tus primeros 10 días en un punto con score bajo?
- ¿Cómo conviertes un dashboard en acciones concretas de turno?
- ¿Qué hábitos diarios sostienen una cultura de servicio?
- ¿Cómo reaccionas cuando ticket y satisfacción caen al mismo tiempo?
- ¿Cómo adaptas formación según el desempeño real del punto?
- ¿Qué tablero revisas cada día y qué decisiones tomas con él?
- ¿Cómo equilibras cultura, ventas y control operativo?

### 3.6 Del contrato al onboarding

- Todo contratado entra a **onboarding acelerado con los módulos de Cultura y Celebración en la primera semana**.
- Perfiles comerciales: acelerar onboarding de **venta sugerida (upsell) y protocolo de celebración**.
- Perfiles de cocina con poca mentalidad de experiencia: onboarding con énfasis en **conexión cocina–experiencia** y adopción de **rituales de apertura**.
- Perfiles desarrollables / de volumen: **ruta de onboarding muy guiada**.
- Seguimiento: **medir desempeño en la primera quincena** y monitorear la curva de adaptación al sistema interno.
- **Líderes nuevos deben cerrar el 100% del onboarding operacional**; los líderes con onboarding incompleto correlacionan con más alertas de servicio y menor adherencia del equipo.

---

## 4. Proceso de formación (Academia)

### 4.1 Catálogo de módulos (cápsulas)

| Módulo | Categoría | Duración | Roles | Contenido | Impacto buscado |
|---|---|---|---|---|---|
| **Cultura Benítez** | Cultura | 18 min | Todos | Qué significa operar una marca de celebración: energía, hospitalidad y disciplina visible en cada turno. | Estabiliza experiencia y onboarding desde la primera semana. |
| **Protocolo de celebración** | Servicio | 22 min | Mesero, Anfitrión, Líder | Secuencia de canto, timing, coordinación con cocina y manejo de sorpresa para cumpleaños y grupos. | Mejora percepción de marca y repetición de visitas. |
| **Venta sugerida y ticket promedio** | Ventas | 16 min | Mesero, Anfitrión, Cajero, Líder | Cómo recomendar entradas, bebidas y extras premium según tipo de mesa y momento del servicio. | Aumenta ticket sin generar fricción comercial. |
| **Manejo de tiempos pico** | Operación | 19 min | Cocina, Mesero, Líder | Ritmo, asignación de tareas y control visual para almuerzos y noches de alta ocupación. | Reduce esperas y evita deterioro de satisfacción. |
| **Manejo de quejas** | Servicio | 14 min | Mesero, Anfitrión, Cajero, Líder | Guía práctica para recuperar experiencia, contener escalaciones y cerrar con sensación positiva. | Disminuye fricción y protege reputación del punto. |
| **Hospitalidad y experiencia** | Cultura | 17 min | Todos | Microcomportamientos visibles que convierten una visita funcional en una experiencia memorable. | Aumenta satisfacción y consistencia entre turnos. |
| **Coordinación de cocina en hora pico** | Operación | 21 min | Cocina, Líder | Preparación previa, lectura de tickets y sincronización con salón para no perder velocidad. | Recorta minutos de preparación en picos. |
| **Caja sin fricción y cierres limpios** | Operación | 13 min | Cajero, Líder | Cobro ágil, cierres ordenados y lenguaje comercial breve para no romper el cierre de experiencia. | Disminuye filas y errores de cuenta. |

**Ruta obligatoria por rol** = módulos marcados "Todos" + los del rol:
- Mesero: Cultura, Celebración, Venta sugerida, Tiempos pico, Quejas, Hospitalidad.
- Anfitrión: Cultura, Celebración, Venta sugerida, Quejas, Hospitalidad.
- Cocina: Cultura, Tiempos pico, Hospitalidad, Coordinación de cocina.
- Cajero: Cultura, Venta sugerida, Quejas, Hospitalidad, Caja sin fricción.
- Líder de punto: los 8 módulos.

### 4.2 Micro-módulos específicos por competencia (generados para el punto)

Competencias evaluadas por punto: **Servicio, Bar, Cocina, Caja, Celebraciones**. Ejemplos de micro-módulos generados:

- Atajos de bar en viernes pico (Bar, 18 min)
- Guion upsell de celebraciones (Celebraciones, 22 min)
- Recuperación de tiempo en cocina caliente (Cocina, 25 min)
- Flujo de anfitrión con lista de espera (Servicio, 20 min)
- Control de proteína y mermas (Cocina, 24 min)
- Onboarding meseros semana 1 (Servicio, 30 min)
- Cierre rápido de caja turno noche (Caja, 15 min)
- Role-play objeciones de precio (Servicio, 18 min)
- Coctelería mexicana premium (Bar, 26 min)
- Preparación de mise en place (Cocina, 22 min)
- Celebraciones sorpresa: coreografía (Celebraciones, 28 min)
- Manejo de caja con propina repartida (Caja, 16 min)

### 4.3 Proceso de diagnóstico de brechas

1. Se mide la **brecha de cada competencia en cada punto** en escala 0–3: 0 = sin brecha, 1 = leve, 2 = moderada, 3 = crítica.
2. Las brechas se cruzan con las señales del punto (espera, NPS, food cost, quejas, celebraciones ejecutadas, staffing).
3. Para cada brecha relevante se **genera un micro-módulo a la medida del punto** (ver 4.4) y se asigna al líder para ejecutarlo en el próximo turno.
4. Recomendaciones de la academia:
   - **Adaptar formación por señal de negocio**: los puntos críticos necesitan combinaciones distintas (celebración + tiempos pico + coaching comercial), no cápsulas genéricas.
   - **Forzar onboarding visible en líderes nuevos.**
   - **Subir refuerzo de upsell en caja y salón** (los módulos de venta sugerida explican buena parte de la brecha entre puntos top y medios; impacto +3 a +5% de ticket).
   - **Formación adaptativa por punto** (impacto esperado +11 pts de cumplimiento).

### 4.4 Formato estándar de un micro-módulo (15–20 min)

Lo ejecuta **el líder del punto con su equipo durante un turno tranquilo**. Siempre tiene tres partes, y debe ser específico al punto (nombre, turno, KPI afectado), nunca genérico:

1. **Objetivo** — 1–2 frases: qué comportamiento cambia al final del módulo.
2. **Contenido** — 4–6 pasos concretos que el líder ejecuta con el equipo: guion corto de role-play, checklist de bar/caja/cocina o ejemplo específico.
3. **Evaluación** — 3 preguntas o acciones **medibles** que el líder verifica al cierre del turno (medibles, no "entender").

Ejemplo de referencia:

> **Objetivo:** Al final del turno, el equipo reduce su tiempo de atención en la estación y aplica el guion estándar.
>
> **Contenido:**
> - Role-play 5 min: mesero recibe pedido con queja, repite el pedido en voz alta (*back order*).
> - Checklist de mise en place antes del rush de 13:00.
> - Tres frases-ancla para upsell: "¿quieres hacerlo celebración?".
> - Revisión de tiempos de fuego por plato (cronómetro por ticket).
>
> **Evaluación:**
> 1. ¿Cuántos role-play completó cada mesero? (meta: 3)
> 2. ¿Checklist firmado antes del rush? (sí/no)
> 3. Tiempo promedio de fuego vs. estándar.

### 4.5 Seguimiento del colaborador

- Cada colaborador tiene **% de avance** de su ruta obligatoria, **score de desempeño**, **racha de días** de actividad, módulos completados, pendientes y un **módulo recomendado** (el siguiente pendiente).
- Clasificación por avance:
  - **Al día**: ≥ 85%
  - **En foco**: 70–84%
  - **Rezagado**: < 70% → se considera **formación vencida** y riesgo de impacto en piso.
- Seguimiento por sede (avance promedio, rezagados, módulo prioritario) y por rol (avance, desempeño, módulo sugerido).
- Para subir la tasa de finalización: **recordatorios automáticos y seguimiento por el líder**; cápsulas express con **evaluación en piso** durante un periodo definido (ej. 10 días).

### 4.6 Mecanismos de transferencia entre puntos

- **Mentoría**: usar gerentes referentes como mentores (ej. de celebración) para líderes de otras sedes.
- **Shadowing**: equipos de un punto con brecha observan al punto referente (ej. upsell en cajas).
- **Shadow manager**: un gerente de un punto fuerte acompaña a una sede crítica para reordenar briefing y secuencia de servicio.
- **Benchmark interno**: el punto con mejor coordinación cocina–salón se usa como caso para la academia operativa.
- **Escalar el playbook de celebración**: hay 14 puntos de diferencia entre la mejor y la peor ejecución; estandarizarlo eleva satisfacción y repetición (+4.2 pts NPS estimados).

---

## 5. Procesos de operación ligados a talento

### 5.1 Intervención de punto crítico (14 días)

Cuando un punto entra en riesgo alto (vacantes críticas + bajo cumplimiento formativo + experiencia irregular):

1. **Staffing rápido**: cerrar vacantes críticas (prioridad a líder).
2. **Coaching de salón** y **checklist operativo por turno**.
3. **Academia adaptativa** del punto (celebración, tiempos pico, venta sugerida).
4. **Shadow manager** desde un punto referente.
5. **Monitoreo de cada turno** con checklist de celebración y **coaching de upsell al cierre**.

Para líderes nuevos en puntos no críticos: completar onboarding del líder y **auditar la secuencia (ej. de caja) durante 5 días**.

### 5.2 Palancas operativas del día (plan de acción)

Ante una anomalía (ej. espera alta), se proponen **3 palancas ejecutables hoy**, cada una con:
- **Palanca** (≤ 10 palabras).
- **Owner**: Gerente de punto / Líder de turno / Chef / Anfitrión.
- **Plazo**: hoy / mañana / 48 h.
- **Por qué**: el KPI que mueve.

Regla: el gerente debe poder ejecutarla **sin pedir presupuesto**. Válidas: reasignar estación, cambiar turno, llamar proveedor, activar promo interna, hacer role-play de 15 min. No válidas: "contratar consultor", "revisar estrategia". Al ejecutarse, la palanca queda asignada al gerente con fecha y hora.

### 5.3 Rutinas de turno referenciadas

- **Pre-briefing de celebración** antes del turno para no perder consistencia en alta ocupación.
- **Rituales de apertura** (anticipar fallas del turno).
- **Estación extra de apoyo para celebraciones** cuando la capacidad pasa ~94% en noches pico.
- **Refresco de host** en manejo de lista de espera y promesa de tiempo.
- **Microcápsula de manejo de quejas obligatoria** para todo líder nuevo antes del siguiente fin de semana.
- **Cápsula flash de servicio a turismo** y recomendaciones bilingües en puntos turísticos.
- **Ajuste de incentivos de upsell por turno** (bebidas y para compartir).

### 5.4 Indicadores que disparan acciones de talento

| Señal | Acción de talento |
|---|---|
| Rotación de un rol sube | Activar reserva de candidatos |
| Tiempo de preparación sobre benchmark | Priorizar contratación de cocina + reentrenar líder en coordinación de picos |
| Baja consistencia en canto/celebración | Cápsula express de celebración con evaluación en piso |
| Cumplimiento formativo bajo (ej. 64% en quejas) | Recordatorios automáticos + seguimiento por líder |
| Dispersión entre líderes de turno | Microcápsula obligatoria + estandarización de liderazgo |
| Caída de ticket por menor venta sugerida | Role-play de combos premium / shadowing de upsell |
| Celebraciones ejecutadas caen tras cambio de anfitrión | Módulo de celebraciones al nuevo anfitrión |
| Punto en apertura con staffing bajo (ej. 70%) | Plan de contratación + onboarding de meseros semana 1 |

---

## 6. Piloto propuesto

- Arranca en **un punto** (el de mayor anomalía).
- Se mide durante **30 días**: tiempo de espera, NPS, food cost y contrataciones.
