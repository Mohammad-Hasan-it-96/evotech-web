"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth/auth-provider";
import { DashboardSidebar } from "@/features/dashboard/dashboard-sidebar";
import { DashboardTopbar } from "@/features/dashboard/dashboard-topbar";

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/dashboard/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-64 shrink-0 border-e border-border/60 lg:block">
        <div className="sticky top-0 h-dvh">
          <DashboardSidebar />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
