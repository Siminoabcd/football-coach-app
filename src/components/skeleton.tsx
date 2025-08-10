// src/components/skeleton.tsx
export default function Skeleton({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-muted ${className}`} />;
  }
  