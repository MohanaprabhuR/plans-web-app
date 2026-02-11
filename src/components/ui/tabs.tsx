"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

type TabVariant = "ghost" | "outline" | "subtle" | "browser" | "underline";
type TabSize = "sm" | "md";
type TabOrientation = "horizontal" | "vertical";

interface TabsContextValue {
  variant: TabVariant;
  size: TabSize;
  orientation: TabOrientation;
  activeTab: string;
  setActiveTab: (value: string) => void;
  registerTab: (value: string, element: HTMLElement) => void;
  unregisterTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(
  undefined
);

interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  variant?: TabVariant;
  size?: TabSize;
  orientation?: TabOrientation;
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger>;

function Tabs({
  className,
  variant = "subtle",
  size = "sm",
  orientation = "horizontal",
  defaultValue,
  value: controlledValue,
  onValueChange,
  ...props
}: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || "");
  const tabRefs = React.useRef<Map<string, HTMLElement>>(new Map());

  const value = controlledValue !== undefined ? controlledValue : activeTab;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setActiveTab(newValue);
      onValueChange?.(newValue);
    },
    [onValueChange]
  );

  const registerTab = React.useCallback(
    (tabValue: string, element: HTMLElement) => {
      tabRefs.current.set(tabValue, element);
    },
    []
  );

  const unregisterTab = React.useCallback((tabValue: string) => {
    tabRefs.current.delete(tabValue);
  }, []);

  return (
    <TabsContext.Provider
      value={{
        variant,
        size,
        orientation,
        activeTab: value,
        setActiveTab: handleValueChange,
        registerTab,
        unregisterTab,
      }}
    >
      <TabsPrimitive.Root
        data-slot="tabs"
        className={cn(
          orientation === "horizontal"
            ? "flex flex-col"
            : "flex flex-row items-center",
          className
        )}
        orientation={orientation}
        value={value}
        onValueChange={handleValueChange}
        defaultValue={defaultValue}
        activationMode="manual"
        {...props}
      />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsList must be used within Tabs");

  const { variant, orientation, activeTab, size } = context;
  const listRef = React.useRef<HTMLDivElement>(null);

  const [indicatorStyle, setIndicatorStyle] =
    React.useState<React.CSSProperties>({});

  const updateIndicator = React.useCallback(() => {
    if (!listRef.current) return;

    const activeElement = listRef.current.querySelector(
      `[data-state="active"]`
    ) as HTMLElement;

    if (!activeElement) {
      setIndicatorStyle({});
      return;
    }

    const listRect = listRef.current.getBoundingClientRect();
    const activeRect = activeElement.getBoundingClientRect();

    // Ensure element has actual dimensions before calculating
    if (activeRect.width === 0 || activeRect.height === 0) {
      return;
    }

    const exactHeight = activeElement.clientHeight;
    const exactWidth = activeRect.width;

    if (orientation === "horizontal") {
      setIndicatorStyle({
        left: `${activeRect.left - listRect.left}px`,
        width: `${exactWidth}px`,
        height: variant === "underline" ? "1px" : `${exactHeight}px`,
      });
    } else {
      setIndicatorStyle({
        top: `${activeRect.top - listRect.top}px`,
        width: variant === "underline" ? "1px" : `${exactWidth}px`,
        height: `${exactHeight}px`,
      });
    }
  }, [orientation, variant]);

  React.useLayoutEffect(() => {
    let rafId: number;
    let timeoutId: NodeJS.Timeout;

    const scheduleUpdate = () => {
      rafId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          updateIndicator();
          timeoutId = setTimeout(() => {
            updateIndicator();
          }, 100);
        });
      });
    };

    scheduleUpdate();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeTab, updateIndicator]);

  // Also update on resize to handle window/modal size changes
  React.useEffect(() => {
    if (!listRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Use RAF to debounce resize updates
      requestAnimationFrame(() => {
        updateIndicator();
      });
    });

    const mutationObserver = new MutationObserver(() => {
      // Update when DOM attributes change (like data-state)
      requestAnimationFrame(() => {
        updateIndicator();
      });
    });

    resizeObserver.observe(listRef.current);
    mutationObserver.observe(listRef.current, {
      attributes: true,
      attributeFilter: ["data-state"],
      subtree: true,
    });

    // Also observe the active element if it exists
    const activeElement = listRef.current.querySelector(
      `[data-state="active"]`
    ) as HTMLElement;
    if (activeElement) {
      resizeObserver.observe(activeElement);
    }

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [updateIndicator, activeTab]);

  const baseOrientation =
    orientation === "horizontal" ? "flex flex-row " : "flex flex-col ";

  const variantClasses: Record<TabVariant, string> = {
    subtle: cn(
      "bg-secondary text-muted-foreground  p-px gap-1 flex overflow-hidden",
      baseOrientation
    ),
    outline: cn(
      " bg-background ring ring-1 ring-border text-muted-foreground p-px gap-1 flex overflow-hidden",
      baseOrientation
    ),
    underline: cn(
      "bg-background text-muted-foreground p-px flex border-b border-accent gap-1 w-fit ",
      orientation === "vertical" && "flex-col border-b-0 border-r"
    ),
    ghost: cn(
      "bg-background text-muted-foreground  p-px gap-1 flex ",
      baseOrientation
    ),
    browser: cn(
      "bg-background text-muted-foreground gap-1  relative border-accent flex relative overflow-hidden",
      baseOrientation,
      orientation === "horizontal"
        ? "rounded-t-lg after:absolute after:bottom-px after:left-0 after:right-0 after:h-px after:w-full after:bg-border py-px"
        : "rounded-l-lg after:absolute after:top-0 after:bottom-0 after:right-px after:w-px after:h-full after:bg-border px-px"
    ),
  };

  const showIndicator = [
    "subtle",
    "outline",
    "ghost",
    "browser",
    "underline",
  ].includes(variant);

  const radiusClasses =
    variant === "subtle" || variant === "outline"
      ? size === "md"
        ? "rounded-xl"
        : "rounded-lg"
      : "";

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      className={cn(
        variantClasses[variant],
        "w-fit relative",
        radiusClasses,
        className
      )}
      style={{}}
      {...props}
    >
      {showIndicator && (
        <div
          className={cn(
            "absolute pointer-events-none transition-all duration-300 ease-out z-0",
            size === "md"
              ? variant === "browser"
                ? "rounded-none"
                : "rounded-xlg"
              : variant === "browser"
                ? "rounded-none"
                : "rounded-xmd",
            variant === "subtle" &&
              "bg-background text-card-foreground dark:bg-accent shadow-sm",
            variant === "outline" &&
              "bg-background dark:bg-accent  text-card-foreground shadow-sm",
            variant === "ghost" && "bg-background dark:bg-accent shadow-sm",
            variant === "browser" &&
              cn(
                "bg-background border",
                orientation === "horizontal"
                  ? size === "md"
                    ? "rounded-none rounded-t-xlg border-b-transparent"
                    : "rounded-none rounded-t-xmd border-b-transparent"
                  : size === "md"
                    ? "rounded-none rounded-l-xlg"
                    : "rounded-none rounded-l-xmd"
              ),
            variant === "underline" &&
              cn(
                "bg-foreground",
                orientation === "horizontal" ? "h-px" : "w-px"
              ),
            orientation === "horizontal"
              ? variant === "underline"
                ? "-bottom-px"
                : "h-full"
              : variant === "underline"
                ? "-right-px"
                : "w-full top-0"
          )}
          style={indicatorStyle}
        />
      )}
      {props.children}
    </TabsPrimitive.List>
  );
}

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const { variant, size, orientation, registerTab, unregisterTab } = context;
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (ref.current && props.value) {
      registerTab(props.value, ref.current);
    }
    return () => {
      if (props.value) {
        unregisterTab(props.value);
      }
    };
  }, [props.value, registerTab, unregisterTab]);

  const variantClasses: Record<TabVariant, string> = {
    subtle:
      " data-[state=active]:text-card-foreground transition-colors relative z-10",
    outline:
      " data-[state=active]:text-card-foreground transition-colors relative z-10",
    underline: cn(
      "data-[state=active]:text-foreground transition-colors relative z-10"
    ),
    ghost:
      "data-[state=active]:text-card-foreground transition-colors  relative z-10",
    browser: cn(
      "relative  data-[state=active]:text-card-foreground transition-colors z-10 after:transition-all after:duration-300 after:ease-out",
      orientation === "horizontal"
        ? " data-[state=active]:border-b-transparent after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px data-[state=active]:after:bg-background data-[state=active]:after:w-[96%] data-[state=active]:after:left-px"
        : " data-[state=active]:border-r-transparent after:absolute after:top-0 after:bottom-0 after:right-0 after:w-px data-[state=active]:after:bg-background data-[state=active]:after:h-[96%] data-[state=active]:after:top-px"
    ),
  };

  const sizeClasses: Record<TabSize, string> = {
    sm: "px-2 py-[5px]",
    md: "px-2.5 py-1.5",
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        "focus-visible:outline-none text-base  inline-flex tracking-4 font-normal leading-tight items-center justify-center gap-2 whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  const { size } = context;

  const sizeClasses: Record<TabSize, string> = {
    sm: "py-4 px-2",
    md: "py-6 px-2.5",
  };

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none text-left font-normal text-sm tracking-4 leading-tight",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
