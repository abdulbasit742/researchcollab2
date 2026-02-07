import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  User, 
  Briefcase, 
  Building2, 
  FileText, 
  Wrench,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useQuickSearch, useRecentSearches } from "@/hooks/useGlobalSearch";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function GlobalSearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  
  const { data: results, isLoading } = useQuickSearch(debouncedQuery);
  const { data: recentSearches } = useRecentSearches();
  
  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  
  const handleSelect = useCallback((entityType: string, entityId: string) => {
    setOpen(false);
    setQuery("");
    
    switch (entityType) {
      case "user":
        navigate(`/u/${entityId}`);
        break;
      case "project":
        navigate(`/earn/projects/${entityId}`);
        break;
      case "organization":
        navigate(`/organizations/${entityId}`);
        break;
      case "tool":
        navigate(`/tools?id=${entityId}`);
        break;
      case "post":
        navigate(`/posts/${entityId}`);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  }, [navigate, query]);
  
  const handleSearchAll = () => {
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setQuery("");
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case "user": return <User className="h-4 w-4" />;
      case "project": return <Briefcase className="h-4 w-4" />;
      case "organization": return <Building2 className="h-4 w-4" />;
      case "tool": return <Wrench className="h-4 w-4" />;
      case "post": return <FileText className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };
  
  const trendingTopics = ["Machine Learning", "Data Science", "Climate Research", "AI Ethics"];
  
  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search people, projects, tools...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search people, projects, tools..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isLoading ? "Searching..." : query.length < 2 ? "Type at least 2 characters..." : "No results found."}
          </CommandEmpty>
          
          
          {results && results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((result) => (
                <CommandItem
                  key={`${result.entity_type}-${result.entity_id}`}
                  onSelect={() => handleSelect(result.entity_type, result.entity_id)}
                  className="cursor-pointer"
                >
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md border bg-background">
                    {getIcon(result.entity_type)}
                  </div>
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {result.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
              
              <CommandItem onSelect={handleSearchAll} className="cursor-pointer">
                <Search className="mr-2 h-4 w-4" />
                <span>See all results for "{query}"</span>
              </CommandItem>
            </CommandGroup>
          )}
          
          {!query && recentSearches && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search, i) => (
                <CommandItem
                  key={i}
                  onSelect={() => {
                    setQuery(search.query);
                  }}
                  className="cursor-pointer"
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {search.query}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {!query && (
            <CommandGroup heading="Trending">
              {trendingTopics.map((topic) => (
                <CommandItem
                  key={topic}
                  onSelect={() => {
                    setQuery(topic);
                  }}
                  className="cursor-pointer"
                >
                  <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                  {topic}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
