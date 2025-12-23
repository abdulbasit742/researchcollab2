import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ThreadListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-0 shadow-none">
          <CardContent className="p-4 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function MessagesSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Left aligned */}
      <div className="flex gap-2 max-w-[80%]">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-1">
          <Skeleton className="h-16 w-48 rounded-2xl rounded-tl-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      {/* Right aligned */}
      <div className="flex gap-2 max-w-[80%] ml-auto flex-row-reverse">
        <div className="space-y-1 flex flex-col items-end">
          <Skeleton className="h-10 w-40 rounded-2xl rounded-tr-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      {/* Left aligned */}
      <div className="flex gap-2 max-w-[80%]">
        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
        <div className="space-y-1">
          <Skeleton className="h-24 w-56 rounded-2xl rounded-tl-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      {/* Right aligned */}
      <div className="flex gap-2 max-w-[80%] ml-auto flex-row-reverse">
        <div className="space-y-1 flex flex-col items-end">
          <Skeleton className="h-12 w-36 rounded-2xl rounded-tr-sm" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
