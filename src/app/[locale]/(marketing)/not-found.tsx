import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-32 text-center">
      <p className="text-7xl font-bold text-gradient-brand">404</p>
      <Button asChild size="lg">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
