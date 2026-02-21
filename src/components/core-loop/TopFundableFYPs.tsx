import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPKR } from "@/lib/currency";
import { Trophy, Star, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export interface FundableFYP {
  id: string;
  title: string;
  student_name: string;
  department?: string;
  budget: number;
  trust_score: number;
  milestone_count: number;
  faculty_approved: boolean;
  match_score: number; // 0-100 ranking
}

interface TopFundableFYPsProps {
  fyps: FundableFYP[];
  className?: string;
}

function getTrustTier(score: number) {
  if (score >= 85) return { label: "Platinum", color: "text-violet-500 bg-violet-500/10 border-violet-500/30" };
  if (score >= 70) return { label: "Gold", color: "text-amber-500 bg-amber-500/10 border-amber-500/30" };
  if (score >= 50) return { label: "Silver", color: "text-slate-400 bg-slate-400/10 border-slate-400/30" };
  return { label: "Bronze", color: "text-orange-600 bg-orange-600/10 border-orange-600/30" };
}

export function TopFundableFYPs({ fyps, className }: TopFundableFYPsProps) {
  const sorted = [...fyps].sort((a, b) => b.match_score - a.match_score).slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Top Fundable FYPs
          <Badge variant="outline" className="ml-auto text-xs gap-1 border-primary/30 text-primary">
            <TrendingUp className="h-3 w-3" /> Ranked
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No fundable FYPs available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((fyp, i) => {
              const tier = getTrustTier(fyp.trust_score);
              const isTop = i === 0;

              return (
                <motion.div
                  key={fyp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm",
                    isTop && "border-amber-500/30 bg-amber-500/5"
                  )}
                >
                  {/* Rank */}
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    isTop ? "bg-amber-500 text-amber-950" : "bg-muted text-muted-foreground"
                  )}>
                    {i + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold truncate">{fyp.title}</h4>
                      {fyp.faculty_approved && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-500/30 text-emerald-600 shrink-0">
                          ✓ Faculty
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{fyp.student_name}</span>
                      {fyp.department && (
                        <span className="text-xs text-muted-foreground">• {fyp.department}</span>
                      )}
                      <Badge className={cn("text-[10px] px-1.5 py-0", tier.color)}>
                        {tier.label} ({fyp.trust_score})
                      </Badge>
                    </div>
                  </div>

                  {/* Budget & Action */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{formatPKR(fyp.budget)}</p>
                    <p className="text-[10px] text-muted-foreground">{fyp.milestone_count} milestones</p>
                  </div>

                  <Link to={`/earn/${fyp.id}`}>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
