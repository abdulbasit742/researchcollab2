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
import {
  Search,
  Target,
  Briefcase,
  Award,
  Users,
  Building,
  Sparkles,
} from "lucide-react";

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<OpportunityType | "all">("all");
  const [sortBy, setSortBy] = useState<OpportunityFilters["sortBy"]>("relevance");

  const { data: opportunities = [], isLoading } = useOpportunityEngine({
    type: typeFilter === "all" ? undefined : typeFilter,
    sortBy,
  });

  const { data: stats } = useOpportunityStats();

  const filteredOpportunities = useMemo(() => {
    if (!searchQuery) return opportunities;
    const query = searchQuery.toLowerCase();
    return opportunities.filter(
      (opp) =>
        opp.title.toLowerCase().includes(query) ||
        opp.description?.toLowerCase().includes(query) ||
        opp.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [opportunities, searchQuery]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { project: 0, grant: 0, collaboration: 0, institutional: 0 };
    opportunities.forEach((opp) => {
      counts[opp.type] = (counts[opp.type] || 0) + 1;
    });
    return counts;
  }, [opportunities]);

  return (
    <MainLayout>
      {/* Header - Clean, professional */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Opportunities</h1>
              <p className="text-sm text-muted-foreground">
                {stats?.totalOpen || 0} open · Matched to your skills and trust level
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Search & Filters - Simplified */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by skill or keyword..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as OpportunityType | "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="grant">Grants</SelectItem>
              <SelectItem value="collaboration">Collaborations</SelectItem>
              <SelectItem value="institutional">Institutional</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as OpportunityFilters["sortBy"])}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Best Match</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="budget_high">Highest Budget</SelectItem>
              <SelectItem value="budget_low">Lowest Budget</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {/* Results count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isLoading ? "Loading..." : `${filteredOpportunities.length} opportunities`}
              </span>
              {sortBy === "relevance" && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Sparkles className="h-3 w-3" />
                  Ranked by match
                </Badge>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
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
                    ? "Try different keywords or clear your filters."
                    : "New projects, grants, and collaborations appear here."
                }
                guidance="Opportunities are matched based on your skills and trust level."
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
                    transition={{ delay: i * 0.03 }}
                  >
                    <OpportunityMatchCard opportunity={opp} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* How matching works */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  How Matching Works
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>Opportunities are ranked by:</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Skills proven through completed work</li>
                  <li>Your trust score and verification</li>
                  <li>Similar projects you've delivered</li>
                </ul>
              </CardContent>
            </Card>

            {/* By Type */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">By Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Projects
                  </span>
                  <Badge variant="secondary">{typeCounts.project}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    Grants
                  </span>
                  <Badge variant="secondary">{typeCounts.grant}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Collaborations
                  </span>
                  <Badge variant="secondary">{typeCounts.collaboration}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    Institutional
                  </span>
                  <Badge variant="secondary">{typeCounts.institutional}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Action */}
            <Card>
              <CardContent className="py-4">
                <Button asChild className="w-full">
                  <Link to="/earn">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Post a Project
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
