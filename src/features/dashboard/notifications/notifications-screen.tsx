"use client";

import * as React from "react";
import { Loader2, Search, Send, TriangleAlert } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  broadcastNotification,
  fetchDeviceApps,
  fetchDeviceNotifications,
  fetchDeviceSubscriptions,
  sendTestNotification,
} from "@/lib/api/resources";
import { ApiError } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * Custom notifications console — offers, updates, announcements.
 *
 * The flow is deliberately two-step: compose a message, send a **test** to your
 * own phone (picked from the device list), see it land, then **broadcast** to an
 * app's audience. Everything sent is listed below as a history.
 */
export function NotificationsScreen() {
  const t = useTranslations("dashboard.notifications");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");

  // Broadcast target.
  const [app, setApp] = React.useState("");
  const [activeOnly, setActiveOnly] = React.useState(false);

  // Test target — searched from the device list and picked.
  const [deviceSearch, setDeviceSearch] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [picked, setPicked] = React.useState<{ id: string; label: string } | null>(
    null,
  );

  const composed = title.trim().length > 0 && body.trim().length > 0;

  const invalidateHistory = () =>
    queryClient.invalidateQueries({ queryKey: ["device-notifications"] });

  const { data: appsData } = useQuery({
    queryKey: ["device-apps"],
    queryFn: fetchDeviceApps,
  });
  const apps = appsData?.data ?? [];

  const { data: historyData, isFetching } = useQuery({
    queryKey: ["device-notifications"],
    queryFn: () => fetchDeviceNotifications(),
  });
  const history = historyData?.data ?? [];

  const { data: deviceData, isFetching: searching } = useQuery({
    queryKey: ["device-subscriptions", { q: query }],
    queryFn: () => fetchDeviceSubscriptions({ q: query }),
    enabled: query.length >= 2,
  });
  const devices = deviceData?.data ?? [];

  const test = useMutation({
    mutationFn: () =>
      sendTestNotification({ device: picked!.id, title, body }),
    onSuccess: async () => {
      await invalidateHistory();
      toast.success(t("toast.testSent", { device: picked?.label ?? "" }));
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t("toast.error")),
  });

  const broadcast = useMutation({
    mutationFn: () =>
      broadcastNotification({ app, title, body, active_only: activeOnly }),
    onSuccess: async (res) => {
      await invalidateHistory();
      toast.success(t("toast.broadcastSent", { count: res.data.recipients }));
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t("toast.error")),
  });

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setQuery(deviceSearch.trim());
  };

  const confirmBroadcast = () => {
    const appLabel = apps.find((a) => a.name === app)?.label ?? app;
    if (window.confirm(t("confirmBroadcast", { app: appLabel }))) {
      broadcast.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        {isFetching ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <p className="text-sm text-muted-foreground">{t("intro")}</p>

      {/* Compose — shared by the test and the broadcast below. */}
      <div className="space-y-4 rounded-xl border border-border/60 p-4">
        <div className="space-y-2">
          <Label htmlFor="notif-title">{t("messageTitle")}</Label>
          <Input
            id="notif-title"
            value={title}
            maxLength={150}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("messageTitlePlaceholder")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notif-body">{t("messageBody")}</Label>
          <Textarea
            id="notif-body"
            value={body}
            maxLength={1000}
            rows={3}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("messageBodyPlaceholder")}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Step 1 — test on one device. */}
        <div className="space-y-3 rounded-xl border border-border/60 p-4">
          <div>
            <h3 className="font-semibold">{t("test.heading")}</h3>
            <p className="text-xs text-muted-foreground">{t("test.hint")}</p>
          </div>

          <form onSubmit={onSearch} className="flex gap-2">
            <Input
              value={deviceSearch}
              onChange={(e) => setDeviceSearch(e.target.value)}
              placeholder={t("test.searchPlaceholder")}
            />
            <Button type="submit" variant="outline" size="icon" aria-label={t("test.search")}>
              {searching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </form>

          {query.length >= 2 && devices.length > 0 ? (
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border/60 p-1">
              {devices.map((d) => {
                const label = `${d.full_name ?? "—"} · ${d.phone ?? d.device_id ?? ""}`;
                const isPicked = picked?.id === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setPicked({ id: d.id, label })}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-start text-sm ${
                      isPicked
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    <span className="ms-2 shrink-0 text-xs text-muted-foreground">
                      {d.app_name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : query.length >= 2 && !searching ? (
            <p className="text-xs text-muted-foreground">{t("test.noResults")}</p>
          ) : null}

          {picked ? (
            <p className="text-xs">
              {t("test.selected")}{" "}
              <span className="font-medium">{picked.label}</span>
            </p>
          ) : null}

          <Button
            className="w-full"
            disabled={!composed || !picked || test.isPending}
            onClick={() => test.mutate()}
          >
            {test.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {t("test.send")}
          </Button>
        </div>

        {/* Step 2 — broadcast to everyone. */}
        <div className="space-y-3 rounded-xl border border-border/60 p-4">
          <div>
            <h3 className="font-semibold">{t("broadcast.heading")}</h3>
            <p className="text-xs text-muted-foreground">{t("broadcast.hint")}</p>
          </div>

          <div className="space-y-2">
            <Label>{t("broadcast.app")}</Label>
            <Select value={app} onValueChange={setApp}>
              <SelectTrigger>
                <SelectValue placeholder={t("broadcast.appPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {apps.map((a) => (
                  <SelectItem key={a.id} value={a.name}>
                    {a.label} ({a.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="size-4 rounded border-border"
            />
            {t("broadcast.activeOnly")}
          </label>

          <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-xs text-amber-900 dark:text-amber-200">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
            <span>{t("broadcast.warning")}</span>
          </div>

          <Button
            className="w-full"
            variant="default"
            disabled={!composed || !app || broadcast.isPending}
            onClick={confirmBroadcast}
          >
            {broadcast.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {t("broadcast.send")}
          </Button>
        </div>
      </div>

      {/* History. */}
      <div>
        <h3 className="mb-3 font-semibold">{t("history.heading")}</h3>
        {history.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("history.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("history.scope")}</TableHead>
                  <TableHead>{t("history.app")}</TableHead>
                  <TableHead>{t("history.message")}</TableHead>
                  <TableHead className="text-end">{t("history.recipients")}</TableHead>
                  <TableHead>{t("history.sentBy")}</TableHead>
                  <TableHead>{t("history.sentAt")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      <Badge variant={n.scope === "broadcast" ? "default" : "secondary"}>
                        {t(`history.scopes.${n.scope}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{n.app_name}</TableCell>
                    <TableCell>
                      <div className="font-medium">{n.title}</div>
                      <div className="max-w-xs truncate text-xs text-muted-foreground">
                        {n.body}
                      </div>
                    </TableCell>
                    <TableCell className="text-end">{n.recipients}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {n.sent_by_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString(locale)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
