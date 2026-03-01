import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, SlidersHorizontal, X } from "lucide-react";

export interface SmartFilterState {
  query: string;
  entityType: "all" | "user" | "project" | "milestone" | "artifact" | "research";
  sortBy: "relevance" | "recency" | "activity";
  dateFrom?: string;
  dateTo?: string;
}

interface SmartFilterBarProps {
  value: SmartFilterState;
  onChange: (state: SmartFilterState) => void;
  onSearch: () => void;
}

export function SmartFilterBar({ value, onChange, onSearch }: SmartFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value.slice(0, 200);
      onChange({ ...value, query: q });
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") onSearch();
    },
    [onSearch]
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, people, milestones..."
            className="pl-9"
            value={value.query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            maxLength={200}
          />
          {value.query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onChange({ ...value, query: "" })}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button onClick={onSearch} size="default">
          <Search className="h-4 w-4 mr-1" />
          Search
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {showAdvanced && (
        <Card>
          <CardContent className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <Select
                value={value.entityType}
                onValueChange={(v) => onChange({ ...value, entityType: v as any })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="user">People</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="milestone">Milestones</SelectItem>
                  <SelectItem value="artifact">Artifacts</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sort By</label>
              <Select
                value={value.sortBy}
                onValueChange={(v) => onChange({ ...value, sortBy: v as any })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="recency">Most Recent</SelectItem>
                  <SelectItem value="activity">Most Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">From</label>
              <Input
                type="date"
                className="h-9"
                value={value.dateFrom ?? ""}
                onChange={(e) => onChange({ ...value, dateFrom: e.target.value || undefined })}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">To</label>
              <Input
                type="date"
                className="h-9"
                value={value.dateTo ?? ""}
                onChange={(e) => onChange({ ...value, dateTo: e.target.value || undefined })}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
