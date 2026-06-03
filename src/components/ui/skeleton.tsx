import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.ComponentProps<"div"> {
  /** Stagger shimmer start (ms) for list animations */
  delay?: number;
}

function Skeleton({ className, delay, style, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/70",
        "after:absolute after:inset-0 after:animate-[skeleton-shimmer_1.4s_ease-in-out_infinite]",
        "after:bg-linear-to-r after:from-transparent after:via-white/40 after:to-transparent",
        "dark:after:via-white/10",
        className,
      )}
      style={{
        ...style,
        ...(delay !== undefined
          ? ({ "--skeleton-delay": `${delay}ms` } as React.CSSProperties)
          : {}),
      }}
      {...props}
    />
  );
}

function SkeletonText({
  className,
  lines = 1,
  lastLineWidth = "w-2/3",
}: {
  className?: string;
  lines?: number;
  lastLineWidth?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3.5 w-full",
            i === lines - 1 && lines > 1 ? lastLineWidth : "w-full",
          )}
          delay={i * 60}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText };
