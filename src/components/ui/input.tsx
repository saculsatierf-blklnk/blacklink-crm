import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full h-10 px-3.5 bg-surface border border-border-hairline text-foreground text-sm placeholder:text-muted/60 transition-all duration-200 focus:outline-none focus:border-border-focus focus:bg-surface-elevated rounded-none",
            error && "border-red-500/50 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error ? (
          <span className="font-mono text-[10px] text-red-400 tracking-wider">
            {error}
          </span>
        ) : helperText ? (
          <span className="font-mono text-[10px] text-muted tracking-wider">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
