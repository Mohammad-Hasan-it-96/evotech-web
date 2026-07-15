"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/lib/theme";

export function ThemeToggle() {
  const t = useTranslations("common");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("toggleTheme")}
      onClick={() => toggleTheme()}
    >
      {/* Icons toggle purely via the `.dark` class — no hydration flash, no effect. */}
      <Sun className="hidden size-5 dark:block" />
      <Moon className="block size-5 dark:hidden" />
    </Button>
  );
}
