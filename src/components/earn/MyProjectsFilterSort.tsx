import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Filter, X } from "lucide-react";

export type StatusFilter = "all" | "open" | "closed" | "in_progress" | "completed";
export type SortOption = "date-desc" | "date-asc" | "bids-desc" | "bids-asc" | "budget-desc" | "budget-asc";

interface MyProjectsFilterSortProps {
  statusFilter: StatusFilter;
  sortOption: SortOption;
  onStatusFilterChange: (value: StatusFilter) => void;
  onSortChange: (value: SortOption) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function MyProjectsFilterSort({
  statusFilter,
  sortOption,
  onStatusFilterChange,
  onSortChange,
  onReset,
  hasActiveFilters,
}: MyProjectsFilterSortProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 p-3 sm:p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Filters:</span>
      </div>
      
      <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}>
        <SelectTrigger className="w-full sm:w-[140px] h-9">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Sort:</span>
      </div>

      <Select value={sortOption} onValueChange={(v) => onSortChange(v as SortOption)}>
        <SelectTrigger className="w-full sm:w-[160px] h-9">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Newest First</SelectItem>
          <SelectItem value="date-asc">Oldest First</SelectItem>
          <SelectItem value="bids-desc">Most Bids</SelectItem>
          <SelectItem value="bids-asc">Least Bids</SelectItem>
          <SelectItem value="budget-desc">Highest Budget</SelectItem>
          <SelectItem value="budget-asc">Lowest Budget</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onReset}
          className="h-9 px-3 text-muted-foreground hover:text-foreground w-full sm:w-auto"
        >
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
