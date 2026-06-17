import Anthropic, {
  APIError as AnthropicAPIError,
  AuthenticationError as AnthropicAuthError,
  RateLimitError as AnthropicRateLimitError,
} from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import OpenAI from "openai";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Provider = "openai" | "anthropic";

const SYSTEM_PROMPT =
  "You are a helpful insurance policy assistant. Help users understand their insurance policies, coverage details, deductibles, claim procedures, and renewals. Be concise and clear.";

function getErrorName(e: unknown): string | undefined {
  if (e instanceof Error) return e.name;
  return undefined;
}

function isAnthropicKey(key: string): boolean {
  return key.startsWith("sk-ant-");
}

function isOpenAIKey(key: string): boolean {
  return key.startsWith("sk-") && !isAnthropicKey(key);
}

function resolveProvider(): { provider: Provider; apiKey: string } | null {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (openaiKey && isOpenAIKey(openaiKey)) {
    return { provider: "openai", apiKey: openaiKey };
  }
  if (anthropicKey && isAnthropicKey(anthropicKey)) {
    return { provider: "anthropic", apiKey: anthropicKey };
  }
  if (openaiKey) {
    return { provider: "openai", apiKey: openaiKey };
  }
  if (anthropicKey) {
    return { provider: "anthropic", apiKey: anthropicKey };
  }
  return null;
}

function extractAnthropicText(content: Anthropic.Message["content"]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

function getLastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") return messages[i].content;
  }
  return messages[messages.length - 1]?.content ?? "";
}

function getDemoResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("deductible")) {
    return "Your deductible is the amount you pay out of pocket before your insurer starts covering eligible claims. Check your policy schedule for the exact figure for this plan year.";
  }
  if (lower.includes("renew")) {
    return "To renew your policy, review your renewal notice, confirm coverage and premium details, and complete payment before the due date. I can walk you through each step if you share your policy type.";
  }
  if (lower.includes("claim")) {
    return "To file a claim, gather bills or incident details, submit through your insurer's claims portal or app, and keep your policy number handy. You'll typically get a claim reference number after submission.";
  }
  return "I'm answering in demo mode because no AI provider is available right now. Add a valid `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env.local`, or add billing/credits to your provider account, then restart the server.";
}

function isQuotaOrAuthError(error: string): boolean {
  const lower = error.toLowerCase();
  return (
    lower.includes("ai_auth_error") ||
    lower.includes("ai_quota_exceeded") ||
    lower.includes("insufficient_quota") ||
    lower.includes("invalid") ||
    lower.includes("authentication") ||
    lower.includes("billing") ||
    lower.includes("credit")
  );
}

function demoFallback(
  messages: ChatMessage[],
  failure: { ok: false; error: string; status: number },
) {
  if (process.env.NODE_ENV === "production" || !isQuotaOrAuthError(failure.error)) {
    return NextResponse.json(failure, { status: failure.status });
  }

  const userMessage = getLastUserMessage(messages);
  return NextResponse.json({
    ok: true,
    message: { role: "assistant", content: getDemoResponse(userMessage) },
    demo: true,
  });
}

async function chatWithOpenAI(
  apiKey: string,
  messages: ChatMessage[],
  signal: AbortSignal,
): Promise<string> {
  const client = new OpenAI({ apiKey });
  const response = await client.responses.create(
    {
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    },
    { signal },
  );
  return response.output_text ?? "";
}

async function chatWithAnthropic(
  apiKey: string,
  messages: ChatMessage[],
  signal: AbortSignal,
): Promise<string> {
  const client = new Anthropic({ apiKey });
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
    { signal },
  );
  return extractAnthropicText(response.content);
}

export async function POST(req: Request) {
  let messages: ChatMessage[] = [];

  try {
    const body = (await req.json()) as { messages: ChatMessage[] };
    messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const resolved = resolveProvider();
    if (!resolved) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "AI_NOT_CONFIGURED: Set OPENAI_API_KEY or ANTHROPIC_API_KEY in `.env.local` and restart the server.",
        },
        { status: 503 },
      );
    }

    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 30_000);

    let text = "";
    try {
      text =
        resolved.provider === "openai"
          ? await chatWithOpenAI(resolved.apiKey, messages, ac.signal)
          : await chatWithAnthropic(resolved.apiKey, messages, ac.signal);
    } finally {
      clearTimeout(timeout);
    }

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

    if (e instanceof AnthropicAuthError) {
      return demoFallback(messages, {
        ok: false,
        error:
          "AI_AUTH_ERROR: Your ANTHROPIC_API_KEY is invalid. Anthropic keys start with `sk-ant-`.",
        status: 401,
      });
    }

    if (e instanceof AnthropicRateLimitError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "AI_RATE_LIMIT: Too many requests. Wait a moment and try again.",
        },
        { status: 429 },
      );
    }

    if (e instanceof AnthropicAPIError) {
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
        return demoFallback(messages, {
          ok: false,
          error:
            "AI_QUOTA_EXCEEDED: Your Anthropic account has no credits or billing is inactive.",
          status: 402,
        });
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

    const isAuthError =
      lower.includes("invalid") ||
      lower.includes("api key") ||
      lower.includes("authentication") ||
      lower.includes("unauthorized") ||
      lower.includes("401");

    if (isAuthError) {
      return demoFallback(messages, {
        ok: false,
        error:
          "AI_AUTH_ERROR: Your OPENAI_API_KEY is missing or invalid. Update it and restart the server.",
        status: 401,
      });
    }

    if (e instanceof OpenAI.APIError) {
      const detail =
        typeof e.message === "string" && e.message.trim()
          ? e.message
          : "OpenAI API error";
      const code = typeof e.code === "string" ? e.code : undefined;
      const type = typeof e.type === "string" ? e.type : undefined;
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
        code === "insufficient_quota" ||
        (status === 429 && detailLower.includes("quota"))
      ) {
        return demoFallback(messages, {
          ok: false,
          error:
            "AI_QUOTA_EXCEEDED: Your OpenAI account has no credits or billing is inactive.",
          status: 402,
        });
      }

      if (status === 429 && !detailLower.includes("quota")) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "AI_RATE_LIMIT: Too many requests. Wait a moment and try again.",
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error: `AI_API_ERROR${code ? ` (${code})` : ""}: ${detail}`,
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
