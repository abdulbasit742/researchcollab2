import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SlidersHorizontal, X } from "lucide-react";

export interface AdvancedFilterState {
  budgetMin: string;
  budgetMax: string;
  maxDeadlineDays: string;
  zeroBidsOnly: boolean;
}

const DEFAULT_FILTERS: AdvancedFilterState = {
  budgetMin: "",
  budgetMax: "",
  maxDeadlineDays: "",
  zeroBidsOnly: false,
};

interface AdvancedFiltersProps {
  filters: AdvancedFilterState;
  onChange: (filters: AdvancedFilterState) => void;
}

export function AdvancedFilters({ filters, onChange }: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    filters.budgetMin !== "" ||
    filters.budgetMax !== "" ||
    filters.maxDeadlineDays !== "" ||
    filters.zeroBidsOnly;

  const handleReset = () => {
    onChange(DEFAULT_FILTERS);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button variant={hasActiveFilters ? "default" : "outline"} size="sm" className="h-8 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 bg-primary-foreground/20 rounded-full px-1.5 text-[10px]">●</span>
            )}
          </Button>
        </CollapsibleTrigger>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleReset}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <CollapsibleContent className="mt-3">
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Budget Range */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Budget Range (PKR)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  className="h-8 text-xs"
                  value={filters.budgetMin}
                  onChange={(e) => onChange({ ...filters, budgetMin: e.target.value })}
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="h-8 text-xs"
                  value={filters.budgetMax}
                  onChange={(e) => onChange({ ...filters, budgetMax: e.target.value })}
                />
              </div>
            </div>

            {/* Max Deadline */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Max Deadline (days)</Label>
              <Input
                type="number"
                placeholder="e.g., 30"
                className="h-8 text-xs"
                value={filters.maxDeadlineDays}
                onChange={(e) => onChange({ ...filters, maxDeadlineDays: e.target.value })}
              />
            </div>

            {/* Zero Bids Toggle */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Competition</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={filters.zeroBidsOnly}
                  onCheckedChange={(checked) => onChange({ ...filters, zeroBidsOnly: checked })}
                />
                <span className="text-xs text-muted-foreground">0 bids only</span>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export { DEFAULT_FILTERS };
