import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Info, Target, Shield, Building2, Sparkles, TrendingUp } from "lucide-react";

interface MatchExplanation {
  skillMatch: number;
  trustCompatibility: number;
  institutionRelevance: number;
  pastOutcomeSimilarity: number;
  reasons: string[];
}

interface WhyAmISeeingThisProps {
  itemType: "opportunity" | "signal" | "person" | "institution";
  itemTitle: string;
  explanation?: MatchExplanation;
  trigger?: React.ReactNode;
}

export function WhyAmISeeingThis({
  itemType,
  itemTitle,
  explanation,
  trigger,
}: WhyAmISeeingThisProps) {
  const [open, setOpen] = useState(false);

  // Default explanation if none provided
  const defaultExplanation: MatchExplanation = {
    skillMatch: 78,
    trustCompatibility: 85,
    institutionRelevance: 45,
    pastOutcomeSimilarity: 62,
    reasons: [
      "Your skills in Data Analysis match this opportunity",
      "Your trust score qualifies you for this tier",
      "Similar projects in your history had successful outcomes",
    ],
  };

  const data = explanation || defaultExplanation;

  const getItemTypeLabel = () => {
    switch (itemType) {
      case "opportunity":
        return "opportunity";
      case "signal":
        return "update";
      case "person":
        return "connection suggestion";
      case "institution":
        return "organization";
      default:
        return "item";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-6 px-2 gap-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            Why this?
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Why am I seeing this?
          </DialogTitle>
          <DialogDescription>
            We matched this {getItemTypeLabel()} to your profile based on these factors.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Item being explained */}
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium">{itemTitle}</p>
            <Badge variant="outline" className="mt-1 text-xs capitalize">
              {itemType}
            </Badge>
          </div>

          {/* Match Factors */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Match Factors</h4>

            {/* Skill Match */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  Skill Match
                </span>
                <span className="font-medium">{data.skillMatch}%</span>
              </div>
              <Progress value={data.skillMatch} className="h-2" />
            </div>

            {/* Trust Compatibility */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  Trust Compatibility
                </span>
                <span className="font-medium">{data.trustCompatibility}%</span>
              </div>
              <Progress value={data.trustCompatibility} className="h-2" />
            </div>

            {/* Institution Relevance */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Institution Relevance
                </span>
                <span className="font-medium">{data.institutionRelevance}%</span>
              </div>
              <Progress value={data.institutionRelevance} className="h-2" />
            </div>

            {/* Past Outcome Similarity */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  Past Outcome Similarity
                </span>
                <span className="font-medium">{data.pastOutcomeSimilarity}%</span>
              </div>
              <Progress value={data.pastOutcomeSimilarity} className="h-2" />
            </div>
          </div>

          {/* Specific Reasons */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Reasons</h4>
            <ul className="space-y-1.5">
              {data.reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Trust the Algorithm Note */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Our algorithm is transparent.</span> We
              never promote paid content or use engagement tricks. Visibility is based purely on
              relevance and trust.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
