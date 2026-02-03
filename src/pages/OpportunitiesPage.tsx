import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOpportunityEngine, useOpportunityStats, type OpportunityType, type OpportunityFilters } from "@/hooks/useOpportunityEngine";
import { OpportunityMatchCard } from "@/components/opportunity/OpportunityMatchCard";
import { AdvancedSearchFilters, defaultFilters, type SearchFilters } from "@/components/search/AdvancedSearchFilters";
import {
  Search,
  Target,
  Briefcase,
  Award,
  Users,
  Building,
  TrendingUp,
  Sparkles,
  DollarSign,
  Filter,
} from "lucide-react";

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<OpportunityType | "all">("all");
  const [sortBy, setSortBy] = useState<OpportunityFilters["sortBy"]>("relevance");
  const [advancedFilters, setAdvancedFilters] = useState<SearchFilters>(defaultFilters);

  const { data: opportunities = [], isLoading } = useOpportunityEngine({
    type: typeFilter === "all" ? undefined : typeFilter,
    minBudget: advancedFilters.budgetMin,
    maxBudget: advancedFilters.budgetMax,
    sortBy,
  });

  const { data: stats } = useOpportunityStats();

  // Apply search filter on client side
  const filteredOpportunities = useMemo(() => {
    if (!searchQuery) return opportunities;
    const query = searchQuery.toLowerCase();
    return opportunities.filter(
      (opp) =>
        opp.title.toLowerCase().includes(query) ||
        opp.description?.toLowerCase().includes(query) ||
        opp.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        opp.owner_university?.toLowerCase().includes(query)
    );
  }, [opportunities, searchQuery]);

  // Group by type for quick stats
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      project: 0,
      grant: 0,
      collaboration: 0,
      institutional: 0,
    };
    opportunities.forEach((opp) => {
      counts[opp.type] = (counts[opp.type] || 0) + 1;
    });
    return counts;
  }, [opportunities]);

  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Opportunity Hub</h1>
              <p className="text-muted-foreground text-sm">
                Real work opportunities personalized for you. No social noise.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Badge variant="secondary" className="gap-1.5 py-1">
              <Briefcase className="h-3.5 w-3.5" />
              {stats?.totalOpen || 0} Open
            </Badge>
            <Badge variant="secondary" className="gap-1.5 py-1">
              <DollarSign className="h-3.5 w-3.5" />
              Avg ${stats?.avgBudget?.toLocaleString() || 0}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 py-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {stats?.newThisWeek || 0} New This Week
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Search & Filters */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by skill, keyword, or institution..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as OpportunityType | "all")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="project">Projects ({typeCounts.project})</SelectItem>
                <SelectItem value="grant">Grants ({typeCounts.grant})</SelectItem>
                <SelectItem value="collaboration">Collabs ({typeCounts.collaboration})</SelectItem>
                <SelectItem value="institutional">Institutional ({typeCounts.institutional})</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as OpportunityFilters["sortBy"])}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Best Match</SelectItem>
                <SelectItem value="newest">Most Recent</SelectItem>
                <SelectItem value="budget_high">Highest Budget</SelectItem>
                <SelectItem value="budget_low">Lowest Budget</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AdvancedSearchFilters
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            entityType="opportunities"
          />
        </div>

        {/* Results */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Loading..." : `${filteredOpportunities.length} opportunities found`}
              </p>
              {sortBy === "relevance" && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Sparkles className="h-2.5 w-2.5" />
                  Ranked by match score
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <EmptyState
                icon={Target}
                title={searchQuery ? `No results for "${searchQuery}"` : "No opportunities available"}
                description={
                  searchQuery
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "New projects, grants, and collaborations will appear here. Check back soon!"
                }
                actionLabel="Post a Project"
                actionHref="/earn"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {filteredOpportunities.map((opp, i) => (
                  <motion.div
                    key={opp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <OpportunityMatchCard opportunity={opp} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Why You're Seeing This */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  How We Match
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>Opportunities are ranked based on:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your proven skills from completed work</li>
                  <li>Your trust score and verification status</li>
                  <li>Institution and location match</li>
                  <li>Similar projects you've done before</li>
                </ul>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">By Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    Projects
                  </span>
                  <Badge variant="secondary">{typeCounts.project}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    Grants
                  </span>
                  <Badge variant="secondary">{typeCounts.grant}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-500" />
                    Collaborations
                  </span>
                  <Badge variant="secondary">{typeCounts.collaboration}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-emerald-500" />
                    Institutional
                  </span>
                  <Badge variant="secondary">{typeCounts.institutional}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="default" size="sm" asChild className="w-full justify-start gap-2">
                  <Link to="/earn">
                    <Briefcase className="h-4 w-4" />
                    Post a Project
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full justify-start gap-2">
                  <Link to="/grants">
                    <Award className="h-4 w-4" />
                    Find Grants
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full justify-start gap-2">
                  <Link to="/collaborations">
                    <Users className="h-4 w-4" />
                    Find Collaborators
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Philosophy */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground italic">
                  "This is where real work lives.
                  <br />
                  <span className="font-medium text-foreground">Not posts. Not opinions. Work.</span>"
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}

