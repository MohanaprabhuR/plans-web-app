import { NextResponse } from "next/server";
import OpenAI from "openai";

type ChatMessage = { role: "user" | "assistant"; content: string };

function getErrorName(e: unknown): string | undefined {
  if (e instanceof Error) return e.name;
  return undefined;
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "AI_NOT_CONFIGURED: Set OPENAI_API_KEY in your environment (.env.local) and restart the server.",
        },
        { status: 503 },
      );
    }

    const client = new OpenAI({ apiKey: openaiKey });

    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 30_000);
    const response = await client.responses.create(
      {
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are a helpful insurance policy assistant. Help users understand their insurance policies, coverage details, deductibles, claim procedures, and renewals. Be concise and clear.",
          },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      },
      { signal: ac.signal },
    );
    clearTimeout(timeout);

    const text = response.output_text ?? "";
    if (!text.trim()) {
      return NextResponse.json(
        { ok: false, error: "AI_EMPTY_RESPONSE" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: { role: "assistant", content: text },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const lower = message.toLowerCase();
    const isAuthError =
      lower.includes("invalid") ||
      lower.includes("api key") ||
      lower.includes("authentication") ||
      lower.includes("unauthorized") ||
      lower.includes("401");

    if (isAuthError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "AI_AUTH_ERROR: Your OPENAI_API_KEY is missing/invalid. Update it and restart the server.",
        },
        { status: 401 },
      );
    }

    if (e instanceof OpenAI.APIError) {
      const detail =
        typeof e.message === "string" && e.message.trim() ? e.message : "OpenAI API error";
      const code = typeof e.code === "string" ? e.code : undefined;
      const type = typeof e.type === "string" ? e.type : undefined;
      const status = typeof e.status === "number" ? e.status : 502;

      if (detail.toLowerCase().includes("aborted")) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "OPENAI_TIMEOUT: The AI request took too long. Please try again.",
          },
          { status: 504 },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: `OPENAI_API_ERROR${code ? ` (${code})` : ""}: ${detail}`,
          ...(process.env.NODE_ENV !== "production"
            ? { debug: { status, type, code, requestID: e.requestID } }
            : {}),
        },
        { status },
      );
    }

    const aborted =
      (e instanceof Error && e.name === "AbortError") || lower.includes("aborted");
    if (aborted) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "OPENAI_TIMEOUT: The AI request took too long. Please try again.",
        },
        { status: 504 },
      );
    }

    const debug =
      process.env.NODE_ENV !== "production"
        ? { name: getErrorName(e) ?? "", message }
        : undefined;
    return NextResponse.json(
      {
        ok: false,
        error: "Chat service error. Please try again.",
        ...(debug ? { debug } : {}),
      },
      { status: 500 },
    );
  }
}
