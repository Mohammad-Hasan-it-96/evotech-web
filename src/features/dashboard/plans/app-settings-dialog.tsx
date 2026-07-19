"use client";

import * as React from "react";
import { Loader2, Settings2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateDeviceApp } from "@/lib/api/resources";
import { ApiError, type DeviceApp } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * An app's selling terms: display label, trial length, and which catalog it sells.
 *
 * `name` and `slug` are shown read-only. Both are immutable server-side: `name` is
 * the literal string shipped builds send and every device row is matched on it, and
 * `slug` is the base URL those builds are pointed at. Changing either from a
 * browser would orphan an app's subscribers with no way back from this screen.
 */
export function AppSettingsDialog({ app }: { app: DeviceApp }) {
  const t = useTranslations("dashboard.plans.app");
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [label, setLabel] = React.useState(app.label);
  const [trialDays, setTrialDays] = React.useState(String(app.trial_days));
  const [usesShared, setUsesShared] = React.useState(app.uses_shared_plans);

  const reset = () => {
    setLabel(app.label);
    setTrialDays(String(app.trial_days));
    setUsesShared(app.uses_shared_plans);
  };

  const mutation = useMutation({
    mutationFn: () =>
      updateDeviceApp(app.id, {
        label,
        trial_days: Number(trialDays),
        uses_shared_plans: usesShared,
      }),
    onSuccess: async () => {
      // Both queries: the plan list shown depends on which catalog the app sells.
      await queryClient.invalidateQueries({ queryKey: ["device-apps"] });
      await queryClient.invalidateQueries({ queryKey: ["device-plans"] });
      toast.success(t("saved"));
      setOpen(false);
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t("failed")),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="size-4" />
          {t("action")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title", { app: app.label })}</DialogTitle>
        </DialogHeader>

        <form
          id="app-settings"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="rounded-lg bg-muted/50 p-3 font-mono text-[11px] text-muted-foreground">
            app_name: {app.name} · /api/{app.slug}
          </div>

          <div className="space-y-2">
            <Label htmlFor="a-label">{t("label")}</Label>
            <Input
              id="a-label"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("labelHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="a-trial">{t("trialDays")}</Label>
            <Input
              id="a-trial"
              type="number"
              dir="ltr"
              required
              min={0}
              max={365}
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("trialHint")}</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={usesShared}
                onChange={(e) => setUsesShared(e.target.checked)}
              />
              {t("usesShared")}
            </label>
            <p className="text-xs text-muted-foreground">{t("usesSharedHint")}</p>
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="app-settings" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
