"use client";

import * as React from "react";
import { Loader2, Rocket } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { publishRelease } from "@/lib/api/resources";
import { ApiError, type Release } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Publish confirmation with the "also announce this version" opt-in.
 *
 * Publishing a build (which the download links track automatically) and telling
 * the app that *this* is the version to update to are separate acts server-side;
 * the checkbox ties them together for one publish, defaulted on because that is
 * almost always what the operator means.
 */
export function PublishReleaseDialog({
  release,
  disabled,
}: {
  release: Release;
  disabled?: boolean;
}) {
  const t = useTranslations("dashboard.releases");
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [syncVersion, setSyncVersion] = React.useState(true);

  const publish = useMutation({
    mutationFn: () => publishRelease(release.id, syncVersion),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["releases"] });
      toast.success(t("toast.published"));
      setOpen(false);
    },
    // Verbatim: the refusal here is "no artifacts yet", which tells the operator
    // exactly what to do next.
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t("toast.error")),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={disabled}>
          <Rocket className="size-4" />
          {t("publish")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("publishDialog.title", { version: release.version })}
          </DialogTitle>
          <DialogDescription>{t("publishDialog.description")}</DialogDescription>
        </DialogHeader>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={syncVersion}
            onChange={(e) => setSyncVersion(e.target.checked)}
            className="mt-0.5 size-4 rounded border-border"
          />
          <span>
            {t("publishDialog.syncVersion", { version: release.version })}
            <span className="mt-1 block text-xs text-muted-foreground">
              {t("publishDialog.syncHint")}
            </span>
          </span>
        </label>

        <DialogFooter>
          <Button onClick={() => publish.mutate()} disabled={publish.isPending}>
            {publish.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Rocket className="size-4" />
            )}
            {t("publish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
