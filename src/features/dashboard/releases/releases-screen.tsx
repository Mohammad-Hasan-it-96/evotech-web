"use client";

import * as React from "react";
import { Archive, Loader2, Rocket, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  archiveRelease,
  deleteRelease,
  fetchReleases,
  publishRelease,
  type ReleaseFilters,
} from "@/lib/api/resources";
import { ApiError, type Release } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateReleaseDialog } from "./create-release-dialog";
import { ReleaseArtifactsDialog } from "./release-artifacts-dialog";
import { pickText } from "../helpers";

/**
 * The Download Center console: versioned releases and their per-platform builds.
 *
 * The lifecycle is draft → published → archived, and only a **published** release
 * is reachable — by a product self-updating, or through the permanent public
 * download URL. That is why publishing is a separate, deliberate action rather
 * than a side effect of uploading.
 */
export function ReleasesScreen() {
  const t = useTranslations("dashboard.releases");

  const [status, setStatus] = React.useState<string>("");

  const filters: ReleaseFilters = status ? { status } : {};

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["releases", filters],
    queryFn: () => fetchReleases(filters),
  });

  const releases = data?.data ?? [];
  const total = data?.meta?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        {isFetching ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-border/60 p-1">
          {(["", "draft", "published", "archived"] as const).map((value) => (
            <Button
              key={value || "all"}
              variant={status === value ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatus(value)}
            >
              {t(`filters.${value || "all"}`)}
            </Button>
          ))}
        </div>

        <div className="ms-auto">
          <CreateReleaseDialog />
        </div>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : releases.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("release")}</TableHead>
                  <TableHead>{t("product")}</TableHead>
                  <TableHead>{t("statusLabel")}</TableHead>
                  <TableHead>{t("published")}</TableHead>
                  <TableHead className="text-end">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {releases.map((release) => (
                  <ReleaseRow key={release.id} release={release} />
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground">{t("count", { total })}</p>
        </>
      )}
    </div>
  );
}

function ReleaseRow({ release }: { release: Release }) {
  const t = useTranslations("dashboard.releases");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["releases"] });

  const publish = useMutation({
    mutationFn: () => publishRelease(release.id),
    onSuccess: async () => {
      await invalidate();
      toast.success(t("toast.published"));
    },
    // Verbatim: the refusal here is "no artifacts yet", which tells the operator
    // exactly what to do next.
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t("toast.error")),
  });

  const archive = useMutation({
    mutationFn: () => archiveRelease(release.id),
    onSuccess: async () => {
      await invalidate();
      toast.success(t("toast.archived"));
    },
    onError: () => toast.error(t("toast.error")),
  });

  const remove = useMutation({
    mutationFn: () => deleteRelease(release.id),
    onSuccess: async () => {
      await invalidate();
      toast.success(t("toast.deleted"));
    },
    onError: () => toast.error(t("toast.error")),
  });

  const busy = publish.isPending || archive.isPending || remove.isPending;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">
          {release.version}
          <span className="ms-2 text-xs text-muted-foreground">{release.channel}</span>
        </div>
        {release.name ? (
          <div className="text-xs text-muted-foreground">{release.name}</div>
        ) : null}
      </TableCell>

      <TableCell>{pickText(release.product.name, locale)}</TableCell>

      <TableCell>
        <StatusBadge status={release.status} />
      </TableCell>

      <TableCell>
        {release.published_at ? (
          new Date(release.published_at).toLocaleDateString(locale)
        ) : (
          <span className="text-muted-foreground">{t("notPublished")}</span>
        )}
      </TableCell>

      <TableCell className="text-end">
        <div className="flex items-center justify-end gap-1">
          <ReleaseArtifactsDialog release={release} />

          {/* Publishing is only meaningful for a draft; an archived release is
              deliberately a terminal state here. */}
          {release.status === "draft" ? (
            <Button
              size="sm"
              onClick={() => publish.mutate()}
              disabled={busy}
            >
              <Rocket className="size-4" />
              {t("publish")}
            </Button>
          ) : null}

          {release.status === "published" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => archive.mutate()}
              disabled={busy}
              aria-label={t("archive")}
            >
              <Archive className="size-4" />
            </Button>
          ) : null}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => remove.mutate()}
            disabled={busy}
            aria-label={t("delete")}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("dashboard.releases.status");

  if (status === "published") {
    return <Badge variant="outline">{t("published")}</Badge>;
  }
  if (status === "archived") {
    return <Badge variant="destructive">{t("archived")}</Badge>;
  }

  return <Badge variant="secondary">{t("draft")}</Badge>;
}
