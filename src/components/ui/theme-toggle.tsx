"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

/**
 * Light / dark / system options, for use inside an existing dropdown menu.
 *
 * `theme` is the user's raw choice ("system" included) so the tick stays on
 * System rather than jumping to whichever theme it resolved to. next-themes
 * only knows the choice after reading localStorage on the client, so the tick
 * is withheld until mounted — rendering it during SSR would mismatch on
 * hydration.
 */
export function ThemeMenuItems() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <>
      <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
        Appearance
      </DropdownMenuLabel>
      {OPTIONS.map(({ value, label, Icon }) => (
        <DropdownMenuItem
          key={value}
          onSelect={(e) => {
            // Keep the menu open so the change is visible before it closes.
            e.preventDefault();
            setTheme(value);
          }}
        >
          <Icon className="size-4" />
          <span className="flex-1">{label}</span>
          {mounted && theme === value && (
            <Check className="size-4 text-brand" />
          )}
        </DropdownMenuItem>
      ))}
    </>
  );
}
