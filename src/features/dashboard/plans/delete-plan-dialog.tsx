"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { deleteDevicePlan } from "@/lib/api/resources";
import { ApiError, type DeviceCatalogPlan } from "@/lib/api/types";
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
 * Deletes a plan nobody holds.
 *
 * There is deliberately no force option, unlike deleting a device. Forcing a
 * device delete has a visible consequence the operator is warned about; deleting a
 * held plan is silent and deferred — nothing breaks today, and then a renewal weeks
 * later grants a zero-month term to someone who has just paid. The server refuses
 * it and the message points at disabling instead, which is what retiring a price
 * actually means.
 */
export function DeletePlanDialog({ plan }: { plan: DeviceCatalogPlan }) {
  const t = useTranslations("dashboard.plans.delete");
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const mutation = useMutation({
    mutationFn: () => deleteDevicePlan(plan.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["device-plans"] });
      toast.success(t("done"));
      setOpen(false);
    },
    // The refusal explains itself and names the alternative, so it is shown
    // verbatim rather than replaced with a generic failure.
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t("failed")),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" aria-label={t("action")}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="font-medium">{plan.title}</div>
            <div className="text-muted-foreground">
              {plan.duration_months} · {plan.price_after_discount ?? plan.price}
            </div>
            <div className="mt-1 font-mono text-[11px] text-muted-foreground/70">
              {plan.key}
            </div>
          </div>

          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {t("warn")}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
