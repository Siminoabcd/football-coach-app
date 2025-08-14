import * as React from "react";

export default function LogoIcon({
  size = 32,
  className,
}: { size?: number | string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-label="Modern Coach"
      role="img"
    >
      <defs>
        {/* Uses your Tailwind CSS var --primary so it fits light/dark themes */}
        <linearGradient id="mc_grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity=".95" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity=".6" />
        </linearGradient>
      </defs>

      {/* Rounded tile */}
      <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#mc_grad)" />

      {/* Minimal “sparkline” → analytics/sessions vibe */}
      <path
        d="M5 14 L10 10 L14 12 L19 8"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="8" r="1.6" fill="white" />
    </svg>
  );
}
