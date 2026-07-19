"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { createRelease, fetchProducts } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pickText } from "../helpers";

const CHANNELS = ["stable", "beta", "alpha"] as const;

/**
 * Creates a release as a **draft**. It is not downloadable by anything until a
 * build is uploaded and it is published — which is the intended order: a release
 * with no artifact cannot be published at all.
 */
export function CreateReleaseDialog() {
  const t = useTranslations("dashboard.releases.create");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const [product, setProduct] = React.useState("");
  const [channel, setChannel] = React.useState<string>("stable");
  const [version, setVersion] = React.useState("");
  const [name, setName] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: open,
  });

  const products = data?.data ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      createRelease({
        product,
        channel,
        version,
        name: name || null,
        notes: notes || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["releases"] });
      toast.success(t("done"));
      setOpen(false);
      setVersion("");
      setName("");
      setNotes("");
    },
    // Surfaced verbatim: the useful rejection here is a duplicate
    // product+channel+version, which the operator can act on directly.
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t("failed")),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          {t("action")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <form
          id="create-release"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>{t("product")}</Label>
            <Select value={product} onValueChange={setProduct}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectProduct")} />
              </SelectTrigger>
              <SelectContent>
                {products.map((item) => (
                  <SelectItem key={item.slug} value={item.slug}>
                    {pickText(item.name, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="r-version">{t("version")}</Label>
              <Input
                id="r-version"
                dir="ltr"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("channel")}</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNELS.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="r-name">{t("name")}</Label>
            <Input
              id="r-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="r-notes">{t("notes")}</Label>
            <Textarea
              id="r-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="create-release"
            disabled={!product || !version || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {t("submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
