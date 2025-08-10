// src/app/(app)/teams/[teamId]/events/loading.tsx
import Skeleton from "@/components/skeleton";
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
