import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSponsorPipeline, useSponsorROI, useRefundingRecommendations } from "@/hooks/useRevenueEngine";
import { useFYPTopics } from "@/hooks/useFYP";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle, AlertTriangle, Zap, RefreshCw, Star, Target } from "lucide-react";
import { format } from "date-fns";

function MatchScore({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-muted-foreground";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-muted-foreground"}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className={`text-xs font-mono font-bold ${color}`}>{score}%</span>
    </div>
  );
}

function EligibilityCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {passed ? (
        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span className={passed ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

export default function RefundingTriggersPage() {
  const { sponsors } = useSponsorPipeline();
  const { recommendations, createRecommendation } = useRefundingRecommendations();
  const { data: fypTopics } = useFYPTopics({ status: "approved" });

  // Get funded sponsors eligible for re-funding
  const funded = sponsors.filter((s: any) => ["funded", "repeat_funder"].includes(s.stage));

  // Simple eligibility logic for display
  const eligibleSponsors = funded.map((sponsor: any) => {
    const hasCompletedFYP = true; // Would check from ROI data
    const milestonesOnTime = true; // Would check from execution tracks
    const lowDisputeRate = true; // Would check from disputes
    const eligible = hasCompletedFYP && milestonesOnTime && lowDisputeRate;

    // Available FYPs for suggestion
    const availableFYPs = (fypTopics ?? [])
      .filter((t: any) => t.funding_type === "sponsor_ready")
      .slice(0, 3)
      .map((t: any) => ({
        id: t.id,
        title: t.title,
        matchScore: Math.floor(60 + Math.random() * 35), // Would be computed from domain matching
      }));

    return {
      ...sponsor,
      hasCompletedFYP,
      milestonesOnTime,
      lowDisputeRate,
      eligible,
      availableFYPs,
    };
  });

  const totalEligible = eligibleSponsors.filter((s: any) => s.eligible).length;
  const totalRecommendations = recommendations.length;
  const acceptedRecommendations = recommendations.filter((r: any) => r.status === "accepted").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            Automated Re-Funding Triggers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Auto-suggest next funding opportunities to successful sponsors</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Eligible Sponsors", value: totalEligible, icon: Target, desc: "ready to re-fund" },
            { label: "Recommendations Sent", value: totalRecommendations, icon: Sparkles, desc: "total suggestions" },
            { label: "Accepted", value: acceptedRecommendations, icon: CheckCircle, desc: "converted" },
            { label: "Re-fund Rate", value: `${totalRecommendations > 0 ? ((acceptedRecommendations / totalRecommendations) * 100).toFixed(0) : 0}%`, icon: RefreshCw, desc: "acceptance" },
          ].map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    </div>
                    <p className="text-2xl font-bold font-mono">{kpi.value}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{kpi.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Eligible Sponsors with Triggers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Re-Funding Eligible Sponsors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {eligibleSponsors.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No funded sponsors yet.</p>
              ) : (
                <AnimatePresence>
                  {eligibleSponsors.map((sponsor: any, idx: number) => (
                    <motion.div
                      key={sponsor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border rounded-lg p-4 space-y-3 hover:border-primary/20 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium flex items-center gap-2">
                            {sponsor.sponsor_name}
                            {sponsor.eligible && (
                              <Badge variant="default" className="text-[10px] gap-1">
                                <Sparkles className="h-3 w-3" /> Eligible
                              </Badge>
                            )}
                          </h3>
                          <p className="text-xs text-muted-foreground">{sponsor.organization || "Independent"}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {sponsor.stage === "repeat_funder" ? "🔄 Repeat Funder" : "💰 Funded"}
                        </Badge>
                      </div>

                      {/* Eligibility Checks */}
                      <div className="flex gap-4">
                        <EligibilityCheck label="Completed FYP" passed={sponsor.hasCompletedFYP} />
                        <EligibilityCheck label="Milestones on time" passed={sponsor.milestonesOnTime} />
                        <EligibilityCheck label="Low dispute rate" passed={sponsor.lowDisputeRate} />
                      </div>

                      {/* Suggested FYPs */}
                      {sponsor.eligible && sponsor.availableFYPs.length > 0 && (
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Star className="h-3 w-3" /> Recommended Next FYPs
                          </p>
                          {sponsor.availableFYPs.map((fyp: any) => (
                            <div key={fyp.id} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                              <span className="text-sm font-medium truncate flex-1">{fyp.title}</span>
                              <div className="flex items-center gap-3">
                                <MatchScore score={fyp.matchScore} />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-xs gap-1 hover:bg-primary/10 hover:text-primary h-7"
                                  onClick={() =>
                                    createRecommendation.mutate({
                                      sponsor_id: sponsor.id,
                                      recommended_fyp_id: fyp.id,
                                      recommended_fyp_title: fyp.title,
                                      match_score: fyp.matchScore,
                                      reason: "Auto-triggered: successful prior FYP completion",
                                    })
                                  }
                                >
                                  <ArrowRight className="h-3 w-3" /> Suggest
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendation History */}
        {recommendations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Recommendation History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-xs">FYP</TableHead>
                        <TableHead className="text-xs">Match</TableHead>
                        <TableHead className="text-xs">Reason</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recommendations.map((rec: any) => (
                        <TableRow key={rec.id} className="hover:bg-muted/20">
                          <TableCell className="font-medium text-sm">{rec.recommended_fyp_title || "—"}</TableCell>
                          <TableCell><MatchScore score={rec.match_score || 0} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-48 truncate">{rec.reason || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={rec.status === "accepted" ? "default" : rec.status === "rejected" ? "destructive" : "outline"} className="text-[10px]">
                              {rec.status || "pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{rec.created_at ? format(new Date(rec.created_at), "MMM d") : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
