"use client";

import * as React from "react";
import { Check, Copy, Loader2, Package, Trash2, Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  deleteArtifact,
  fetchRelease,
  publicDownloadUrl,
  uploadArtifact,
} from "@/lib/api/resources";
import { ApiError, type Release, type ReleaseArtifact } from "@/lib/api/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PLATFORMS = [
  "android",
  "ios",
  "windows",
  "macos",
  "linux",
  "web",
  "any",
] as const;

/** Bytes → a size an operator can sanity-check an upload against. */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/**
 * Uploads and manages a release's per-platform builds.
 *
 * Also the only place the permanent download URL is shown. That URL is the point
 * of the whole feature: it names the current build for a platform rather than a
 * file, so it can be pasted into a message or a cached config and still work after
 * the next release.
 */
export function ReleaseArtifactsDialog({ release }: { release: Release }) {
  const t = useTranslations("dashboard.releases.artifacts");
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [platform, setPlatform] = React.useState<string>("android");
  const [file, setFile] = React.useState<File | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  // Fetched fresh rather than read off the list row: the list carries only a
  // count, and this is where uploads land.
  const { data, isLoading } = useQuery({
    queryKey: ["release", release.id],
    queryFn: () => fetchRelease(release.id),
    enabled: open,
  });

  const artifacts = data?.data.artifacts ?? [];

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["release", release.id] });
    await queryClient.invalidateQueries({ queryKey: ["releases"] });
  };

  const upload = useMutation({
    mutationFn: () => uploadArtifact(release.id, file as File, platform),
    onSuccess: async () => {
      await invalidate();
      toast.success(t("uploaded"));
      setFile(null);
      // The input holds its own value; clearing state alone would leave the
      // filename on screen after a successful upload.
      if (fileInput.current) fileInput.current.value = "";
    },
    // Verbatim: the rejections are specific — a disallowed extension names the
    // allowed list, and an oversized file names the limit.
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t("uploadFailed")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteArtifact(id),
    onSuccess: async () => {
      await invalidate();
      toast.success(t("deleted"));
    },
    onError: () => toast.error(t("deleteFailed")),
  });

  const copy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Package className="size-4" />
          {t("action", { count: release.artifacts_count ?? 0 })}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("title", { version: release.version })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : artifacts.length === 0 ? (
            <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              {t("empty")}
            </p>
          ) : (
            <div className="space-y-2">
              {artifacts.map((artifact) => (
                <ArtifactRow
                  key={artifact.id}
                  artifact={artifact}
                  productSlug={release.product.slug}
                  published={release.status === "published"}
                  copied={copied === artifact.id}
                  onCopy={(url) => copy(url, artifact.id)}
                  onDelete={() => remove.mutate(artifact.id)}
                  deleting={remove.isPending}
                />
              ))}
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-border/60 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("platform")}</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="a-file">{t("file")}</Label>
                <Input
                  id="a-file"
                  type="file"
                  ref={fileInput}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{t("replaceHint")}</p>

            <Button
              size="sm"
              onClick={() => upload.mutate()}
              disabled={file === null || upload.isPending}
            >
              {upload.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {t("upload")}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ArtifactRow({
  artifact,
  productSlug,
  published,
  copied,
  onCopy,
  onDelete,
  deleting,
}: {
  artifact: ReleaseArtifact;
  productSlug: string;
  published: boolean;
  copied: boolean;
  onCopy: (url: string) => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const t = useTranslations("dashboard.releases.artifacts");
  const url = publicDownloadUrl(productSlug, artifact.platform);

  return (
    <div className="rounded-lg bg-muted/50 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium">
            {artifact.platform} · {artifact.filename}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatSize(artifact.size)} · {t("downloadCount", { count: artifact.download_count })}
          </div>
          {/* The checksum is the only way to confirm the uploaded file is the
              one that was built. Truncated: the full value is not readable at
              a glance and the prefix is enough to compare against. */}
          <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground/70">
            sha256 {artifact.checksum_sha256.slice(0, 16)}…
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          aria-label={t("delete")}
          onClick={onDelete}
          disabled={deleting}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-background px-2 py-1 text-[11px]" dir="ltr">
          {url}
        </code>
        <Button size="icon" variant="ghost" aria-label={t("copy")} onClick={() => onCopy(url)}>
          {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
        </Button>
      </div>

      {/* The URL is shown before publishing so it can be prepared, but it 404s
          until then — worth saying rather than letting someone paste a dead link
          into a customer's chat. */}
      {published ? null : (
        <p className="mt-1 text-xs text-destructive">{t("notLiveYet")}</p>
      )}
    </div>
  );
}
