"use client";

import { useParams } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const labels: Record<string, string> = {
  ar: "العربية",
  en: "English",
};

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  function switchTo(locale: string) {
    startTransition(() => {
      // Preserve the current path & route params while swapping the locale.
      router.replace(
        // @ts-expect-error -- pathname params are passed through untyped here.
        { pathname, params },
        { locale },
      );
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("language")}
          disabled={isPending}
        >
          <Languages className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            disabled={locale === params.locale}
            onClick={() => switchTo(locale)}
          >
            {labels[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
