import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Award,
  Users,
  ArrowRight,
  Target,
  DollarSign,
  Clock,
  Building,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Opportunity {
  id: string;
  type: "project" | "grant" | "collaboration" | "job";
  title: string;
  description?: string;
  budget?: number;
  deadline?: string;
  institution?: string;
  matchReason?: string;
  tags?: string[];
}

interface OpportunityListProps {
  opportunities: Opportunity[];
  loading?: boolean;
  title?: string;
}

const typeConfig = {
  project: { icon: Briefcase, color: "bg-blue-500/10 text-blue-600", label: "Project" },
  grant: { icon: Award, color: "bg-amber-500/10 text-amber-600", label: "Grant" },
  collaboration: { icon: Users, color: "bg-purple-500/10 text-purple-600", label: "Collaboration" },
  job: { icon: Briefcase, color: "bg-emerald-500/10 text-emerald-600", label: "Job" },
};

export function OpportunityList({
  opportunities,
  loading = false,
  title = "Opportunities For You",
}: OpportunityListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg border">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (opportunities.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Target className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium mb-1">No matching opportunities yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete your profile to get personalized matches.
          </p>
          <Button size="sm" asChild>
            <Link to="/offers">Browse All Projects</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
            <Link to="/offers">
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {opportunities.slice(0, 5).map((opp) => {
          const config = typeConfig[opp.type];
          const Icon = config.icon;

          return (
            <Link
              key={opp.id}
              to={`/offers/${opp.id}`}
              className="block p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">
                      {config.label}
                    </Badge>
                    {opp.institution && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Building className="h-2.5 w-2.5" />
                        {opp.institution}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {opp.title}
                  </h4>
                  {opp.matchReason && (
                    <p className="text-xs text-primary/80 mt-1">
                      ✓ {opp.matchReason}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {opp.budget && (
                      <span className="flex items-center gap-0.5">
                        <DollarSign className="h-3 w-3" />
                        {opp.budget.toLocaleString()}
                      </span>
                    )}
                    {opp.deadline && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(opp.deadline), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
