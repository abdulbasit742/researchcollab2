import { useState, useEffect } from "react";
import { X, ChevronUp, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ThreadSearchBarProps {
  onSearch: (query: string) => void;
  matchCount: number;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function ThreadSearchBar({
  onSearch,
  matchCount,
  currentIndex,
  onNext,
  onPrev,
  onClose,
  isOpen,
}: ThreadSearchBarProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-background border-b p-2 shadow-md animate-in slide-in-from-top-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search messages..."
            className="pl-9 pr-4 h-10"
            autoFocus
          />
        </div>
        
        {query && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {matchCount > 0 ? `${currentIndex + 1}/${matchCount}` : "0 results"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrev}
              disabled={matchCount === 0}
              className="h-8 w-8"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={matchCount === 0}
              className="h-8 w-8"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Highlight matched text in message
export function HighlightedText({
  text,
  searchQuery,
  className,
}: {
  text: string;
  searchQuery: string;
  className?: string;
}) {
  if (!searchQuery.trim()) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === searchQuery.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
