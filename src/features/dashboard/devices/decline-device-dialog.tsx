"use client";

import * as React from "react";
import { Loader2, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { declineDeviceSubscription } from "@/lib/api/resources";
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
 * Rejects a purchase intent.
 *
 * The counterpart to activating. Without it the only way to clear a request the
 * operator would never fulfil was to activate it — selling a plan to close a
 * ticket — so the pending queue filled with junk and stopped being a work list.
 *
 * Confirmed rather than one-click because the customer is waiting on the answer,
 * and the row leaves the queue either way.
 */
export function DeclineDeviceDialog({ device }: { device: DeviceSubscription }) {
  const t = useTranslations("dashboard.devices.decline");
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);

  const decline = useMutation({
    mutationFn: () => declineDeviceSubscription(device.id),
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
        <Button size="sm" variant="ghost">
          <X className="size-4" />
          {t("action")}
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
          </div>

          {/* Says plainly what this does not do — the common worry is that
              refusing a new request cancels the plan the device already has. */}
          <p className="text-sm text-muted-foreground">{t("explain")}</p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => decline.mutate()}
            disabled={decline.isPending}
          >
            {decline.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
