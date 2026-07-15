import { Icon } from "@/components/icon";
import { Card, CardContent } from "@/components/ui/card";
import { localized } from "@/content/types";
import type { Service } from "@/content/types";
import type { Locale } from "@/i18n/routing";

export function ServiceCard({
  service,
  locale,
}: {
  service: Service;
  locale: Locale;
}) {
  return (
    <Card className="group h-full border-border/60 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="space-y-3">
        <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon name={service.icon} className="size-6" />
        </div>
        <h3 className="text-lg font-semibold">
          {localized(service.title, locale)}
        </h3>
        <p className="text-sm text-muted-foreground">
          {localized(service.description, locale)}
        </p>
      </CardContent>
    </Card>
  );
}
