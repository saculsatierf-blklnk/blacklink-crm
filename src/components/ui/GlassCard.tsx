import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  glowTop?: boolean;
}

/**
 * Fórmula Exata do GlassCard Apple Dark Mode para o Black Link CRM
 */
export function GlassCard({
  children,
  className = "",
  innerClassName = "space-y-6",
  glowTop = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:bg-white/[0.03] ${className}`}
      {...props}
    >
      {/* Linha de refração no topo */}
      {glowTop && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

      <div className={`relative z-10 ${innerClassName}`}>{children}</div>
    </div>
  );
}
