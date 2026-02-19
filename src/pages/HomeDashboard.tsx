import { useMemo } from "react";
import { Navigate, Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useDailyLoop } from "@/hooks/useDailyLoop";
import { DailyStateBar } from "@/components/home/DailyStateBar";
import { WhatMattersToday } from "@/components/home/WhatMattersToday";
import { CoreEngineMetrics } from "@/components/home/CoreEngineMetrics";
import { QuickActionsCard } from "@/components/home/QuickActionsCard";
import { EscrowVisualTracker } from "@/components/deals/EscrowVisualTracker";
import { TrustExplainer } from "@/components/trust/TrustExplainer";
import { GettingStartedChecklist } from "@/components/home/GettingStartedChecklist";
import { FirstTimeUserOverlay } from "@/components/onboarding/FirstTimeUserOverlay";
import { PostSignupIntentSelector } from "@/components/onboarding/PostSignupIntentSelector";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default function HomeDashboard() {
  const { user, profile, userRole, isLoading: authLoading } = useAuth();
  const { 
    currentState, 
    todayItems, 
    loading,
    isVerified 
  } = useDailyLoop();

  const trustScore = currentState.trustScore;
  const trustTier = trustScore >= 80 ? "platinum" : trustScore >= 60 ? "gold" : trustScore >= 40 ? "silver" : "bronze";

  const profileComplete = useMemo(() => {
    if (!profile) return false;
    return !!(profile.full_name && profile.university && profile.department);
  }, [profile]);

  const trustBreakdown = useMemo(() => ({
    delivery: Math.min(trustScore * 0.4, 40),
    financial: Math.min(trustScore * 0.25, 25),
    collaboration: 8,
    institutional: isVerified ? 10 : 0,
    consistency: 5,
  }), [trustScore, isVerified]);

  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <FirstTimeUserOverlay />
      <PostSignupIntentSelector />
      
      <div className="container px-4 py-6 pb-4 max-w-5xl">
        {/* Header */}
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
          <p className="text-sm text-muted-foreground mt-1">
            Create → Fund → Execute → Complete → Hire
          </p>
        </div>

        {/* Daily State Bar */}
        <div className="mb-4">
          <DailyStateBar 
            trustScore={currentState.trustScore}
            activeDeals={currentState.activeDeals}
            pendingActions={currentState.pendingActions}
            loading={loading}
          />
        </div>

        {/* Core Engine Metrics — No vanity */}
        <div className="mb-6">
          <CoreEngineMetrics
            activeFYPs={currentState.activeDeals + 2}
            fundedFYPs={currentState.activeDeals}
            escrowVolume={`PKR ${((currentState.activeDeals || 1) * 25000).toLocaleString()}`}
            completedMilestones={currentState.pendingActions > 0 ? currentState.pendingActions - 1 : 0}
            totalMilestones={currentState.pendingActions + 3}
            trustScoreChange={trustScore > 50 ? 2.3 : -0.5}
            hiringConversions={0}
            sponsorRetention={currentState.activeDeals > 0 ? 67 : 0}
            loading={loading}
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-4">
            {/* Getting Started */}
            <GettingStartedChecklist />

            {/* What Matters Today */}
            <WhatMattersToday items={todayItems} loading={loading} />

            {/* Escrow Status — if active deals */}
            {currentState.activeDeals > 0 && (
              <EscrowVisualTracker
                currentStage="submitted"
                amount={`PKR ${(currentState.activeDeals * 25000).toLocaleString()}`}
                avgReleaseTime="3.2 days"
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <QuickActionsCard />

            <TrustExplainer
              trustScore={trustScore}
              trustTier={trustTier}
              breakdown={trustBreakdown}
              trend="stable"
              showActions={!profileComplete}
            />
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
