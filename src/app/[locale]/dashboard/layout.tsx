import { setRequestLocale } from "next-intl/server";
import { QueryProvider } from "@/lib/api/query-provider";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster position="top-center" />
      </AuthProvider>
    </QueryProvider>
  );
}
