import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useConsequenceLedger } from "@/hooks/useAccountability";
import { useOutcomeFeed } from "@/hooks/useOutcomeFeed";
import { IdentityCard } from "@/components/home/IdentityCard";
import { NextActionCard } from "@/components/home/NextActionCard";
import { OpportunityList } from "@/components/home/OpportunityList";
import { RecentActivityCard } from "@/components/home/RecentActivityCard";
import { QuickActionsCard } from "@/components/home/QuickActionsCard";
import { Card, CardContent } from "@/components/ui/card";

export default function HomeDashboard() {
  const { user, profile, userRole, isLoading: authLoading } = useAuth();
  const { trustProfile, loading: trustLoading } = useMyTrustProfile();
  const { data: ledger } = useConsequenceLedger();
  const { feedItems, loading: feedLoading } = useOutcomeFeed();

  // Calculate trust info
  const trustScore = trustProfile?.trust_score ?? 0;
  const trustTier = trustScore >= 80 ? "platinum" : trustScore >= 60 ? "gold" : trustScore >= 40 ? "silver" : "bronze";
  const isVerified = trustProfile?.is_verified_student || trustProfile?.is_verified_researcher || false;

  // Profile completeness check
  const profileComplete = useMemo(() => {
    if (!profile) return false;
    return !!(profile.full_name && profile.university && profile.department);
  }, [profile]);

  // Convert feed items to opportunities format
  const opportunities = useMemo(() => {
    return feedItems.slice(0, 5).map((item) => ({
      id: item.id,
      type: item.item_type === "grant_opportunity" ? "grant" as const :
            item.item_type === "collaboration_request" ? "collaboration" as const :
            "project" as const,
      title: item.title,
      description: item.summary || undefined,
      matchReason: item.relevance_tags?.[0] ? `Matches your ${item.relevance_tags[0]} skills` : undefined,
      tags: item.relevance_tags,
    }));
  }, [feedItems]);

  // Mock recent activity (would come from real data in production)
  const recentActivity = useMemo(() => {
    const activities = [];
    if (ledger?.projects_completed && ledger.projects_completed > 0) {
      activities.push({
        id: "completed",
        type: "project_completed" as const,
        title: `Completed ${ledger.projects_completed} project${ledger.projects_completed > 1 ? "s" : ""}`,
        createdAt: new Date().toISOString(),
      });
    }
    if (ledger?.total_escrow_released && ledger.total_escrow_released > 0) {
      activities.push({
        id: "earned",
        type: "escrow_released" as const,
        title: "Escrow payments released",
        amount: ledger.total_escrow_released,
        createdAt: new Date().toISOString(),
      });
    }
    return activities;
  }, [ledger]);

  const loading = authLoading || trustLoading;

  // Redirect unauthenticated users
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <div className="container py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-muted-foreground text-sm">
            Your professional command center. Find work, build trust, prove reliability.
          </p>
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
              hasProjects={(ledger?.projects_completed || 0) > 0}
              hasBids={false}
              trustScore={trustScore}
            />

            {/* Opportunities */}
            <OpportunityList
              opportunities={opportunities}
              loading={feedLoading}
              title="Opportunities For You"
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Quick Actions */}
            <QuickActionsCard />

            {/* Recent Activity */}
            <RecentActivityCard activities={recentActivity} loading={loading} />

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
