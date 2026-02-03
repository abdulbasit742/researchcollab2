import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { useDealRoom, useAcceptDeal, useSubmitProposal } from "@/hooks/useDealRoom";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  AlertTriangle,
  FileText,
  MessageSquare,
  Target,
  TrendingUp,
  Lock,
  Unlock,
  Plus,
  Send,
} from "lucide-react";
import { formatPKR } from "@/lib/currency";
import { DealMilestoneTracker } from "@/components/deals/DealMilestoneTracker";
import { DealDecisionLog } from "@/components/deals/DealDecisionLog";
import { EscrowStatusCard } from "@/components/deals/EscrowStatusCard";
import { TrustImpactPreview } from "@/components/deals/TrustImpactPreview";

export default function DealDetailPage() {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trustProfile } = useMyTrustProfile();
  
  const { data: deal, isLoading } = useDealRoom(dealId || "");
  const acceptDeal = useAcceptDeal();
  const submitProposal = useSubmitProposal();

  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalDeliverables, setProposalDeliverables] = useState("");
  const [proposalDeadline, setProposalDeadline] = useState("");

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="h-10 w-24 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!deal) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Deal Room Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This deal may have been completed, cancelled, or you don't have access.
          </p>
          <Button asChild>
            <Link to="/deals">View Your Deals</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isInitiator = user?.id === deal.initiator_id;
  const isCounterparty = user?.id === deal.counterparty_id;
  const isInProgress = deal.status === "in_progress";
  const isNegotiating = deal.status === "negotiating";
  const isCompleted = deal.status === "completed";

  const handleAcceptDeal = async () => {
    if (!deal) return;
    
    await acceptDeal.mutateAsync({
      room_id: deal.id,
      amount: deal.agreed_amount || 0,
      deliverables: deal.deliverables,
      deadline: deal.agreed_deadline || undefined,
      counterparty_id: isInitiator ? deal.counterparty_id : deal.initiator_id,
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
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <DealStatusBadge status={deal.status} />
                        {deal.escrow_locked > 0 && (
                          <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600">
                            <Lock className="h-3 w-3" />
                            Escrow Protected
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl">{deal.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Deal Room with {isInitiator ? deal.counterparty_name : deal.initiator_name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Deal Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="font-semibold">{deal.agreed_amount ? formatPKR(deal.agreed_amount) : "TBD"}</p>
                      <p className="text-xs text-muted-foreground">Agreed Amount</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="font-semibold">
                        {deal.agreed_deadline 
                          ? new Date(deal.agreed_deadline).toLocaleDateString() 
                          : "TBD"}
                      </p>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Target className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="font-semibold">{deal.deliverables.length}</p>
                      <p className="text-xs text-muted-foreground">Deliverables</p>
                    </div>
                  </div>

                  {/* Deliverables */}
                  {deal.deliverables.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Agreed Deliverables
                      </h4>
                      <ul className="space-y-1">
                        {deal.deliverables.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
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
                          <Button variant="outline" className="gap-1">
                            <Plus className="h-4 w-4" />
                            Submit Counter-Proposal
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Proposal</DialogTitle>
                            <DialogDescription>
                              Update the terms of this deal.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Amount (PKR)</Label>
                              <Input
                                type="number"
                                value={proposalAmount}
                                onChange={(e) => setProposalAmount(e.target.value)}
                                placeholder="Enter amount"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Deliverables (one per line)</Label>
                              <Textarea
                                value={proposalDeliverables}
                                onChange={(e) => setProposalDeliverables(e.target.value)}
                                placeholder="Enter deliverables..."
                                rows={4}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Deadline</Label>
                              <Input
                                type="date"
                                value={proposalDeadline}
                                onChange={(e) => setProposalDeadline(e.target.value)}
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowProposalModal(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSubmitProposal} disabled={submitProposal.isPending}>
                                Submit Proposal
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        onClick={handleAcceptDeal}
                        disabled={acceptDeal.isPending || !deal.agreed_amount}
                        className="gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
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
              milestones={deal.milestones}
              isInProgress={isInProgress}
              userRole={isInitiator ? "initiator" : "executor"}
            />

            {/* Decision Log */}
            <DealDecisionLog decisions={deal.decision_log} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Escrow Status */}
            <EscrowStatusCard
              lockedAmount={deal.escrow_locked}
              releasedAmount={deal.escrow_released}
              totalAmount={deal.agreed_amount || 0}
              status={deal.status}
            />

            {/* Trust Impact Preview */}
            <TrustImpactPreview
              currentScore={trustProfile?.trust_score || 0}
              estimatedImpact={isCompleted ? 5 : 0}
              dealStatus={deal.status}
            />

            {/* Communication */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/messages/${deal.id}`}>
                    Open Chat
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function DealStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    negotiating: { label: "Negotiating", variant: "secondary" },
    agreed: { label: "Agreed", variant: "default" },
    in_progress: { label: "In Progress", variant: "default" },
    completed: { label: "Completed", variant: "default" },
    cancelled: { label: "Cancelled", variant: "outline" },
    disputed: { label: "Disputed", variant: "destructive" },
  };

  const { label, variant } = config[status] || { label: status, variant: "secondary" as const };

  return <Badge variant={variant}>{label}</Badge>;
}
