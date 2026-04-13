import { cn } from "@/shared/utils/cn";
import type { ButtonHTMLAttributes } from "react";

const variants = {
  default:
    "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 border border-border",
  ghost: "bg-transparent hover:bg-muted text-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  outline:
    "border border-border bg-background hover:bg-muted text-foreground",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
