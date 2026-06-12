import Anthropic, {
  APIError,
  AuthenticationError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT =
  "You are a helpful insurance policy assistant. Help users understand their insurance policies, coverage details, deductibles, claim procedures, and renewals. Be concise and clear.";

function getErrorName(e: unknown): string | undefined {
  if (e instanceof Error) return e.name;
  return undefined;
}

function extractText(content: Anthropic.Message["content"]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "AI_NOT_CONFIGURED: Set ANTHROPIC_API_KEY in your environment (.env.local) and restart the server.",
        },
        { status: 503 },
      );
    }

    const client = new Anthropic({ apiKey });

    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 30_000);
    const response = await client.messages.create(
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      },
      { signal: ac.signal },
    );
    clearTimeout(timeout);

    const text = extractText(response.content);
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

    if (e instanceof AuthenticationError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "AI_AUTH_ERROR: Your ANTHROPIC_API_KEY is missing/invalid. Update it and restart the server.",
        },
        { status: 401 },
      );
    }

    if (e instanceof RateLimitError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "AI_RATE_LIMIT: Too many requests. Wait a moment and try again.",
        },
        { status: 429 },
      );
    }

    if (e instanceof APIError) {
      const detail =
        typeof e.message === "string" && e.message.trim()
          ? e.message
          : "Anthropic API error";
      const type = e.type ?? undefined;
      const status = typeof e.status === "number" ? e.status : 502;
      const detailLower = detail.toLowerCase();

      if (detailLower.includes("aborted")) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "AI_TIMEOUT: The AI request took too long. Please try again.",
          },
          { status: 504 },
        );
      }

      if (
        detailLower.includes("credit") ||
        detailLower.includes("billing") ||
        detailLower.includes("quota") ||
        status === 402
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "AI_QUOTA_EXCEEDED: Your Anthropic account has no credits or billing is inactive. Add credits at https://console.anthropic.com/settings/billing — then try again.",
          },
          { status: 402 },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: `AI_API_ERROR${type ? ` (${type})` : ""}: ${detail}`,
          ...(process.env.NODE_ENV !== "production"
            ? { debug: { status, type, requestID: e.requestID } }
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
            "AI_TIMEOUT: The AI request took too long. Please try again.",
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
