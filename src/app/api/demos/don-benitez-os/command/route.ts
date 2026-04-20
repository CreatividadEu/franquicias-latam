import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient, MODEL, streamTextResponse } from "../_lib/anthropic";
import { COMMAND_SYSTEM_PROMPT } from "@/app/demos/don-benitez-os/_lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { query?: string };
  const query = typeof body.query === "string" ? body.query.trim() : "";

  if (!query) {
    return NextResponse.json({ error: "query vacía" }, { status: 400 });
  }

  const client = getAnthropicClient();
  if (!client) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });
  }

  try {
    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: 400,
      system: COMMAND_SYSTEM_PROMPT,
      messages: [{ role: "user", content: query }],
    });

    return new Response(streamTextResponse(stream), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "stream-failed" },
      { status: 502 }
    );
  }
}
