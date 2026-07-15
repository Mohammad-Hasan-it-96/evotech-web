import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 font-bold tracking-tight",
        className,
      )}
      aria-label="EVOTECH"
    >
      <span
        className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 text-white shadow-sm shadow-primary/30 transition-transform group-hover:scale-105"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
        </svg>
      </span>
      {withText && (
        <span className="text-lg">
          EVO<span className="text-primary">TECH</span>
        </span>
      )}
    </Link>
  );
}
