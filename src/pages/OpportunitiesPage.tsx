import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { useOutcomeFeed } from "@/hooks/useOutcomeFeed";
import {
  Search,
  DollarSign,
  Clock,
  ArrowRight,
  Target,
  Briefcase,
  Award,
  Users,
  Building,
  Filter,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type OpportunityType = "all" | "project" | "grant" | "collaboration" | "job";

const typeConfig = {
  project_posted: { icon: Briefcase, color: "bg-blue-500/10 text-blue-600", label: "Project", type: "project" as const },
  grant_opportunity: { icon: Award, color: "bg-amber-500/10 text-amber-600", label: "Grant", type: "grant" as const },
  collaboration_request: { icon: Users, color: "bg-purple-500/10 text-purple-600", label: "Collaboration", type: "collaboration" as const },
};

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<OpportunityType>("all");
  const [budgetFilter, setBudgetFilter] = useState<string>("all");
  const { feedItems, loading } = useOutcomeFeed();

  // Filter for opportunity-type items only
  const opportunities = useMemo(() => {
    return feedItems.filter(item => 
      ["project_posted", "grant_opportunity", "collaboration_request"].includes(item.item_type)
    );
  }, [feedItems]);

  // Apply filters
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(item => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.relevance_tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Type filter
      const itemType = typeConfig[item.item_type as keyof typeof typeConfig]?.type || "project";
      const matchesType = typeFilter === "all" || itemType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [opportunities, searchQuery, typeFilter]);

  const renderOpportunityCard = (item: typeof feedItems[0]) => {
    const config = typeConfig[item.item_type as keyof typeof typeConfig] || {
      icon: Target,
      color: "bg-muted text-muted-foreground",
      label: "Opportunity",
    };
    const Icon = config.icon;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Link to={`/offers/${item.target_id || item.id}`}>
          <Card className="hover:border-primary/50 hover:shadow-md transition-all group">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl shrink-0 ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="secondary" className={config.color}>
                      {config.label}
                    </Badge>
                    {item.is_verified && (
                      <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                        ✓ Verified
                      </Badge>
                    )}
                    {item.actor_name && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {item.actor_name}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>

                  {/* Summary */}
                  {item.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.summary}
                    </p>
                  )}

                  {/* Tags */}
                  {item.relevance_tags && item.relevance_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.relevance_tags.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.relevance_tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.relevance_tags.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Opportunities</h1>
          </div>
          <p className="text-muted-foreground">
            Real work opportunities. Projects, grants, and collaborations. No social noise.
          </p>
        </div>
      </div>

      <div className="container py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities, skills, or keywords..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as OpportunityType)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="grant">Grants</SelectItem>
              <SelectItem value="collaboration">Collaborations</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>

        {/* Results */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main content */}
          <div className="lg:col-span-8 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <div className="h-11 w-11 rounded-xl bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
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
                description={searchQuery 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "New projects, grants, and collaborations will appear here. Check back soon!"
                }
                actionLabel="Post a Project"
                actionHref="/earn"
              />
            ) : (
              <div className="space-y-4">
                {filteredOpportunities.map(renderOpportunityCard)}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Opportunity Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Projects</span>
                  <span className="font-medium">
                    {opportunities.filter(o => o.item_type === "project_posted").length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Open Grants</span>
                  <span className="font-medium">
                    {opportunities.filter(o => o.item_type === "grant_opportunity").length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Collaborations</span>
                  <span className="font-medium">
                    {opportunities.filter(o => o.item_type === "collaboration_request").length}
                  </span>
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
