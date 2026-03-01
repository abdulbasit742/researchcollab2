import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  goNext: () => void;
  goPrev: () => void;
  totalCount?: number;
  pageSize?: number;
}

export function PaginationControls({
  page,
  totalPages,
  hasNext,
  hasPrev,
  goNext,
  goPrev,
  totalCount,
  pageSize,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-muted-foreground">
        {totalCount != null && pageSize
          ? `Showing ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, totalCount)} of ${totalCount}`
          : `Page ${page + 1} of ${totalPages}`}
      </p>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={goPrev} disabled={!hasPrev}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" onClick={goNext} disabled={!hasNext}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
