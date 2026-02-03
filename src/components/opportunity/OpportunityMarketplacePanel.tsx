import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useOpportunityMarketplace, 
  useSavedOpportunities,
  EnhancedOpportunity 
} from "@/hooks/useOpportunityMarketplace";
import { 
  Briefcase, 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck,
  X,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Clock,
  DollarSign,
  Users,
  Shield,
  Sparkles,
  ChevronRight,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { format } from "date-fns";
import { TrustBadgeInline } from "@/components/trust/TrustBreakdownPanel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function OpportunityMarketplacePanel() {
  const { 
    opportunities, 
    loading, 
    filters, 
    setFilters, 
    marketInsights,
    checkReadiness 
  } = useOpportunityMarketplace();
  const { saved, saveOpportunity, unsaveOpportunity, isSaved, isDismissed, dismissOpportunity } = useSavedOpportunities();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredOpportunities = opportunities.filter(opp => {
    if (isDismissed(opp.id)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return opp.title.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query) ||
        opp.category.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t">
              <Select
                value={filters.types[0] || "all"}
                onValueChange={(v) => setFilters({ ...filters, types: v === "all" ? [] : [v] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="collaboration">Collaboration</SelectItem>
                  <SelectItem value="grant">Grant</SelectItem>
                  <SelectItem value="position">Position</SelectItem>
                  <SelectItem value="advisory">Advisory</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.timeframe}
                onValueChange={(v: any) => setFilters({ ...filters, timeframe: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="urgent">Urgent (7 days)</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Min Budget"
                value={filters.budgetRange.min || ""}
                onChange={(e) => setFilters({
                  ...filters,
                  budgetRange: { ...filters.budgetRange, min: Number(e.target.value) }
                })}
              />

              <Input
                type="number"
                placeholder="Max Budget"
                value={filters.budgetRange.max === 100000 ? "" : filters.budgetRange.max}
                onChange={(e) => setFilters({
                  ...filters,
                  budgetRange: { ...filters.budgetRange, max: Number(e.target.value) || 100000 }
                })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Insights */}
      {marketInsights.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Market Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {marketInsights.slice(0, 5).map((insight) => (
                <div 
                  key={insight.category} 
                  className="flex-shrink-0 p-3 border rounded-lg min-w-[140px]"
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-medium capitalize">{insight.category}</span>
                    {insight.trending && (
                      <Badge variant="secondary" className="text-xs">🔥</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        insight.demand === "high" ? "border-green-500 text-green-600" :
                        insight.demand === "medium" ? "border-amber-500 text-amber-600" :
                        "border-gray-500"
                      )}
                    >
                      {insight.demand} demand
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ~${Math.round(insight.avgBudget)} avg
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Opportunities */}
      {saved.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookmarkCheck className="h-5 w-5 text-primary" />
              Saved ({saved.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {opportunities.filter(o => saved.includes(o.id)).slice(0, 5).map((opp) => (
                <Badge 
                  key={opp.id} 
                  variant="secondary" 
                  className="py-1 px-3 cursor-pointer hover:bg-secondary/80"
                >
                  {opp.title.slice(0, 20)}...
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Opportunity List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="font-medium mb-2">No opportunities found</h3>
              <p className="text-sm">Try adjusting your filters or check back later</p>
            </CardContent>
          </Card>
        ) : (
          filteredOpportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              isSaved={isSaved(opp.id)}
              onSave={() => isSaved(opp.id) ? unsaveOpportunity(opp.id) : saveOpportunity(opp.id)}
              onDismiss={() => dismissOpportunity(opp.id)}
              readiness={checkReadiness(opp.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: EnhancedOpportunity;
  isSaved: boolean;
  onSave: () => void;
  onDismiss: () => void;
  readiness: { ready: boolean; blockers: string[]; suggestions: string[] } | null;
}

function OpportunityCard({ 
  opportunity, 
  isSaved, 
  onSave, 
  onDismiss,
  readiness 
}: OpportunityCardProps) {
  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md",
      opportunity.fitScore >= 80 ? "border-l-4 border-l-green-500" :
      opportunity.fitScore >= 60 ? "border-l-4 border-l-amber-500" :
      ""
    )}>
      <CardContent className="py-4">
        <div className="flex gap-4">
          {/* Fit Score Badge */}
          <div className="flex-shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className={cn(
                    "w-14 h-14 rounded-lg flex flex-col items-center justify-center text-white",
                    opportunity.fitScore >= 80 ? "bg-green-500" :
                    opportunity.fitScore >= 60 ? "bg-amber-500" :
                    opportunity.fitScore >= 40 ? "bg-orange-500" :
                    "bg-gray-500"
                  )}>
                    <span className="text-lg font-bold">{opportunity.fitScore}</span>
                    <span className="text-xs">fit</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">Why this score:</p>
                    {opportunity.fitExplanation.map((exp, i) => (
                      <p key={i} className="text-xs">• {exp}</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="capitalize text-xs">
                    {opportunity.type}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {opportunity.category}
                  </Badge>
                  {opportunity.isSponsored && (
                    <Badge className="bg-primary/10 text-primary text-xs">
                      Sponsored
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold">{opportunity.title}</h3>
              </div>
              
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={onSave}>
                  {isSaved ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={onDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {opportunity.description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 text-sm mb-3">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>${opportunity.budget.min.toLocaleString()}</span>
                {opportunity.budget.max > opportunity.budget.min && (
                  <span>- ${opportunity.budget.max.toLocaleString()}</span>
                )}
              </div>
              
              {opportunity.deadline && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(opportunity.deadline, "MMM d")}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{opportunity.applicationCount} applied</span>
              </div>
              
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  opportunity.competitionLevel === "low" ? "border-green-500 text-green-600" :
                  opportunity.competitionLevel === "medium" ? "border-amber-500 text-amber-600" :
                  "border-red-500 text-red-600"
                )}
              >
                {opportunity.competitionLevel} competition
              </Badge>
            </div>

            {/* Posted By */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{opportunity.postedBy.name}</span>
                {opportunity.postedBy.institution && (
                  <span className="text-sm text-muted-foreground">
                    @ {opportunity.postedBy.institution}
                  </span>
                )}
                <TrustBadgeInline score={opportunity.postedBy.trustScore} size="sm" />
              </div>

              {/* Requirements */}
              {opportunity.requirements.minTrustScore > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Min. {opportunity.requirements.minTrustScore} trust
                </Badge>
              )}
            </div>

            {/* Blockers */}
            {opportunity.blockers.length > 0 && (
              <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <div className="flex items-center gap-1 text-sm text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Blocker:</span>
                  {opportunity.blockers[0]}
                </div>
              </div>
            )}

            {/* Match Reasons */}
            {opportunity.matchReasons.length > 0 && opportunity.blockers.length === 0 && (
              <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <div className="flex items-center gap-1 text-sm text-green-700 dark:text-green-300">
                  <Sparkles className="h-4 w-4" />
                  <span>{opportunity.matchReasons[0]}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t flex justify-end">
          <Button disabled={opportunity.blockers.length > 0}>
            Apply Now
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
