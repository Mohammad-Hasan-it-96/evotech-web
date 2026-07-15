import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto max-w-2xl space-y-3",
        align === "center" ? "text-center" : "text-start mx-0",
        className,
      )}
    >
      <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base text-muted-foreground text-pretty sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
