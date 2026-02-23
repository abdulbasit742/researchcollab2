import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardHeaderSkeleton() {
  return (
    <div className="mb-5 space-y-2">
      <Skeleton className="h-7 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}

export function QuickLinksSkeleton() {
  return (
    <div className="flex gap-2 mb-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
      ))}
    </div>
  );
}

export function MetricsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function MetricsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: count }).map((_, i) => (
        <MetricsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ActivityListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-full max-w-[200px]" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SidebarCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export function FullDashboardSkeleton() {
  return (
    <div className="container px-4 py-6 pb-4 max-w-5xl animate-in fade-in duration-300">
      <DashboardHeaderSkeleton />
      <QuickLinksSkeleton />
      <MetricsGridSkeleton />
      <MetricsGridSkeleton count={3} />
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <ActivityListSkeleton count={4} />
          <ActivityListSkeleton count={3} />
        </div>
        <aside className="lg:col-span-4 space-y-4">
          <SidebarCardSkeleton />
          <SidebarCardSkeleton />
          <SidebarCardSkeleton />
        </aside>
      </div>
    </div>
  );
}
