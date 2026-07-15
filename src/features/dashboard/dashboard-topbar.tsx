"use client";

import * as React from "react";
import { LogOut, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { dashboardNav } from "./nav";
import { DashboardSidebar } from "./dashboard-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardTopbar() {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const active = [...dashboardNav]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href),
    );
  const title = active ? t(`nav.${active.key}`) : t("brand");

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function onLogout() {
    await logout();
    router.replace("/dashboard/login");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={title}>
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="start" className="w-72 p-0">
            <SheetTitle className="sr-only">{t("brand")}</SheetTitle>
            <DashboardSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <ThemeToggle />
        <LocaleSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 px-2"
              aria-label={user?.name ?? ""}
            >
              <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-2 text-xs font-semibold text-white">
                {initials}
              </span>
              <span className="hidden text-sm font-medium sm:inline">
                {user?.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="size-4" />
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
