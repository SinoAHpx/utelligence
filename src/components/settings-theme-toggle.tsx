"use client";

import * as React from "react";

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

import { useHasMounted } from "@/lib/utils";
import { Button } from "./ui/button";
import { Label } from "@/components/ui/label";

export default function SettingsThemeToggle() {
  const hasMounted = useHasMounted();
  const { setTheme, theme } = useTheme();

  if (!hasMounted) {
    return null;
  }

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <div className="flex items-center justify-between px-2">
      <Label htmlFor="theme-toggle">外观</Label>
      <Button
        id="theme-toggle"
        className="gap-2"
        size="icon"
        variant="ghost"
        onClick={() => setTheme(nextTheme)}
      >
        {theme === "light" ? (
          <MoonIcon className="w-4 h-4" />
        ) : (
          <SunIcon className="w-4 h-4" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
