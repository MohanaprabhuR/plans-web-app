import React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal, dependency-free markdown renderer for AI chat replies.
 *
 * Supports the subset the model actually emits: headings, ordered and
 * unordered lists, paragraphs, and inline bold / italic / code. Output is
 * built as React nodes (never dangerouslySetInnerHTML), so model output
 * cannot inject markup.
 */

type InlineProps = { text: string };

function Inline({ text }: InlineProps) {
  // Built per call: a shared /g regex carries mutable lastIndex between uses.
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*\s][^*]*\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(
        <strong key={key++} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-muted px-1 py-0.5 font-mono text-sm"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));

  return <>{nodes}</>;
}

type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "paragraph"; text: string };

const HEADING_RE = /^(#{1,4})\s+(.*)$/;
const BULLET_RE = /^\s*[-*•]\s+(.*)$/;
const ORDERED_RE = /^\s*\d+[.)]\s+(.*)$/;

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };

  for (const line of lines) {
    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    const heading = HEADING_RE.exec(line);
    if (heading) {
      flushParagraph();
      blocks.push({
        kind: "heading",
        level: heading[1].length,
        text: heading[2],
      });
      continue;
    }

    const ordered = ORDERED_RE.exec(line);
    const bullet = BULLET_RE.exec(line);
    if (ordered || bullet) {
      flushParagraph();
      const isOrdered = Boolean(ordered);
      const item = (ordered ?? bullet)![1];
      const previous = blocks[blocks.length - 1];
      if (previous?.kind === "list" && previous.ordered === isOrdered) {
        previous.items.push(item);
      } else {
        blocks.push({ kind: "list", ordered: isOrdered, items: [item] });
      }
      continue;
    }

    paragraph.push(line.trim());
  }
  flushParagraph();

  return blocks;
}

export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = React.useMemo(() => parseBlocks(content), [content]);

  return (
    <div className={cn("space-y-2", className)}>
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <p
              key={i}
              className={cn(
                "font-semibold text-foreground",
                block.level <= 2 ? "text-base" : "text-sm",
                i > 0 && "pt-1",
              )}
            >
              <Inline text={block.text} />
            </p>
          );
        }

        if (block.kind === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={i}
              className={cn(
                "space-y-1 pl-5",
                block.ordered ? "list-decimal" : "list-disc",
                "marker:text-muted-foreground",
              )}
            >
              {block.items.map((item, j) => (
                <li key={j} className="pl-0.5">
                  <Inline text={item} />
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={i}>
            <Inline text={block.text} />
          </p>
        );
      })}
    </div>
  );
}
