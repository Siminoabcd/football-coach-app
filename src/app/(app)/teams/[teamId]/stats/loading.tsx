// src/app/(app)/teams/[teamId]/stats/loading.tsx
import Skeleton from "@/components/skeleton";
export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-28 mt-2" />
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="overflow-x-auto border rounded">
        <div className="p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
