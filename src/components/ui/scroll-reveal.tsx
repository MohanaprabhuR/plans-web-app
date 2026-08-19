"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ScrollRevealProps = React.ComponentProps<"div"> & {
  /** Stagger offset in ms, for sibling items revealed in sequence. */
  delay?: number;
  /** How far the content rises as it reveals. */
  distance?: "sm" | "md" | "lg";
  /** Reveal once and stay visible (default), or re-animate on every entry. */
  once?: boolean;
};

const DISTANCE: Record<NonNullable<ScrollRevealProps["distance"]>, string> = {
  sm: "translate-y-2",
  md: "translate-y-4",
  lg: "translate-y-8",
};

/**
 * Fades and lifts its children into view as they scroll into the viewport.
 *
 * Uses IntersectionObserver rather than scroll handlers so it stays off the
 * main thread. Content renders visible by default and is only hidden once the
 * observer is confirmed available, so it can never leave content permanently
 * invisible (no-JS, older browsers, or a failed hydration all render normally).
 * Motion is skipped entirely under prefers-reduced-motion.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  distance = "md",
  once = true,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(true);
  const [armed, setArmed] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    // Only hide content once we know we can reveal it again.
    setArmed(true);
    setVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn(
        armed && "transition duration-500 ease-out",
        armed && !visible && cn("opacity-0", DISTANCE[distance]),
        armed && visible && "opacity-100 translate-y-0",
        className,
      )}
      style={armed && delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
