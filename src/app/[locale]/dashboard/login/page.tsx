import { getTranslations, setRequestLocale } from "next-intl/server";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/features/dashboard/login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard.login");

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute start-1/2 top-0 size-[500px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
