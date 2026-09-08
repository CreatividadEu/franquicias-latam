import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, readJson, unauthorized } from "@/lib/totto-way/api";
import { getTwSessionOrNull, type TwSession } from "@/lib/totto-way/auth";
import { checkRateLimit } from "@/lib/totto-way/assistant/rate-limit";
import {
  ASSISTANT_MAX_TOKENS,
  ASSISTANT_MODEL,
  contextBlock,
  documentBlocks,
  normalizeQuestion,
  SYSTEM_PROMPT,
  type AssistantContext,
} from "@/lib/totto-way/assistant/prompts";
import { searchKnowledge, type KbHit } from "@/lib/totto-way/assistant/retrieval";
import { ASSISTANT_TOOLS, runTool, type AssistantAction } from "@/lib/totto-way/assistant/tools";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Vueltas máximas del bucle de herramientas: acota coste y latencia. */
const MAX_ROUNDS = 3;

const BodySchema = z.object({
  message: z.string().trim().min(2).max(1000),
  threadId: z.string().max(64).nullish(),
  lessonId: z.string().max(64).nullish(),
});

type Encoder = (event: string, data: unknown) => void;

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-store, no-transform",
    Connection: "keep-alive",
  };
}

async function buildContext(session: TwSession, lessonId?: string | null): Promise<AssistantContext> {
  let lesson: AssistantContext["lesson"] = null;
  if (lessonId) {
    const row = await prisma.twLesson.findFirst({
      where: { id: lessonId, chapter: { franchiseId: session.franchiseId } },
      select: { title: true, chapter: { select: { number: true, title: true } } },
    });
    if (row) {
      lesson = { title: row.title, chapter: `Capítulo ${String(row.chapter.number).padStart(2, "0")} · ${row.chapter.title}` };
    }
  }
  return {
    name: session.user.name,
    roleTitle: session.employee?.roleTitle ?? session.user.role,
    store: session.employee?.store?.name ?? null,
    country: session.employee?.store?.country ?? null,
    lesson,
  };
}

/** Guarda la pregunta de forma anónima para la analítica del Estudio. */
async function recordQuestion(franchiseId: string, question: string) {
  const normalized = normalizeQuestion(question);
  if (normalized.length < 4) return;
  await prisma.twAssistantQuestionStat.upsert({
    where: { franchiseId_normalizedQuestion: { franchiseId, normalizedQuestion: normalized } },
    update: { count: { increment: 1 }, lastAskedAt: new Date() },
    create: { franchiseId, normalizedQuestion: normalized, sample: question.slice(0, 300) },
  });
}

export async function POST(request: Request) {
  const session = await getTwSessionOrNull();
  if (!session) return unauthorized();

  const parsed = BodySchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Escribe una pregunta de al menos dos caracteres.", 400);

  const limit = checkRateLimit(session.user.id);
  if (!limit.ok) {
    return jsonError("Has hecho muchas preguntas seguidas. Inténtalo en un rato.", 429, { retryAfter: limit.retryAfter });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey || apiKey.length < 20) {
    return jsonError("El Asistente todavía no está configurado en este entorno.", 503, { code: "NOT_CONFIGURED" });
  }

  const { message, lessonId } = parsed.data;
  const [context, initialHits] = await Promise.all([
    buildContext(session, lessonId),
    searchKnowledge(session.franchiseId, message),
  ]);

  // Hilo: uno nuevo si no llega ninguno, y siempre del propio usuario.
  const thread = parsed.data.threadId
    ? await prisma.twAssistantThread.findFirst({ where: { id: parsed.data.threadId, userId: session.user.id } })
    : null;
  const threadId =
    thread?.id ??
    (
      await prisma.twAssistantThread.create({
        data: { franchiseId: session.franchiseId, userId: session.user.id, lessonId: lessonId ?? null },
        select: { id: true },
      })
    ).id;

  const history = thread
    ? await prisma.twAssistantMessage.findMany({
        where: { threadId: thread.id },
        orderBy: { createdAt: "asc" },
        take: 10,
        select: { role: true, content: true },
      })
    : [];

  const client = new Anthropic({ apiKey, maxRetries: 2, timeout: 55_000 });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send: Encoder = (event, data) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Los documentos se acumulan entre vueltas para que los índices de las
      // citas que devuelve el modelo sigan apuntando al mismo sitio.
      const documents: KbHit[] = [...initialHits];
      const actions: AssistantAction[] = [];
      let answer = "";

      const messages: Anthropic.MessageParam[] = [
        ...history.map((row) => ({
          role: row.role === "USER" ? ("user" as const) : ("assistant" as const),
          content: row.content,
        })),
        {
          role: "user",
          content: [
            ...documentBlocks(documents),
            { type: "text" as const, text: `${contextBlock(context)}\n\nPregunta: ${message}` },
          ],
        },
      ];

      try {
        for (let round = 0; round < MAX_ROUNDS; round += 1) {
          const run = client.messages.stream({
            model: ASSISTANT_MODEL,
            max_tokens: ASSISTANT_MAX_TOKENS,
            system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
            thinking: { type: "adaptive" },
            output_config: { effort: "low" },
            tools: ASSISTANT_TOOLS,
            messages,
          });

          for await (const event of run) {
            if (event.type !== "content_block_delta") continue;
            if (event.delta.type === "text_delta") {
              answer += event.delta.text;
              send("delta", { text: event.delta.text });
            } else if (event.delta.type === "citations_delta") {
              const citation = event.delta.citation as { document_index?: number; cited_text?: string };
              const hit = documents[citation.document_index ?? -1];
              if (hit) {
                send("cite", {
                  title: hit.title,
                  href: hit.locator.href ?? null,
                  quote: (citation.cited_text ?? "").slice(0, 220),
                });
              }
            }
          }

          const final = await run.finalMessage();
          if (final.stop_reason !== "tool_use") break;

          const calls = final.content.filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
          if (calls.length === 0) break;

          messages.push({ role: "assistant", content: final.content });
          const results: Anthropic.ToolResultBlockParam[] = [];

          for (const call of calls) {
            const outcome = await runTool(session, call.name, (call.input ?? {}) as Record<string, unknown>);
            if (outcome.action) {
              actions.push(outcome.action);
              send("action", outcome.action);
            }
            if (outcome.hits?.length) documents.push(...outcome.hits);
            results.push({
              type: "tool_result",
              tool_use_id: call.id,
              content: outcome.result,
              is_error: outcome.isError,
            });
          }

          messages.push({ role: "user", content: results });
        }

        await Promise.all([
          prisma.twAssistantMessage.createMany({
            data: [
              { threadId, role: "USER", content: message },
              {
                threadId,
                role: "ASSISTANT",
                content: answer,
                citations: documents.slice(0, 8).map((hit) => ({ title: hit.title, href: hit.locator.href ?? null })),
                toolCalls: actions.length > 0 ? actions : undefined,
              },
            ],
          }),
          recordQuestion(session.franchiseId, message),
        ]);

        send("done", { threadId });
      } catch (error) {
        console.error("[totto-way/assistant] fallo:", error);
        const status = error instanceof Anthropic.APIError ? error.status : undefined;
        send("error", {
          message:
            status === 401
              ? "El Asistente no está configurado en este entorno."
              : "No pude responder ahora mismo. Inténtalo de nuevo o pregúntale a tu líder de tienda.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}
