import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AdvancedSearchFilters, defaultFilters, type SearchFilters } from "@/components/search/AdvancedSearchFilters";
import {
  Search,
  Bookmark,
  X,
  User,
  Briefcase,
  Building2,
  Wrench,
  FileText,
  Shield,
  TrendingUp,
  Target,
} from "lucide-react";
import { useGlobalSearch, useSavedSearches, useSaveSearch, useDeleteSavedSearch } from "@/hooks/useGlobalSearch";
import { SearchResultCard } from "@/components/search";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<{ entity_types?: string[] }>({});
  const [advancedFilters, setAdvancedFilters] = useState<SearchFilters>(defaultFilters);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGlobalSearch(query, filters);

  const { data: savedSearches } = useSavedSearches();
  const saveSearch = useSaveSearch();
  const deleteSearch = useDeleteSavedSearch();

  // Update filters based on active tab
  useEffect(() => {
    if (activeTab === "all") {
      setFilters({});
    } else {
      setFilters({ entity_types: [activeTab] });
    }
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const handleSaveSearch = () => {
    if (query) {
      saveSearch.mutate({ query, filters });
    }
  };

  const allResults = data?.pages.flatMap((page) => page.results) || [];

  // Apply client-side trust filtering
  const filteredResults = allResults.filter((result) => {
    if (advancedFilters.verifiedOnly && result.trust_score_snapshot < 40) return false;
    if (result.trust_score_snapshot < advancedFilters.trustScoreMin) return false;
    if (result.trust_score_snapshot > advancedFilters.trustScoreMax) return false;
    if (advancedFilters.institution && 
        !result.university?.toLowerCase().includes(advancedFilters.institution.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getTabCount = (type: string) => {
    return filteredResults.filter((r) => r.entity_type === type).length;
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="container px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Search Intelligence</h1>
              <p className="text-sm text-muted-foreground">
                Find people, opportunities, and organizations by trust and outcomes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Search Bar */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search people, projects, organizations by name, skill, or institution..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
              {query && (
                <Button type="button" variant="outline" onClick={handleSaveSearch}>
                  <Bookmark className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>

          {/* Advanced Filters */}
          <div className="mb-6">
            <AdvancedSearchFilters
              filters={advancedFilters}
              onFiltersChange={setAdvancedFilters}
              entityType="all"
            />
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Main Results */}
            <div className="lg:col-span-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="all" className="gap-1">
                    All
                    {filteredResults.length > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {filteredResults.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="user" className="gap-1">
                    <User className="h-3.5 w-3.5" />
                    People
                    {getTabCount("user") > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                        {getTabCount("user")}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="project" className="gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger value="organization" className="gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    Orgs
                  </TabsTrigger>
                  <TabsTrigger value="tool" className="gap-1">
                    <Wrench className="h-3.5 w-3.5" />
                    Tools
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                  {/* Results Info */}
                  {query && !isLoading && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <span>
                        {filteredResults.filter((r) => activeTab === "all" || r.entity_type === activeTab).length} results
                      </span>
                      {advancedFilters.sortBy === "trust" && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Shield className="h-2.5 w-2.5" />
                          Sorted by trust
                        </Badge>
                      )}
                    </div>
                  )}

                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Skeleton className="h-12 w-12 rounded-lg" />
                              <div className="flex-1">
                                <Skeleton className="h-4 w-48 mb-2" />
                                <Skeleton className="h-3 w-full mb-2" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredResults.length > 0 ? (
                    <div className="space-y-3">
                      {filteredResults
                        .filter((r) => activeTab === "all" || r.entity_type === activeTab)
                        .sort((a, b) => {
                          if (advancedFilters.sortBy === "trust") {
                            return b.trust_score_snapshot - a.trust_score_snapshot;
                          }
                          return 0;
                        })
                        .map((result) => (
                          <SearchResultCard
                            key={`${result.entity_type}-${result.entity_id}`}
                            result={result}
                          />
                        ))}

                      {/* Load More Trigger */}
                      <div ref={loadMoreRef} className="py-4 flex justify-center">
                        {isFetchingNextPage && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm">Loading more...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : query ? (
                    <EmptyState
                      icon={Search}
                      title="No results found"
                      description="Try adjusting your search terms or filters."
                      actionLabel="Clear Filters"
                      onAction={() => {
                        setAdvancedFilters(defaultFilters);
                        setQuery("");
                      }}
                    />
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="Search the platform"
                      description="Find people by skills and trust, projects by outcomes, and organizations by verification."
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-4">
              {/* How Search Works */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Trust-Based Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>Search results prioritize:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Higher trust scores from completed work</li>
                    <li>Verified credentials and institutions</li>
                    <li>Successful project outcomes</li>
                    <li>Relevance to your query</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Saved Searches */}
              {savedSearches && savedSearches.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      Saved Searches
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {savedSearches.map((search: any) => (
                      <div
                        key={search.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setQuery(search.query_text);
                          setSearchParams({ q: search.query_text });
                        }}
                      >
                        <span className="text-sm truncate">{search.query_text}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSearch.mutate(search.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" asChild className="w-full justify-start gap-2">
                    <Link to="/opportunities">
                      <Target className="h-4 w-4" />
                      Browse Opportunities
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full justify-start gap-2">
                    <Link to="/network">
                      <User className="h-4 w-4" />
                      View Network
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Philosophy */}
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="py-4 text-center">
                  <p className="text-xs text-muted-foreground italic">
                    "Search by proof, not claims.
                    <br />
                    <span className="font-medium text-foreground">Trust is earned, not declared.</span>"
                  </p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

