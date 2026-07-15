"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const t = useTranslations("contactPage.form");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent">(
    "idle",
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Phase 2: POST to the platform API. For now, simulate a successful submit.
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 700);
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-10 text-center">
        <CheckCircle2 className="size-12 text-primary" />
        <p className="text-lg font-medium">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" required placeholder={t("namePlaceholder")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            required
            placeholder={t("phonePlaceholder")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          placeholder={t("emailPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder={t("messagePlaceholder")}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={status === "sending"}
      >
        {status === "sending" && <Loader2 className="size-4 animate-spin" />}
        {t("submit")}
      </Button>
    </form>
  );
}
