"use client";

import * as React from "react";
import { Loader2, Pencil, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createDevicePlan, updateDevicePlan } from "@/lib/api/resources";
import { ApiError, type DeviceCatalogPlan } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Creates or edits a plan. One component for both, because the only difference is
 * the plan key: it is set once at creation and never editable after.
 *
 * That is not a UI simplification — device rows store the key and a renewal
 * resolves its term by matching it, so re-keying a plan would turn every holder's
 * next renewal into a zero-month term. The API ignores the field on update; the
 * form does not offer it.
 */
export function PlanFormDialog({
  appId,
  plan,
}: {
  /** The scope to create in. Omit for the shared catalog. */
  appId?: string | null;
  /** Provided = edit that plan; omitted = create a new one. */
  plan?: DeviceCatalogPlan;
}) {
  const t = useTranslations("dashboard.plans.form");
  const queryClient = useQueryClient();

  const editing = plan !== undefined;
  const [open, setOpen] = React.useState(false);

  const [key, setKey] = React.useState(plan?.key ?? "");
  const [title, setTitle] = React.useState(plan?.title ?? "");
  const [description, setDescription] = React.useState(plan?.description ?? "");
  const [months, setMonths] = React.useState(String(plan?.duration_months ?? ""));
  const [price, setPrice] = React.useState(String(plan?.price ?? ""));
  const [discount, setDiscount] = React.useState(
    plan?.price_after_discount === null || plan?.price_after_discount === undefined
      ? ""
      : String(plan.price_after_discount),
  );
  const [enabled, setEnabled] = React.useState(plan?.enabled ?? true);
  const [recommended, setRecommended] = React.useState(plan?.recommended ?? false);

  const reset = () => {
    setKey(plan?.key ?? "");
    setTitle(plan?.title ?? "");
    setDescription(plan?.description ?? "");
    setMonths(String(plan?.duration_months ?? ""));
    setPrice(String(plan?.price ?? ""));
    setDiscount(
      plan?.price_after_discount === null || plan?.price_after_discount === undefined
        ? ""
        : String(plan.price_after_discount),
    );
    setEnabled(plan?.enabled ?? true);
    setRecommended(plan?.recommended ?? false);
  };

  const body = () => ({
    title,
    description: description || null,
    duration_months: Number(months),
    price: Number(price),
    price_after_discount: discount === "" ? null : Number(discount),
    enabled,
    recommended,
  });

  const mutation = useMutation({
    mutationFn: () =>
      editing
        ? updateDevicePlan(plan.id, body())
        : createDevicePlan({ ...body(), key, app: appId ?? null }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["device-plans"] });
      toast.success(editing ? t("saved") : t("created"));
      setOpen(false);
      if (!editing) reset();
    },
    // Surfaces the server's message rather than a generic failure: the useful
    // rejections here are specific (duplicate key, discount above price) and an
    // operator cannot act on "something went wrong".
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t("failed")),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Re-seed from the plan on close so a cancelled edit does not leave the
        // form showing abandoned values the next time it opens.
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {editing ? (
          <Button size="sm" variant="outline">
            <Pencil className="size-4" />
            {t("edit")}
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            {t("new")}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? t("editTitle") : t("newTitle")}</DialogTitle>
        </DialogHeader>

        <form
          id="plan-form"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="p-key">{t("key")}</Label>
            <Input
              id="p-key"
              dir="ltr"
              required
              disabled={editing}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="yearly"
            />
            <p className="text-xs text-muted-foreground">
              {editing ? t("keyLocked") : t("keyHint")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-title">{t("planTitle")}</Label>
            <Input
              id="p-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-description">{t("description")}</Label>
            <Textarea
              id="p-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="p-months">{t("months")}</Label>
              <Input
                id="p-months"
                type="number"
                dir="ltr"
                required
                min={1}
                max={120}
                value={months}
                onChange={(e) => setMonths(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-price">{t("price")}</Label>
              <Input
                id="p-price"
                type="number"
                dir="ltr"
                required
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-discount">{t("discount")}</Label>
              <Input
                id="p-discount"
                type="number"
                dir="ltr"
                min={0}
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              {t("enabled")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={recommended}
                onChange={(e) => setRecommended(e.target.checked)}
              />
              {t("recommended")}
            </label>
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="plan-form" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
