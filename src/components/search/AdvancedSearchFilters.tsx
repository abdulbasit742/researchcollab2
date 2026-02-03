import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Filter,
  ChevronDown,
  Shield,
  Building,
  DollarSign,
  CheckCircle,
  X,
} from "lucide-react";

export interface SearchFilters {
  trustScoreMin: number;
  trustScoreMax: number;
  verifiedOnly: boolean;
  institution?: string;
  budgetMin?: number;
  budgetMax?: number;
  outcomeTypes: string[];
  sortBy: "relevance" | "trust" | "newest" | "budget";
}

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  entityType?: "people" | "opportunities" | "projects" | "all";
}

const defaultFilters: SearchFilters = {
  trustScoreMin: 0,
  trustScoreMax: 100,
  verifiedOnly: false,
  outcomeTypes: [],
  sortBy: "relevance",
};

export function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  entityType = "all",
}: AdvancedSearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.trustScoreMin > 0 || filters.trustScoreMax < 100,
    filters.verifiedOnly,
    filters.institution,
    filters.budgetMin || filters.budgetMax,
    filters.outcomeTypes.length > 0,
    filters.sortBy !== "relevance",
  ].filter(Boolean).length;

  const handleReset = () => {
    onFiltersChange(defaultFilters);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
              {activeFiltersCount}
            </Badge>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mt-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Advanced Filters</CardTitle>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs h-7">
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Trust Score Range */}
            {(entityType === "people" || entityType === "all") && (
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Trust Score
                </Label>
                <div className="pt-2">
                  <Slider
                    value={[filters.trustScoreMin, filters.trustScoreMax]}
                    min={0}
                    max={100}
                    step={10}
                    onValueChange={([min, max]) =>
                      onFiltersChange({ ...filters, trustScoreMin: min, trustScoreMax: max })
                    }
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{filters.trustScoreMin}</span>
                    <span>{filters.trustScoreMax}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Verified Only */}
            {(entityType === "people" || entityType === "all") && (
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verification
                </Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="verified-only"
                    checked={filters.verifiedOnly}
                    onCheckedChange={(checked) =>
                      onFiltersChange({ ...filters, verifiedOnly: !!checked })
                    }
                  />
                  <label htmlFor="verified-only" className="text-xs cursor-pointer">
                    Verified users only
                  </label>
                </div>
              </div>
            )}

            {/* Institution */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Building className="h-3 w-3" />
                Institution
              </Label>
              <Input
                placeholder="Filter by institution..."
                value={filters.institution || ""}
                onChange={(e) => onFiltersChange({ ...filters, institution: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            {/* Budget Range (for opportunities) */}
            {(entityType === "opportunities" || entityType === "all") && (
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Budget Range
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.budgetMin || ""}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, budgetMin: Number(e.target.value) || undefined })
                    }
                    className="h-8 text-xs"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.budgetMax || ""}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, budgetMax: Number(e.target.value) || undefined })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Sort By */}
            <div className="space-y-2">
              <Label className="text-xs">Sort By</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, sortBy: value as SearchFilters["sortBy"] })
                }
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="trust">Highest Trust</SelectItem>
                  <SelectItem value="newest">Most Recent</SelectItem>
                  {(entityType === "opportunities" || entityType === "all") && (
                    <SelectItem value="budget">Highest Budget</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

export { defaultFilters };
