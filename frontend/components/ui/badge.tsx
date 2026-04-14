import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "positive" | "neutral" | "warning" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  positive: "bg-[#143d31] text-[#7ef2c8] border-[#1d9e75]/40",
  neutral: "bg-white/10 text-[#dbeee7] border-white/10",
  warning: "bg-[#493d16] text-[#ffd978] border-[#80681b]",
  danger: "bg-[#4b1f25] text-[#ff9da5] border-[#7f3842]",
};

export function Badge({
  className,
  children,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
