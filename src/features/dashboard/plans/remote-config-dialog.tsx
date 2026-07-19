"use client";

import * as React from "react";
import { Loader2, Smartphone } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateDeviceApp } from "@/lib/api/resources";
import { ApiError, type DeviceApp } from "@/lib/api/types";
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
 * What the app fetches at startup: current version, download links, what's new,
 * and how to reach support. Served at `/config/<slug>.json`.
 *
 * Kept separate from the app's selling terms because the failure modes are
 * different in kind. A wrong trial length is visible and reversible; a wrong value
 * here is applied *silently* — the apps' parsers degrade to a default rather than
 * throwing, so a mistake shows up as an update prompt that never fires, not as an
 * error anyone sees.
 */

/**
 * The only ABI keys either app looks up. Fawateer matches the device's reported
 * ABIs exactly; SmartAgent normalises everything to these two and falls back to
 * `default`, which is the only way an x86 device reaches an APK at all.
 *
 * Fixed inputs rather than free-form key/value pairs on purpose: a typo'd key is
 * not a validation nicety, it is an update no device can ever find.
 */
const DOWNLOAD_KEYS = ["arm64-v8a", "armeabi-v7a", "default"] as const;

export function RemoteConfigDialog({ app }: { app: DeviceApp }) {
  const t = useTranslations("dashboard.plans.config");
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);

  const [version, setVersion] = React.useState(app.latest_version ?? "");
  const [baseUrl, setBaseUrl] = React.useState(app.api_base_url ?? "");
  const [downloads, setDownloads] = React.useState<Record<string, string>>(
    () => ({ ...app.downloads }),
  );
  // One note per line: the apps render these as bullets, and a textarea is a
  // better fit for that than a repeating field group.
  const [notes, setNotes] = React.useState((app.update_notes ?? []).join("\n"));
  const [email, setEmail] = React.useState(app.support_email ?? "");
  const [whatsapp, setWhatsapp] = React.useState(app.support_whatsapp ?? "");
  const [telegram, setTelegram] = React.useState(app.support_telegram ?? "");

  const reset = () => {
    setVersion(app.latest_version ?? "");
    setBaseUrl(app.api_base_url ?? "");
    setDownloads({ ...app.downloads });
    setNotes((app.update_notes ?? []).join("\n"));
    setEmail(app.support_email ?? "");
    setWhatsapp(app.support_whatsapp ?? "");
    setTelegram(app.support_telegram ?? "");
  };

  const mutation = useMutation({
    mutationFn: () =>
      updateDeviceApp(app.id, {
        latest_version: version.trim() || null,
        api_base_url: baseUrl.trim() || null,
        // Blank inputs are dropped rather than sent as "": an empty URL is not a
        // download, and the server would reject it as not-a-URL anyway.
        downloads: Object.fromEntries(
          Object.entries(downloads).filter(([, url]) => url.trim() !== ""),
        ),
        update_notes: notes
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== ""),
        support_email: email.trim() || null,
        support_whatsapp: whatsapp.trim() || null,
        support_telegram: telegram.trim() || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["device-apps"] });
      toast.success(t("saved"));
      setOpen(false);
    },
    // Shown verbatim: the rejections here are specific and actionable — a version
    // with a suffix the apps would read as 0, or an ABI key nothing looks up.
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
          <Smartphone className="size-4" />
          {t("action")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title", { app: app.label })}</DialogTitle>
        </DialogHeader>

        <form
          id="remote-config"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="rounded-lg bg-muted/50 p-3 font-mono text-[11px] text-muted-foreground">
            /config/{app.slug}.json
          </div>

          <div className="space-y-2">
            <Label htmlFor="rc-version">{t("version")}</Label>
            <Input
              id="rc-version"
              dir="ltr"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0.0"
            />
            <p className="text-xs text-muted-foreground">{t("versionHint")}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("downloads")}</Label>
            {DOWNLOAD_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-28 shrink-0 font-mono text-[11px] text-muted-foreground">
                  {key}
                </span>
                <Input
                  dir="ltr"
                  value={downloads[key] ?? ""}
                  onChange={(e) =>
                    setDownloads((current) => ({
                      ...current,
                      [key]: e.target.value,
                    }))
                  }
                  placeholder="https://…apk"
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">{t("downloadsHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rc-notes">{t("notes")}</Label>
            <Textarea
              id="rc-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t("notesHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rc-email">{t("supportEmail")}</Label>
            <Input
              id="rc-email"
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rc-whatsapp">{t("supportWhatsapp")}</Label>
              <Input
                id="rc-whatsapp"
                dir="ltr"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="963…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rc-telegram">{t("supportTelegram")}</Label>
              <Input
                id="rc-telegram"
                dir="ltr"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rc-base-url">{t("baseUrl")}</Label>
            <Input
              id="rc-base-url"
              dir="ltr"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder={`https://api.evotech-sys.com/api/${app.slug}`}
            />
            {/* Last, and warned about: this is the one field that can point every
                device at the wrong backend, and the app applies it silently. */}
            <p className="text-xs text-destructive">{t("baseUrlHint")}</p>
          </div>
        </form>

        <DialogFooter>
          <Button type="submit" form="remote-config" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
