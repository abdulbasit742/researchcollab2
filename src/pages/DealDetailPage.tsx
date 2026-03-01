import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { useDealRoom, useAcceptDeal, useSubmitProposal, DealMilestone } from "@/hooks/useDealRoom";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Shield,
  Clock,
  DollarSign,
  CheckCircle,
  FileText,
  MessageSquare,
  Target,
  Lock,
  Plus,
} from "lucide-react";
import { formatPKR } from "@/lib/currency";
import { DealMilestoneTracker } from "@/components/deals/DealMilestoneTracker";
import { DealDecisionLog } from "@/components/deals/DealDecisionLog";
import { EscrowStatusCard } from "@/components/deals/EscrowStatusCard";
import { TrustImpactPreview } from "@/components/deals/TrustImpactPreview";
import { DealStateVisualizer } from "@/components/deals/DealStateVisualizer";
import { ExecutionHealthPanel } from "@/components/deals/ExecutionHealthPanel";
import { useDealDecisions } from "@/hooks/useDealDecisions";
import { PageTransition } from "@/components/layout/PageTransition";

export default function DealDetailPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trustProfile } = useMyTrustProfile();
  const { data: decisions = [] } = useDealDecisions(dealId);
  
  const { data: deal, isLoading, error } = useDealRoom(dealId || "");
  const acceptDeal = useAcceptDeal();
  const submitProposal = useSubmitProposal();

  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalDeliverables, setProposalDeliverables] = useState("");
  const [proposalDeadline, setProposalDeadline] = useState("");

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 max-w-6xl">
          <Skeleton className="h-8 w-20 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-48" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container py-16 text-center max-w-lg mx-auto">
          <Shield className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h1 className="text-xl font-bold mb-2">Error Loading Deal</h1>
          <p className="text-sm text-muted-foreground mb-4">{(error as Error).message}</p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!deal) {
    return (
      <MainLayout>
        <div className="container py-16 text-center max-w-lg mx-auto">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold mb-2">Deal Not Found</h1>
          <p className="text-sm text-muted-foreground mb-4">
            This deal may have been completed, cancelled, or you don't have access.
          </p>
          <Button asChild>
            <Link to="/deals">View Your Deals</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isBuyer = user?.id === deal.buyer_id;
  const otherPartyId = isBuyer ? deal.seller_id : deal.buyer_id;
  const isInProgress = deal.status === "in_progress";
  const isNegotiating = deal.status === "negotiating";
  const isCompleted = deal.status === "completed";

  const terms = deal.terms as Record<string, any> | null;
  const deliverables: string[] = terms?.deliverables || [];
  const agreedDeadline: string | null = terms?.deadline || null;
  const escrowLocked = deal.escrow_amount || 0;
  const escrowReleased = deal.escrow_status === "released" ? (deal.escrow_amount || 0) : 0;
  const milestones = (deal.milestones as unknown as DealMilestone[]) || [];

  // Compute real health metrics
  const completedMs = milestones.filter(m => m.status === "approved").length;
  const submittedMs = milestones.filter(m => m.status === "submitted").length;
  const rejectedMs = milestones.filter(m => m.status === "rejected").length;

  const handleAcceptDeal = async () => {
    if (!deal) return;
    await acceptDeal.mutateAsync({
      room_id: deal.id,
      offer_id: deal.offer_id || deal.id,
      amount: deal.agreed_amount || 0,
      deliverables,
      deadline: agreedDeadline || undefined,
      counterparty_id: otherPartyId,
    });
  };

  const handleSubmitProposal = async () => {
    if (!deal) return;
    await submitProposal.mutateAsync({
      room_id: deal.id,
      amount: parseFloat(proposalAmount) || 0,
      deliverables: proposalDeliverables.split("\n").filter(d => d.trim()),
      deadline: proposalDeadline || undefined,
    });
    setShowProposalModal(false);
  };

  return (
    <MainLayout>
      <PageTransition>
      <div className="container py-6 max-w-6xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>

        {/* Deal State Visualizer */}
        <DealStateVisualizer
          currentStatus={deal.status}
          escrowFunded={escrowLocked > 0}
          className="mb-6"
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Deal Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <StatusBadge status={deal.status} size="lg" />
                        {escrowLocked > 0 && (
                          <StatusBadge status="escrow_funded" label="Escrow Protected" size="lg" />
                        )}
                      </div>
                      <CardTitle className="text-xl">{deal.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Deal Room • Created {new Date(deal.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Deal Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <DollarSign className="h-4 w-4 mx-auto text-primary mb-1" />
                      <p className="font-semibold text-sm">{deal.agreed_amount ? formatPKR(deal.agreed_amount) : "TBD"}</p>
                      <p className="text-[10px] text-muted-foreground">Agreed Amount</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <Clock className="h-4 w-4 mx-auto text-primary mb-1" />
                      <p className="font-semibold text-sm">
                        {agreedDeadline ? new Date(agreedDeadline).toLocaleDateString() : "TBD"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Deadline</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 text-center">
                      <Target className="h-4 w-4 mx-auto text-primary mb-1" />
                      <p className="font-semibold text-sm">{deliverables.length}</p>
                      <p className="text-[10px] text-muted-foreground">Deliverables</p>
                    </div>
                  </div>

                  {/* Deliverables */}
                  {deliverables.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Agreed Deliverables
                      </h4>
                      <ul className="space-y-1">
                        {deliverables.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isNegotiating && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Plus className="h-3.5 w-3.5" />
                            Counter-Proposal
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Proposal</DialogTitle>
                            <DialogDescription>Update the terms of this deal.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Amount (PKR)</Label>
                              <Input type="number" value={proposalAmount} onChange={(e) => setProposalAmount(e.target.value)} placeholder="Enter amount" />
                            </div>
                            <div className="space-y-2">
                              <Label>Deliverables (one per line)</Label>
                              <Textarea value={proposalDeliverables} onChange={(e) => setProposalDeliverables(e.target.value)} placeholder="Enter deliverables..." rows={4} />
                            </div>
                            <div className="space-y-2">
                              <Label>Deadline</Label>
                              <Input type="date" value={proposalDeadline} onChange={(e) => setProposalDeadline(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowProposalModal(false)}>Cancel</Button>
                              <Button onClick={handleSubmitProposal} disabled={submitProposal.isPending}>Submit Proposal</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        onClick={handleAcceptDeal}
                        disabled={acceptDeal.isPending || !deal.agreed_amount}
                        size="sm"
                        className="gap-1"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Accept & Lock Escrow
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Milestones */}
            <DealMilestoneTracker
              dealId={deal.id}
              milestones={milestones}
              isInProgress={isInProgress}
              userRole={isBuyer ? "initiator" : "executor"}
            />

            {/* Decision Log */}
            <DealDecisionLog decisions={decisions} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Escrow Status */}
            <EscrowStatusCard
              lockedAmount={escrowLocked}
              releasedAmount={escrowReleased}
              totalAmount={deal.agreed_amount || 0}
              status={deal.status}
            />

            {/* Execution Health */}
            <ExecutionHealthPanel
              totalMilestones={milestones.length}
              completedMilestones={completedMs}
              submittedMilestones={submittedMs}
              disputedMilestones={rejectedMs}
            />

            {/* Trust Impact Preview */}
            <TrustImpactPreview
              currentScore={trustProfile?.trust_score || 0}
              estimatedImpact={isCompleted ? 5 : 0}
              dealStatus={deal.status}
            />

            {/* Communication */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to={`/messages/${deal.id}`}>
                    Open Chat
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </PageTransition>
    </MainLayout>
  );
}
