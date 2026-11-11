"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@repo/design_system/components/ui/button";
import { useLayoutSettings } from "@repo/design_system/layout/layoutSettings";

/** Light/dark switch on the settings the dashboards share, so the choice follows the user to them. */
export function ModeToggle() {
  const { settings, setSettings } = useLayoutSettings();
  const dark = settings.mode === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Mudar para o modo claro" : "Mudar para o modo escuro"}
      onClick={() => setSettings({ ...settings, mode: dark ? "light" : "dark" })}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
