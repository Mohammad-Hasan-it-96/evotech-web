"use client";

import * as React from "react";
import { Link2, Link2Off, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { deleteDeviceStatement, fetchDeviceStatements } from "@/lib/api/resources";
import type { DeviceSubscription } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * A device's live shared statement links (evotech-core ADR 0013).
 *
 * For support: "is my link still up?", and taking one down when the customer it
 * describes asks — the shop can stop it from the app, but the debtor has no app.
 * Amounts and entries are deliberately not shown here; only the link holder sees
 * them. There is no "open" button either: the server keeps the token hashed and
 * cannot rebuild the URL.
 */
export function SharedLinksDialog({ device }: { device: DeviceSubscription }) {
  const t = useTranslations("dashboard.devices.statements");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const links = useQuery({
    queryKey: ["device-statements", device.id],
    queryFn: () => fetchDeviceStatements(device.id),
    enabled: open,
  });

  const stop = useMutation({
    mutationFn: (id: string) => deleteDeviceStatement(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["device-statements", device.id] });
      await queryClient.invalidateQueries({ queryKey: ["device-subscriptions"] });
      toast.success(t("stopped"));
    },
    onError: () => toast.error(t("failed")),
  });

  const date = (value: string | null) =>
    value ? new Date(value).toLocaleDateString(locale) : "—";
  const rows = links.data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
        >
          <Link2 className="size-3" />
          {t("count", { count: device.statements_count ?? 0 })}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { name: device.full_name ?? "—" })}</DialogTitle>
          <DialogDescription>{t("note")}</DialogDescription>
        </DialogHeader>

        {links.isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : links.isError ? (
          <p className="py-4 text-sm text-destructive">{t("loadFailed")}</p>
        ) : rows.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
            {rows.map((link) => (
              <li key={link.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0 text-sm">
                  <div className="font-medium">{link.customer_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {link.currency} · {t("entries", { count: link.entries_count })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("dates", { created: date(link.created_at), expires: date(link.expires_at) })}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => stop.mutate(link.id)}
                  disabled={stop.isPending}
                >
                  {stop.isPending && stop.variables === link.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Link2Off className="size-4" />
                  )}
                  {t("stop")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
