import { CardSkeleton } from "./CardSkeleton";

interface ProjectListSkeletonProps {
  count?: number;
}

export function ProjectListSkeleton({ count = 4 }: ProjectListSkeletonProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} showBadges showFooter />
      ))}
    </div>
  );
}
