import { useState, useCallback } from "react";
import { useSmartSearch } from "@/hooks/useSmartSearch";
import { SmartFilterBar, SmartFilterState } from "@/components/search/SmartFilterBar";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { TagCloud } from "@/components/search/TagCloud";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PublicDiscoveryPage() {
  const [filters, setFilters] = useState<SmartFilterState>({
    query: "",
    entityType: "all",
    sortBy: "relevance",
  });
  const [page, setPage] = useState(1);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const { data, isLoading } = useSmartSearch(
    searchTriggered
      ? { ...filters, page, pageSize: 20 }
      : { query: "", entityType: "all" as const }
  );

  const handleSearch = useCallback(() => {
    setPage(1);
    setSearchTriggered(true);
  }, []);

  const handleTagClick = useCallback((tag: string) => {
    setFilters((f) => ({ ...f, query: tag }));
    setPage(1);
    setSearchTriggered(true);
  }, []);

  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <div className="min-h-screen bg-background p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Discover</h1>
        <p className="text-sm text-muted-foreground">
          Find projects, researchers, and artifacts ranked by execution quality
        </p>
      </div>

      <SmartFilterBar value={filters} onChange={setFilters} onSearch={handleSearch} />

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        <div>
          {searchTriggered ? (
            <>
              <SearchResultsList
                results={data?.results ?? []}
                total={data?.total ?? 0}
                isLoading={isLoading}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground text-sm">
                Enter a search query or select a tag to discover content.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <TagCloud onTagClick={handleTagClick} />
        </div>
      </div>
    </div>
  );
}
