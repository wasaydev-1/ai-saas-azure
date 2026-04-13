import { cn } from "@/shared/utils/cn";
import type { HTMLAttributes } from "react";

const variants = {
  success:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
  error: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/15",
  warning:
    "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/15",
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-500/10",
};

export type BadgeVariant = keyof typeof variants;

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
