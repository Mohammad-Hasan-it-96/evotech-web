"use client";

import * as React from "react";
import { Loader2, Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createCompany } from "@/lib/api/resources";
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

export function CreateClientDialog() {
  const t = useTranslations("dashboard.clients");
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createCompany({
        name,
        email: email || null,
        phone: phone || null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success(t("toast.created"));
      setOpen(false);
      setName("");
      setEmail("");
      setPhone("");
    },
    onError: () => toast.error(t("toast.error")),
  });

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
          id="create-client"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="c-name">{t("create.name")}</Label>
            <Input
              id="c-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-email">{t("create.email")}</Label>
              <Input
                id="c-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-phone">{t("create.phone")}</Label>
              <Input
                id="c-phone"
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            form="create-client"
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            {mutation.isPending ? t("create.creating") : t("create.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
