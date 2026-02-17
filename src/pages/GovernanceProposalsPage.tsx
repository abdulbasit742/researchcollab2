import { Helmet } from "react-helmet-async";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGovernanceProposals, useGovernanceInfluence, useCrisisEvents } from "@/hooks/useGovernanceEconomy";
import { Shield, Vote, AlertTriangle, Clock, CheckCircle, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline", simulation: "secondary", discussion: "secondary", voting: "default",
  ai_review: "secondary", activation_window: "default", active: "default", rejected: "destructive",
  expired: "destructive", rolled_back: "destructive",
};

const GovernanceProposalsPage = () => {
  const { proposals, isLoading } = useGovernanceProposals();
  const { data: influence } = useGovernanceInfluence();
  const { data: crises } = useCrisisEvents();
  const activeCrises = (crises || []).filter((c) => c.status === "active");

  return (
    <MainLayout>
      <Helmet><title>Governance Proposals | RCollab</title></Helmet>
      <div className="container max-w-6xl py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Governance Proposals</h1>
          <p className="text-muted-foreground mt-1">Trust-weighted governance with AI constitutional compliance.</p>
        </div>

        {activeCrises.length > 0 && (
          <Card className="border-destructive">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-medium text-destructive">{activeCrises.length} active crisis event(s) — proposal moratorium may be in effect.</span>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Your GIU Balance</p>
              <p className="text-3xl font-bold">{Number(influence?.giu_balance || 0).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Governance Influence Units</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Active Proposals</p>
              <p className="text-3xl font-bold">{proposals.filter((p) => !["rejected", "expired", "rolled_back"].includes(p.status)).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">In Voting</p>
              <p className="text-3xl font-bold">{proposals.filter((p) => p.status === "voting").length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Proposals</CardTitle>
            <CardDescription>Full lifecycle: Draft → Simulation → Discussion → Vote → AI Review → Activation</CardDescription>
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No governance proposals yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {proposals.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-sm text-muted-foreground mt-1 line-clamp-1">{(p as any).description || p.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">{(p as any).proposal_type?.replace("_", " ") || "general"}</Badge>
                      <Badge variant={STATUS_COLORS[p.status] || "secondary"}>{p.status.replace("_", " ")}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GovernanceProposalsPage;
