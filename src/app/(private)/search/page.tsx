"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  File as FileGlyph,
  FileText,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Markdown } from "@/components/ui/markdown";
import useAuth from "@/hooks/useAuth";
import {
  getPolicyChatContextFromSearchParams,
  getPolicyChatIntroMessage,
  getPolicyFileMetaFromContext,
} from "@/lib/policy-chat";

type UploadState = "none" | "uploading" | "success" | "failed";
type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

export default function SearchPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const policyContext = useMemo(
    () => getPolicyChatContextFromSearchParams(searchParams),
    [searchParams],
  );
  const userAvatar =
    (user?.user_metadata?.avatar_url as string | undefined) ?? "";

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("none");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [policyFile, setPolicyFile] = useState<{
    name: string;
    sizeMb: number;
  } | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const suggestions = useMemo(
    () => ["What's my deductible?", "Renew policy", "Claim status"],
    [],
  );

  const policyUploaded = uploadState === "success";

  useEffect(() => {
    if (!policyContext) return;

    setPolicyFile(getPolicyFileMetaFromContext(policyContext));
    setUploadState("success");
    setUploadProgress(100);
  }, [policyContext]);

  useEffect(() => {
    if (!policyUploaded) return;
    if (messages.length > 0) return;
    setMessages([
      {
        role: "assistant",
        content: getPolicyChatIntroMessage(policyContext),
      },
    ]);
  }, [messages.length, policyContext, policyUploaded]);

  const openFilePicker = () => fileInputRef.current?.click();

  const resetUpload = () => {
    setUploadState("none");
    setUploadProgress(0);
    setPolicyFile(null);
    setMessages([]);
    setInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    if (messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  const startUploadSimulation = (file: { name: string; sizeMb: number }) => {
    setUploadState("uploading");
    setUploadProgress(0);
    setPolicyFile(file);

    const step = 12;
    const intervalMs = 350;
    const t = window.setInterval(() => {
      setUploadProgress((p) => {
        const next = Math.min(100, p + step);
        if (next >= 100) {
          window.clearInterval(t);
          setUploadState("success");
        }
        return next;
      });
    }, intervalMs);
  };

  const onPickFile = (f: File | null) => {
    if (!f) return;
    const sizeMb = Math.round((f.size / (1024 * 1024)) * 10) / 10;
    const meta = { name: f.name, sizeMb };

    if (f.type !== "application/pdf" || f.size > 25 * 1024 * 1024) {
      setPolicyFile(meta);
      setUploadState("failed");
      return;
    }

    startUploadSimulation(meta);
  };

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        message?: { role: "assistant"; content: string };
        error?: string;
      };
      if (!res.ok || !json.ok || !json.message?.content) {
        throw new Error(json.error || "Failed to get response.");
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: json.message!.content },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to get response.";
      const friendly = msg.includes("AI_NOT_CONFIGURED")
        ? "AI is not configured. Add `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env.local` and restart the server."
        : msg.includes("AI_AUTH_ERROR")
          ? "Your AI API key is invalid. Check `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` in `.env.local` and restart the server."
          : msg.includes("AI_QUOTA_EXCEEDED")
            ? "Your AI provider has no credits left. Add billing or credits to your OpenAI or Anthropic account, then try again."
            : msg.includes("AI_RATE_LIMIT")
              ? "Too many AI requests in a short time. Wait a minute and try again."
              : msg;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry — ${friendly}` },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
      />

      {/* Header */}
      <div className="text-center space-y-2 pt-6">
        <div className="mx-auto size-12 rounded-full bg-foreground text-background flex items-center justify-center">
          <Sparkles className="size-5" />
        </div>
        <div className="text-2xl font-semibold text-foreground">
          How Can I Help You Today?
        </div>
        <div className="text-sm text-muted-foreground">
          Clear answers. Simple explanations. Anytime, Everytime.
        </div>
      </div>

      {/* Status row — replaces the card header once a policy is uploaded */}
      {policyUploaded && (
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Recent Chats
                <ChevronDown className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem disabled>No recent chats</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 className="size-4" />
              Policy Uploaded
            </span>
            <Badge
              variant="outline"
              size="md"
              className="text-[#FF5E00] outline-[#FF5E00]/35"
            >
              Required
            </Badge>
          </div>
        </div>
      )}

      {/* Upload / Chat Card */}
      <Card className="border-border/70">
        <CardContent className="p-6 space-y-4">
          {/* Card header — only before upload */}
          {!policyUploaded && (
            <div className="flex items-center justify-between">
              <div className="font-semibold text-foreground">Upload Policy</div>
              <div className="text-sm text-muted-foreground">
                No Policy Uploaded
              </div>
            </div>
          )}

          {/* ── Upload panel: progress fills the panel left→right ── */}
          {!policyUploaded && (
          <div
            className={`relative overflow-hidden rounded-xl border text-center transition-colors ${
              isDragging
                ? "border-[#FF5E00]"
                : uploadState === "failed"
                  ? "border-destructive/40 bg-destructive/5"
                  : uploadState === "uploading"
                    ? "border-orange-200"
                    : "border-dashed bg-muted/10"
            } ${uploadState === "none" && !isDragging ? "cursor-pointer" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (uploadState !== "uploading") setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              onPickFile(e.dataTransfer.files?.[0] ?? null);
            }}
            onClick={uploadState === "none" ? openFilePicker : undefined}
          >
            {/* Progress fill */}
            {(uploadState === "uploading" || isDragging) && (
              <div
                aria-hidden
                className={`absolute inset-y-0 left-0 transition-[width] duration-300 ease-out ${
                  isDragging ? "bg-[#FF5E00]/5" : "bg-orange-100"
                }`}
                style={{ width: isDragging ? "100%" : `${uploadProgress}%` }}
              />
            )}

            <div className="relative p-10">
              {/* Document icon */}
              <FileGlyph
                strokeWidth={1.5}
                className={`mx-auto mb-4 size-11 ${
                  isDragging
                    ? "fill-[#FF5E00]/20 text-[#FF5E00]"
                    : "fill-amber-200 text-amber-400"
                }`}
              />

              {isDragging ? (
                <div className="font-medium text-foreground">
                  Drop your policy PDF here
                </div>
              ) : uploadState === "uploading" ? (
                <div className="space-y-1">
                  <div className="font-medium text-foreground">
                    Uploading Policy...{uploadProgress}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Only PDFs, up to 25MB
                  </div>
                </div>
              ) : uploadState === "failed" ? (
                <div className="space-y-1">
                  <div className="font-medium text-foreground">
                    Upload Failed!
                  </div>
                  <div className="text-sm text-muted-foreground">
                    File size exceeded, max size is 25 MB.{" "}
                    <button
                      type="button"
                      className="text-[#FF5E00] underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetUpload();
                        setTimeout(openFilePicker, 0);
                      }}
                    >
                      Please try again!
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="font-medium text-foreground">
                    Drag &amp; Drop or{" "}
                    <button
                      type="button"
                      className="text-[#FF5E00] underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openFilePicker();
                      }}
                    >
                      Click to Upload
                    </button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Only PDFs, up to 25MB
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* ── Chat interface (after upload success) ── */}
          {policyUploaded && (
            <div className="space-y-5">
              {/* Uploaded policy chip */}
              {policyFile && (
                <div className="inline-flex items-center gap-2.5 rounded-lg border bg-background py-2 pl-2.5 pr-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-red-50">
                    <FileText className="size-4 text-red-600" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="truncate text-sm font-medium text-foreground">
                      {policyFile.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Size: {policyFile.sizeMb} MB
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={resetUpload}
                    aria-label="Remove policy"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}

              {/* Chat messages */}
              <div className="min-h-[260px] space-y-5">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    {m.role === "assistant" ? (
                      <div className="mt-1 shrink-0 size-7 rounded-full bg-foreground text-background flex items-center justify-center">
                        <Sparkles className="size-4" />
                      </div>
                    ) : (
                      <Avatar className="size-7 shrink-0">
                        <AvatarImage src={userAvatar} />
                      </Avatar>
                    )}

                    {/* Bubble */}
                    <div
                      className={
                        m.role === "user" ? "max-w-[360px]" : "max-w-[560px]"
                      }
                    >
                      <div
                        className={
                          m.role === "assistant"
                            ? "rounded-xl bg-muted/40 px-3 py-2.5 text-sm leading-relaxed tracking-4 text-foreground"
                            : "rounded-xl border bg-background p-2 text-sm text-foreground leading-5 tracking-4"
                        }
                      >
                        {m.role === "assistant" ? (
                          <Markdown content={m.content} />
                        ) : (
                          m.content
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {sending && (
                  <div className="flex items-center gap-3">
                    <div className="mt-1 size-7 rounded-full bg-foreground text-background flex items-center justify-center">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="rounded-xl bg-muted/40 p-2 text-sm text-muted-foreground inline-flex items-center gap-2">
                      Generating
                      <span className="inline-block size-3 rounded-full border border-muted-foreground/40 border-t-transparent animate-spin" />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Input bar */}
              <div className="rounded-xl bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your question"
                    variant="outline"
                    size="md"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") send();
                    }}
                  />
                  <Button
                    className="size-11 shrink-0 rounded-full p-0 bg-[#FF5E00] hover:bg-[#ff4a00]"
                    onClick={() => send()}
                    disabled={!input.trim() || sending}
                    aria-label="Send"
                  >
                    <Send className="size-4 text-white" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <Button
                      key={s}
                      variant="outline"
                      className="h-7 rounded-md px-2 text-xs"
                      onClick={() => send(s)}
                      disabled={sending}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
