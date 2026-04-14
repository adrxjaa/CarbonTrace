import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, label, id, ...props },
  ref,
) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-body" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <input
        ref={ref}
        id={id}
        className={cn(
          "h-12 rounded-2xl border bg-white px-4 text-body outline-none transition placeholder:text-body/45 focus:border-forest focus:ring-4 focus:ring-forest/10",
          error ? "border-[#d77878]" : "border-[var(--line-soft)]",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs font-normal text-[#b64e4e]">{error}</span> : null}
    </label>
  );
});
