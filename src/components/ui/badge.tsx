import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "gold"
    | "prospecting"
    | "qualification"
    | "proposal"
    | "negotiation"
    | "won"
    | "lost"
    | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.18em] rounded-none border select-none";

  const variants = {
    default: "bg-surface-elevated text-subtle border-border-hairline",
    gold: "bg-gold-muted text-gold border-gold/30 shadow-[0_0_10px_rgba(197,160,89,0.15)]",
    prospecting: "bg-blue-950/40 text-blue-400 border-blue-500/30",
    qualification: "bg-amber-950/40 text-amber-400 border-amber-500/30",
    proposal: "bg-purple-950/40 text-purple-400 border-purple-500/30",
    negotiation: "bg-gold-muted text-gold border-gold/40",
    won: "bg-emerald-950/40 text-emerald-400 border-emerald-500/30",
    lost: "bg-red-950/40 text-red-400 border-red-500/30",
    outline: "bg-transparent text-muted border-border-hairline",
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      <span className="h-1 w-1 rounded-full bg-current opacity-75" />
      {children}
    </span>
  );
}
