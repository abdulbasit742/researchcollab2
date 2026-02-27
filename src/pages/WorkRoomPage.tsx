import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  MessageSquare, 
  Video,
  Upload,
  Clock,
  DollarSign,
  FileText,
  Calendar,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MilestoneTracker, MilestoneData } from "@/components/wallet/MilestoneTracker";
import { WalletCard, WalletCardData } from "@/components/wallet/WalletCard";
import { useWallet, useMilestones } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/AuthContext";
import { useFundEscrow, useOpenDispute } from "@/hooks/useEscrowActions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  delivery_days: number | null;
  status: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
}

export default function WorkRoomPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { wallet } = useWallet();
  const { milestones, updateMilestoneStatus } = useMilestones(offerId);
  const fundEscrow = useFundEscrow();
  const openDispute = useOpenDispute();

  const [offer, setOffer] = useState<Offer | null>(null);
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (offerId) {
      fetchOffer();
    }
  }, [offerId]);

  const fetchOffer = async () => {
    if (!offerId) return;

    setLoading(true);
    try {
      const [offerRes, escrowRes] = await Promise.all([
        supabase.from("offers").select("*").eq("id", offerId).maybeSingle(),
        supabase.from("escrows" as any).select("*").eq("deal_id", offerId).maybeSingle(),
      ]);

      if (offerRes.error) throw offerRes.error;
      setOffer(offerRes.data);
      setEscrow(escrowRes.data);
    } catch (err) {
      console.error("Error fetching offer:", err);
    } finally {
      setLoading(false);
    }
  };

  const isSponsor = user?.id === offer?.sender_id;
  const isExecutor = user?.id === offer?.recipient_id;
  const userRole = isSponsor ? "client" : "provider";

  const handleMilestoneUpdate = async (milestoneId: string, status: MilestoneData["status"]) => {
    const result = await updateMilestoneStatus(milestoneId, status);
    if (result.success) {
      toast({
        title: "Milestone Updated",
        description: `Milestone status changed to ${status}`,
      });
    }
  };

  // Transform milestones to MilestoneData format
  const transformedMilestones: MilestoneData[] = milestones.map(m => ({
    ...m,
    status: m.status as MilestoneData["status"],
  }));

  const escrowTotal = transformedMilestones
    .filter(m => m.status !== "released")
    .reduce((sum, m) => sum + m.amount, 0);

  const walletData: WalletCardData | null = wallet ? {
    id: wallet.id,
    userId: wallet.user_id,
    availableBalance: wallet.available_balance,
    escrowBalance: wallet.escrow_balance,
    pendingBalance: wallet.pending_balance,
    totalEarned: wallet.total_earned,
    totalSpent: wallet.total_spent,
    currency: wallet.currency,
  } : null;

  const statusTimeline = [
    { status: "Offer Accepted", date: offer?.created_at ? new Date(offer.created_at).toLocaleDateString() : "Pending", completed: true },
    { status: "Escrow Funded", date: offer?.created_at ? new Date(offer.created_at).toLocaleDateString() : "Pending", completed: true },
    { status: "Work In Progress", date: "Current", completed: true, current: true },
    { status: "All Milestones Complete", date: "Pending", completed: false },
    { status: "Project Closed", date: "Pending", completed: false },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Skeleton className="h-10 w-24 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-8 w-64" />
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!offer) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Work Room not found</h1>
          <Link to="/offers">
            <Button className="mt-4">Back to Offers</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="warning">In Progress</Badge>
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Escrow Protected
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">{offer.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Work Room for your project collaboration
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Escrow Summary */}
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-amber-500" />
                        <div>
                          <p className="font-semibold">Funds in Escrow</p>
                          <p className="text-sm text-muted-foreground">
                            Protected until milestone approval
                          </p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold">PKR {escrowTotal.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="font-semibold">PKR {offer.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Budget</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="font-semibold">
                        {offer.delivery_days || "-"} days
                      </p>
                      <p className="text-xs text-muted-foreground">Delivery Time</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="font-semibold">{transformedMilestones.length}</p>
                      <p className="text-xs text-muted-foreground">Milestones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Milestone Tracker */}
            {transformedMilestones.length > 0 ? (
              <MilestoneTracker
                milestones={transformedMilestones}
                totalBudget={offer.price}
                userRole={userRole}
                onMilestoneUpdate={handleMilestoneUpdate}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">No Milestones Set</h3>
                  <p className="text-sm text-muted-foreground">
                    This project doesn't have milestones configured yet.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Dispute Section */}
            {isExecutor && transformedMilestones.some(m => m.status === 'submitted' || m.status === 'approved') && (
              <Card className="border-destructive/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Issue with a milestone?</p>
                      <p className="text-xs text-muted-foreground">Open a dispute to freeze escrow and request resolution</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        const submittedMs = transformedMilestones.find(m => m.status === 'submitted');
                        if (submittedMs && user) {
                          openDispute.mutate({
                            milestone_id: submittedMs.id,
                            user_id: user.id,
                            reason: 'Deliverable does not meet requirements',
                          });
                        }
                      }}
                      disabled={openDispute.isPending}
                    >
                      Open Dispute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Upload Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Files & Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">
                    Drag & drop files here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Support for documents, images, and archives
                  </p>
                  <Button variant="outline" className="mt-4">
                    Upload Files
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Communication Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Open Chat
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Video className="h-4 w-4" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusTimeline.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${
                          item.current 
                            ? "bg-primary ring-4 ring-primary/20" 
                            : item.completed 
                              ? "bg-primary" 
                              : "bg-muted-foreground/30"
                        }`} />
                        {index < statusTimeline.length - 1 && (
                          <div className={`w-px h-8 ${
                            item.completed ? "bg-primary" : "bg-border"
                          }`} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-medium ${
                          item.current ? "text-primary" : ""
                        }`}>
                          {item.status}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wallet Preview */}
            {walletData && <WalletCard wallet={walletData} variant="compact" />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
