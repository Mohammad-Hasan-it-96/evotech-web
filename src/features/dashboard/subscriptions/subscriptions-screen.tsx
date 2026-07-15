"use client";

import { Loader2, MoreHorizontal, RefreshCw, Trash2, XCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  cancelSubscription,
  deleteSubscription,
  fetchSubscriptions,
  renewSubscription,
} from "@/lib/api/resources";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateSubscriptionDialog } from "./create-subscription-dialog";
import { pickText, statusVariant } from "../helpers";

export function SubscriptionsScreen() {
  const t = useTranslations("dashboard.subscriptions");
  const tStatus = useTranslations("dashboard.status");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => fetchSubscriptions(),
  });

  const onSettled = (message: string) => ({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success(message);
    },
    onError: () => toast.error(t("toast.error")),
  });

  const renew = useMutation({
    mutationFn: (id: string) => renewSubscription(id),
    ...onSettled(t("toast.renewed")),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => cancelSubscription(id),
    ...onSettled(t("toast.cancelled")),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteSubscription(id),
    ...onSettled(t("toast.deleted")),
  });
  const busy = renew.isPending || cancel.isPending || remove.isPending;

  const subscriptions = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <CreateSubscriptionDialog />
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : subscriptions.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("client")}</TableHead>
                <TableHead>{t("product")}</TableHead>
                <TableHead>{t("statusLabel")}</TableHead>
                <TableHead>{t("identifier")}</TableHead>
                <TableHead>{t("ends")}</TableHead>
                <TableHead className="text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    {sub.company.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{pickText(sub.plan.product.name, locale)}</span>
                      <span className="text-xs text-muted-foreground">
                        {pickText(sub.plan.name, locale)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(sub.status)}>
                      {tStatus(sub.status)}
                    </Badge>
                  </TableCell>
                  <TableCell dir="ltr" className="text-muted-foreground">
                    {sub.identifier?.value ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {sub.ends_at === null ? (
                      <span className="text-muted-foreground">{t("noEnd")}</span>
                    ) : (
                      <div className="flex flex-col">
                        <span>
                          {new Date(sub.ends_at).toLocaleDateString(locale)}
                        </span>
                        {sub.days_remaining !== null &&
                          sub.days_remaining >= 0 && (
                            <span className="text-xs text-muted-foreground">
                              {t("daysLeft", { days: sub.days_remaining })}
                            </span>
                          )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={busy}
                          aria-label={t("actions")}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => renew.mutate(sub.id)}>
                          <RefreshCw className="size-4" />
                          {t("renew")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => cancel.mutate(sub.id)}>
                          <XCircle className="size-4" />
                          {t("cancelSub")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => remove.mutate(sub.id)}
                        >
                          <Trash2 className="size-4" />
                          {t("delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
