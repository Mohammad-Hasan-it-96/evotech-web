"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { dashboardNav } from "./nav";
import { cn } from "@/lib/utils";

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("dashboard.nav");
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="px-2 py-3">
        <Logo />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {dashboardNav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="size-4.5" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
