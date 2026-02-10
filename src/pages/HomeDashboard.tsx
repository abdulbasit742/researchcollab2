import { useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyLoop } from "@/hooks/useDailyLoop";
import { useOpportunityEngine } from "@/hooks/useOpportunityEngine";
import { DailyStateBar } from "@/components/home/DailyStateBar";
import { WhatMattersToday } from "@/components/home/WhatMattersToday";
import { WhatChanged } from "@/components/home/WhatChanged";
import { IdentityCard } from "@/components/home/IdentityCard";
import { QuickActionsCard } from "@/components/home/QuickActionsCard";
import { OpportunityMatchCard } from "@/components/opportunity/OpportunityMatchCard";
import { TrustExplainer } from "@/components/trust/TrustExplainer";
import { PlatformTrustBanner } from "@/components/trust/TrustSignals";
import { GettingStartedChecklist } from "@/components/home/GettingStartedChecklist";
import { FirstTimeUserOverlay } from "@/components/onboarding/FirstTimeUserOverlay";
import { AISuggestionCard } from "@/components/ai/AISuggestionCard";
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
} from "lucide-react";

export default function HomeDashboard() {
  const { user, profile, userRole, isLoading: authLoading } = useAuth();
  const { 
    currentState, 
    todayItems, 
    recentChanges, 
    loading,
    isVerified 
  } = useDailyLoop();
  const { data: opportunities = [], isLoading: oppsLoading } = useOpportunityEngine({
    sortBy: "relevance",
  });

  // Trust info derived from daily loop
  const trustScore = currentState.trustScore;
  const trustTier = trustScore >= 80 ? "platinum" : trustScore >= 60 ? "gold" : trustScore >= 40 ? "silver" : "bronze";

  // Profile completeness check
  const profileComplete = useMemo(() => {
    if (!profile) return false;
    return !!(profile.full_name && profile.university && profile.department);
  }, [profile]);

  // Trust breakdown for explainer
  const trustBreakdown = useMemo(() => ({
    delivery: Math.min(trustScore * 0.4, 40),
    financial: Math.min(trustScore * 0.25, 25),
    collaboration: 8,
    institutional: isVerified ? 10 : 0,
    consistency: 5,
  }), [trustScore, isVerified]);

  // Top matching opportunities
  const topOpportunities = useMemo(() => {
    return opportunities.slice(0, 3);
  }, [opportunities]);

  // Redirect unauthenticated users
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <FirstTimeUserOverlay />
      
      <div className="container py-6 max-w-5xl">
        {/* Header - Simplified */}
        <div className="mb-4">
          <h1 className="text-xl font-bold flex items-center gap-2">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            {isVerified && (
              <Badge variant="outline" className="text-primary border-primary/30 gap-1 text-xs">
                <TrendingUp className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </h1>
        </div>

        {/* System 71: Daily State Bar - Step 1 */}
        <div className="mb-4">
          <DailyStateBar 
            trustScore={currentState.trustScore}
            activeDeals={currentState.activeDeals}
            pendingActions={currentState.pendingActions}
            loading={loading}
          />
        </div>

        {/* System 71: What Changed - Step 4 (shown at top for reinforcement) */}
        {recentChanges.length > 0 && (
          <div className="mb-4">
            <WhatChanged changes={recentChanges} period="Recently" loading={loading} />
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content - Focused */}
          <div className="lg:col-span-8 space-y-4">
            {/* Getting Started Checklist for new users */}
            <GettingStartedChecklist />

            {/* System 71: What Matters Today - Step 2 & 3 */}
            <WhatMattersToday items={todayItems} loading={loading} />

            {/* Identity Card - Simplified */}
            <IdentityCard
              profile={profile}
              role={userRole?.role}
              trustScore={trustScore}
              trustTier={trustTier}
              isVerified={isVerified}
            />

            {/* Opportunities - Limited to 3 */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Matched Opportunities
                    <Badge variant="secondary" className="text-[10px] gap-0.5">
                      <Sparkles className="h-2.5 w-2.5" />
                      Top 3
                    </Badge>
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                    <Link to="/opportunities">
                      View All
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {oppsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : topOpportunities.length === 0 ? (
                  <EmptyState
                    icon={Target}
                    title="No opportunities matched yet"
                    description="Complete your profile to get personalized matches."
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

          {/* Sidebar - Minimal */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Quick Actions */}
            <QuickActionsCard />

            {/* Trust Explainer */}
            <TrustExplainer
              trustScore={trustScore}
              trustTier={trustTier}
              breakdown={trustBreakdown}
              trend="stable"
              showActions={!profileComplete}
            />

            {/* AI Daily Brief */}
            <AISuggestionCard
              title="AI Daily Brief"
              domain="general"
              action="daily-brief"
              context={{ trustScore, activeDeals: currentState.activeDeals, pendingActions: currentState.pendingActions }}
              compact
            />

            {/* Platform Trust */}
            <PlatformTrustBanner />
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
