"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { deleteDeviceSubscription } from "@/lib/api/resources";
import type { DeviceSubscription } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Removes a device row — smoke-test entries, the inert `fallback_device_id`
 * bucket rows, duplicates from before the unique index.
 *
 * Two warnings the operator genuinely needs, because neither is visible from
 * the row itself:
 *
 * A device that still has access is locked out of the app the moment its row
 * disappears — `check_device` returns nothing and the client reads that as
 * unverified, with no message shown. So `force` is sent only for those, and the
 * dialog says so plainly rather than burying it.
 *
 * And deleting restores trial eligibility: the trial is granted only when a row
 * is created, which is what makes it unfarmable — so removing the row means the
 * next registration is a first registration, worth another full trial.
 */
export function DeleteDeviceDialog({ device }: { device: DeviceSubscription }) {
  const t = useTranslations("dashboard.devices.delete");
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);

  const remove = useMutation({
    // force only when it is actually needed — the server refuses without it,
    // and sending it unconditionally would defeat the guard.
    mutationFn: () => deleteDeviceSubscription(device.id, device.is_active),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["device-subscriptions"] });
      toast.success(t("done"));
      setOpen(false);
    },
    onError: () => toast.error(t("failed")),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label={t("action")}>
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="font-medium">{device.full_name ?? "—"}</div>
            <div className="text-muted-foreground">{device.phone ?? "—"}</div>
            <div className="mt-1 font-mono text-[11px] text-muted-foreground/70">
              {device.app_name} · {device.device_id}
            </div>
          </div>

          {device.is_active ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {t("warnActive")}
            </p>
          ) : null}

          <p className="text-sm text-muted-foreground">{t("warnTrial")}</p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
          >
            {remove.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
