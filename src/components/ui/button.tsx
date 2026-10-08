import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-none select-none";

    const variants = {
      primary:
        "bg-white text-black hover:bg-platinum active:scale-[0.98] shadow-sm",
      accent:
        "bg-gold text-black font-semibold hover:bg-[#d6b26b] active:scale-[0.98] shadow-gold-glow",
      outline:
        "border border-border-hairline bg-surface/50 text-foreground hover:bg-surface-elevated hover:border-border-focus active:scale-[0.98]",
      ghost:
        "text-subtle hover:text-white hover:bg-surface-elevated/60 active:scale-[0.98]",
      danger:
        "border border-red-500/30 bg-red-950/20 text-red-400 hover:bg-red-900/30 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs tracking-wider",
      md: "h-10 px-4 text-xs uppercase tracking-widest",
      lg: "h-12 px-6 text-sm uppercase tracking-widest font-semibold",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Processando...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
