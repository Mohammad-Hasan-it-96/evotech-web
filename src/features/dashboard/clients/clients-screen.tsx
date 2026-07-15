"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { deleteCompany, fetchCompanies } from "@/lib/api/resources";
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
import { CreateClientDialog } from "./create-client-dialog";
import { statusVariant } from "../helpers";

export function ClientsScreen() {
  const t = useTranslations("dashboard.clients");
  const tStatus = useTranslations("dashboard.status");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => fetchCompanies(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteCompany(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success(t("toast.deleted"));
    },
    onError: () => toast.error(t("toast.error")),
  });

  const companies = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <CreateClientDialog />
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : companies.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("phone")}</TableHead>
                <TableHead>{t("statusLabel")}</TableHead>
                <TableHead className="text-end">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell dir="ltr" className="text-muted-foreground">
                    {company.email ?? "—"}
                  </TableCell>
                  <TableCell dir="ltr" className="text-muted-foreground">
                    {company.phone ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(company.status)}>
                      {tStatus(company.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("delete")}
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(company.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
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
