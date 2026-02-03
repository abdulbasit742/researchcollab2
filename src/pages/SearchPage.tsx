import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Bookmark, 
  X, 
  User, 
  Briefcase, 
  Building2, 
  Wrench,
  FileText,
} from "lucide-react";
import { useGlobalSearch, useSavedSearches, useSaveSearch, useDeleteSavedSearch } from "@/hooks/useGlobalSearch";
import { SearchResultCard } from "@/components/search";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<{ entity_types?: string[] }>({});
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const { 
    data, 
    isLoading, 
    isFetchingNextPage, 
    hasNextPage, 
    fetchNextPage 
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
  
  const allResults = data?.pages.flatMap(page => page.results) || [];
  
  const getTabCount = (type: string) => {
    return allResults.filter(r => r.entity_type === type).length;
  };
  
  return (
    <MainLayout>
      <div className="container py-6">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search people, projects, tools, organizations..."
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
          
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Main Results */}
            <div className="lg:col-span-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="all" className="gap-1">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="user" className="gap-1">
                    <User className="h-3.5 w-3.5" />
                    People
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
                  <TabsTrigger value="post" className="gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    Posts
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-4">
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
                  ) : allResults.length > 0 ? (
                    <div className="space-y-3">
                      {allResults
                        .filter(r => activeTab === "all" || r.entity_type === activeTab)
                        .map((result) => (
                          <SearchResultCard key={`${result.entity_type}-${result.entity_id}`} result={result} />
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
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">No results found</h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search terms or filters
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">Search the platform</h3>
                        <p className="text-sm text-muted-foreground">
                          Find people, projects, tools, and organizations
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <aside className="lg:col-span-4">
              {/* Saved Searches */}
              {savedSearches && savedSearches.length > 0 && (
                <Card className="mb-4">
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
              
              {/* Quick Tips */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Search Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• Use specific keywords for better results</p>
                  <p>• Filter by category using the tabs</p>
                  <p>• Save frequently used searches</p>
                  <p>• Use quotes for exact phrases</p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
