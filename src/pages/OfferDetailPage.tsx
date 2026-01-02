import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  XCircle,
  MessageSquare,
  Star,
  ExternalLink
} from "lucide-react";
import { dummyOffers, dummyBids, OfferStatus } from "@/data/offers";
import { BidModal } from "@/components/offers/BidModal";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<OfferStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Pending Response", variant: "default" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  in_progress: { label: "In Progress", variant: "warning" },
  delivered: { label: "Delivered", variant: "default" },
  completed: { label: "Completed", variant: "success" },
  disputed: { label: "Disputed", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

export default function OfferDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBidModal, setShowBidModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterBudget, setCounterBudget] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  const offer = dummyOffers.find((o) => o.id === id);
  const bids = dummyBids.filter((b) => b.offerId === id);

  if (!offer) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Offer not found</h1>
          <Link to="/offers">
            <Button className="mt-4">Back to Offers</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const handleAccept = () => {
    toast({
      title: "Offer Accepted!",
      description: "You've accepted this offer. A work room has been created.",
    });
    navigate(`/workroom/${offer.id}`);
  };

  const handleReject = () => {
    toast({
      title: "Offer Declined",
      description: "You've declined this offer.",
    });
    navigate("/offers");
  };

  const handleCounter = () => {
    toast({
      title: "Counter Offer Sent",
      description: "Your counter offer has been sent to the client.",
    });
    setShowCounterModal(false);
  };

  const handleAcceptBid = (bidId: string, bidderName: string) => {
    toast({
      title: "Bid Accepted!",
      description: `You've accepted ${bidderName}'s bid. A work room has been created.`,
    });
    navigate(`/workroom/${offer.id}`);
  };

  // Determine if current user is receiver or sender (simulated)
  const isReceiver = offer.visibility === "private" && offer.receiverId;
  const isPublicOffer = offer.visibility === "public";

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
                      <Badge variant={statusConfig[offer.status].variant} className="mb-2">
                        {statusConfig[offer.status].label}
                      </Badge>
                      <CardTitle className="text-2xl">{offer.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Posted on {new Date(offer.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{offer.category}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{offer.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {offer.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p className="font-semibold text-lg flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-primary" />
                        {offer.budget}{offer.budgetType === "hourly" ? "/hr" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(offer.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-semibold capitalize">{offer.budgetType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Visibility</p>
                      <p className="font-semibold capitalize">{offer.visibility}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions for Receiver */}
            {isReceiver && offer.status === "sent" && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Response</CardTitle>
                  <CardDescription>
                    Review the offer and choose your response
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button onClick={handleAccept} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Accept Offer
                  </Button>
                  <Dialog open={showCounterModal} onOpenChange={setShowCounterModal}>
                    <DialogTrigger asChild>
                      <Button variant="secondary" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Send Counter Offer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Counter Offer</DialogTitle>
                        <DialogDescription>
                          Propose different terms for this offer
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Proposed Budget ($)</Label>
                          <Input
                            type="number"
                            value={counterBudget}
                            onChange={(e) => setCounterBudget(e.target.value)}
                            placeholder={offer.budget.toString()}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea
                            value={counterMessage}
                            onChange={(e) => setCounterMessage(e.target.value)}
                            placeholder="Explain your counter offer..."
                            rows={4}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowCounterModal(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCounter}>
                          Send Counter
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" onClick={handleReject} className="gap-2">
                    <XCircle className="h-4 w-4" />
                    Decline
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Bids Section for Public Offers */}
            {isPublicOffer && bids.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Bids ({bids.length})</CardTitle>
                  <CardDescription>
                    Review bids from interested students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bids.map((bid) => (
                    <div key={bid.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={bid.bidderAvatar} />
                            <AvatarFallback>{bid.bidderName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{bid.bidderName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Bid: ${bid.proposedPrice} • {bid.deliveryTime}
                            </p>
                          </div>
                        </div>
                        <Badge variant={bid.status === "pending" ? "secondary" : bid.status === "accepted" ? "success" : "destructive"}>
                          {bid.status}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {bid.message}
                      </p>
                      <Link 
                        to={`/u/${bid.bidderId}`}
                        className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Portfolio
                      </Link>
                      {bid.status === "pending" && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            onClick={() => handleAcceptBid(bid.id, bid.bidderName)}
                          >
                            Accept Bid
                          </Button>
                          <Button size="sm" variant="outline">
                            Message
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Place Bid for Public Offers (Student View) */}
            {isPublicOffer && offer.status === "sent" && (
              <Card>
                <CardContent className="p-6">
                  <Button onClick={() => setShowBidModal(true)} className="w-full">
                    Place Your Bid
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posted By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={offer.senderAvatar} />
                    <AvatarFallback>{offer.senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{offer.senderName}</h4>
                    <p className="text-sm text-muted-foreground">Researcher</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>4.8 Rating</span>
                  </div>
                  <p className="text-muted-foreground">
                    12 projects completed
                  </p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </CardContent>
            </Card>

            {offer.receiverName && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned To</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={offer.receiverAvatar} />
                      <AvatarFallback>{offer.receiverName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{offer.receiverName}</h4>
                      <p className="text-sm text-muted-foreground">Student</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <BidModal
        open={showBidModal}
        onOpenChange={setShowBidModal}
        offerTitle={offer.title}
        offerId={offer.id}
        suggestedBudget={offer.budget}
        budgetType={offer.budgetType}
      />
    </MainLayout>
  );
}
