import { useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useConsequenceLedger } from "@/hooks/useAccountability";
import { useOpportunityEngine } from "@/hooks/useOpportunityEngine";
import { IdentityCard } from "@/components/home/IdentityCard";
import { NextActionCard } from "@/components/home/NextActionCard";
import { QuickActionsCard } from "@/components/home/QuickActionsCard";
import { WorkLedgerSummary } from "@/components/home/WorkLedgerSummary";
import { NetworkContext } from "@/components/home/NetworkContext";
import { OpportunityList } from "@/components/home/OpportunityList";
import { RecentActivityCard } from "@/components/home/RecentActivityCard";
import { OpportunityMatchCard } from "@/components/opportunity/OpportunityMatchCard";
import { ProfileViewsCard } from "@/components/profile/ProfileViewsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BarChart3,
} from "lucide-react";

export default function HomeDashboard() {
  const { user, profile, userRole, isLoading: authLoading } = useAuth();
  const { trustProfile, loading: trustLoading } = useMyTrustProfile();
  const { data: ledger, isLoading: ledgerLoading } = useConsequenceLedger();
  const { data: opportunities = [], isLoading: oppsLoading } = useOpportunityEngine({
    sortBy: "relevance",
  });

  // Calculate trust info
  const trustScore = trustProfile?.trust_score ?? 0;
  const trustTier = trustScore >= 80 ? "platinum" : trustScore >= 60 ? "gold" : trustScore >= 40 ? "silver" : "bronze";
  const isVerified = trustProfile?.is_verified_student || trustProfile?.is_verified_researcher || false;

  // Profile completeness check
  const profileComplete = useMemo(() => {
    if (!profile) return false;
    return !!(profile.full_name && profile.university && profile.department);
  }, [profile]);

  // Work ledger stats
  const workStats = useMemo(() => {
    const projectsInProgress = (ledger?.projects_attempted || 0) - 
                               (ledger?.projects_completed || 0) - 
                               (ledger?.projects_failed || 0) - 
                               (ledger?.projects_abandoned || 0);
    return {
      projectsCompleted: ledger?.projects_completed || 0,
      projectsFailed: ledger?.projects_failed || 0,
      projectsInProgress: Math.max(0, projectsInProgress),
      totalEarned: ledger?.total_escrow_released || 0,
      escrowSuccessRate: ledger?.escrow_success_rate || 0,
      onTimeRate: ledger?.on_time_rate || 0,
      trustTrend: "stable" as const, // Would need trust_score_history for trend
    };
  }, [ledger]);

  // Top matching opportunities
  const topOpportunities = useMemo(() => {
    return opportunities.slice(0, 5);
  }, [opportunities]);

  const loading = authLoading || trustLoading || ledgerLoading;

  // Redirect unauthenticated users
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <div className="container py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
                {isVerified && (
                  <Badge variant="outline" className="text-primary border-primary/30 gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground text-sm">
                Find opportunities, complete work, prove reliability.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Identity Card */}
            <IdentityCard
              profile={profile}
              role={userRole?.role}
              trustScore={trustScore}
              trustTier={trustTier}
              isVerified={isVerified}
            />

            {/* Next Action */}
            <NextActionCard
              profileComplete={profileComplete}
              isVerified={isVerified}
              hasProjects={workStats.projectsCompleted > 0}
              hasBids={false}
              trustScore={trustScore}
            />

            {/* Opportunities Radar - Main Focus */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Opportunity Radar
                    <Badge variant="secondary" className="text-[10px] gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" />
                      Personalized
                    </Badge>
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                    <Link to="/opportunities">
                      View All
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Matched based on your skills, trust, and institution.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {oppsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-28 w-full" />
                    ))}
                  </div>
                ) : topOpportunities.length === 0 ? (
                  <EmptyState
                    icon={Target}
                    title="No opportunities matched yet"
                    description="Complete your profile and add skills to get personalized matches."
                    actionLabel="Complete Profile"
                    actionHref="/profile"
                  />
                ) : (
                  <div className="space-y-3">
                    {topOpportunities.map((opp) => (
                      <OpportunityMatchCard key={opp.id} opportunity={opp} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <QuickActionsCard />

            {/* Work Ledger Summary */}
            <WorkLedgerSummary
              {...workStats}
              trustScore={trustScore}
              loading={loading}
            />

            {/* Progress Link */}
            <Card>
              <CardContent className="py-4">
                <Button variant="outline" className="w-full gap-2" asChild>
                  <Link to="/progress">
                    <BarChart3 className="h-4 w-4" />
                    View Career Dashboard
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Track trust trajectory, economic outcomes & AI career guidance
                </p>
              </CardContent>
            </Card>

            {/* Profile Views */}
            <ProfileViewsCard />

            {/* Network Context */}
            <NetworkContext
              sharedInstitutions={1}
              mutualCollaborators={[]}
              sharedProjects={workStats.projectsCompleted}
              loading={loading}
            />

            {/* Platform Philosophy */}
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="py-4 text-center">
                <p className="text-xs text-muted-foreground italic">
                  "LinkedIn shows who you claim to be.
                  <br />
                  <span className="font-medium text-foreground">RCollab proves what you've done.</span>"
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
