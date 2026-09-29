import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glowTop?: boolean;
}

export function GlassCard({
  children,
  className = "",
  innerClassName = "",
  glowTop = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 lg:p-10 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.03] ${className}`}
      {...props}
    >
      {/* Linha de brilho (refração) no topo do card */}
      {glowTop && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

      <div className={`relative z-10 ${innerClassName}`}>{children}</div>
    </div>
  );
}
