"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  createSubscription,
  fetchCompanies,
  fetchProducts,
} from "@/lib/api/resources";
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
import { pickText } from "../helpers";

export function CreateSubscriptionDialog() {
  const t = useTranslations("dashboard.subscriptions");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [company, setCompany] = React.useState("");
  const [productSlug, setProductSlug] = React.useState("");
  const [plan, setPlan] = React.useState("");
  const [identifierType, setIdentifierType] = React.useState("domain");
  const [identifierValue, setIdentifierValue] = React.useState("");

  const { data: companiesData } = useQuery({
    queryKey: ["companies"],
    queryFn: () => fetchCompanies(),
    enabled: open,
  });
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: open,
  });

  const companies = companiesData?.data ?? [];
  const products = productsData?.data ?? [];
  const selectedProduct = products.find((p) => p.slug === productSlug);

  function reset() {
    setCompany("");
    setProductSlug("");
    setPlan("");
    setIdentifierType("domain");
    setIdentifierValue("");
  }

  const mutation = useMutation({
    mutationFn: () =>
      createSubscription({
        company,
        plan,
        identifier_type: identifierType,
        identifier_value: identifierValue || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success(t("toast.created"));
      setOpen(false);
      reset();
    },
    onError: () => toast.error(t("toast.error")),
  });

  const canSubmit = company !== "" && plan !== "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t("new")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("create.title")}</DialogTitle>
        </DialogHeader>

        <form
          id="create-subscription"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>{t("client")}</Label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("create.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("product")}</Label>
              <Select
                value={productSlug}
                onValueChange={(v) => {
                  setProductSlug(v);
                  setPlan("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("create.selectProduct")} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>
                      {pickText(p.name, locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("plan")}</Label>
              <Select
                value={plan}
                onValueChange={setPlan}
                disabled={!selectedProduct}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("create.selectPlan")} />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct?.plans.map((pl) => (
                    <SelectItem key={pl.id} value={pl.id}>
                      {pickText(pl.name, locale)} — {pl.currency} {pl.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("create.identifierType")}</Label>
              <Select value={identifierType} onValueChange={setIdentifierType}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain">{t("create.domain")}</SelectItem>
                  <SelectItem value="device">{t("create.device")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-identifier">{t("create.identifierValue")}</Label>
              <Input
                id="s-identifier"
                dir="ltr"
                value={identifierValue}
                onChange={(e) => setIdentifierValue(e.target.value)}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="create-subscription"
            disabled={!canSubmit || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mutation.isPending ? t("create.creating") : t("create.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
