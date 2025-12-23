import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

interface CardSkeletonProps {
  showImage?: boolean;
  showBadges?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function CardSkeleton({ 
  showImage = false, 
  showBadges = true, 
  showFooter = true,
  className 
}: CardSkeletonProps) {
  return (
    <Card className={className}>
      {showImage && (
        <Skeleton className="h-48 w-full rounded-t-lg rounded-b-none" />
      )}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        
        {showBadges && (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        )}
        
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
      {showFooter && (
        <CardFooter className="flex gap-3 pt-0">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </CardFooter>
      )}
    </Card>
  );
}
