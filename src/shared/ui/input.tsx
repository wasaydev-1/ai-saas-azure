import { cn } from "@/shared/utils/cn";
import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  left?: ReactNode;
  right?: ReactNode;
  error?: string;
};

export function Input({
  className,
  left,
  right,
  error,
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      <div
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm transition focus-within:border-[hsl(var(--brand-navy))] focus-within:ring-2 focus-within:ring-[hsl(var(--brand-navy)/0.15)]",
          error && "border-red-300 focus-within:border-red-400 focus-within:ring-red-200",
        )}
      >
        {left ? (
          <span className="shrink-0 text-slate-400 [&_svg]:size-4">{left}</span>
        ) : null}
        <input
          id={id}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400",
            className,
          )}
          {...props}
        />
        {right ? (
          <span className="shrink-0 text-slate-400 [&_svg]:size-4">{right}</span>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
