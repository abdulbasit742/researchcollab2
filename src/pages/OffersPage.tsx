import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Package
} from "lucide-react";
import { dummyOffers, Offer, OfferStatus } from "@/data/offers";

const statusConfig: Record<OfferStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" }> = {
  draft: { label: "Draft", variant: "secondary" },
  sent: { label: "Sent", variant: "default" },
  accepted: { label: "Accepted", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  in_progress: { label: "In Progress", variant: "warning" },
  delivered: { label: "Delivered", variant: "default" },
  completed: { label: "Completed", variant: "success" },
  disputed: { label: "Disputed", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" },
};

export default function OffersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Simulate current user viewing their offers
  const sentOffers = dummyOffers.filter(o => o.senderId.includes("researcher"));
  const receivedOffers = dummyOffers.filter(o => o.receiverId && o.visibility === "private");

  const filterOffers = (offers: Offer[]) => {
    return offers.filter(offer => {
      const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const renderOfferCard = (offer: Offer, type: "sent" | "received") => (
    <motion.div
      key={offer.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card variant="interactive">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={type === "sent" ? offer.receiverAvatar : offer.senderAvatar} />
                <AvatarFallback>
                  {(type === "sent" ? offer.receiverName : offer.senderName)?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{offer.title}</CardTitle>
                <CardDescription className="mt-1">
                  {type === "sent" ? `To: ${offer.receiverName || "Public"}` : `From: ${offer.senderName}`}
                </CardDescription>
              </div>
            </div>
            <Badge variant={statusConfig[offer.status].variant}>
              {statusConfig[offer.status].label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {offer.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{offer.category}</Badge>
            {offer.requiredSkills.slice(0, 2).map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
            {offer.requiredSkills.length > 2 && (
              <Badge variant="outline">+{offer.requiredSkills.length - 2}</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold">
                ${offer.budget}{offer.budgetType === "hourly" ? "/hr" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Due: {new Date(offer.deadline).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              {offer.visibility === "private" ? (
                <Badge variant="secondary" className="text-xs">Private</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Public</Badge>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="gap-3">
          <Link to={`/offers/${offer.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
          {offer.status === "accepted" || offer.status === "in_progress" ? (
            <Link to={`/workroom/${offer.id}`}>
              <Button>
                Open Work Room
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          ) : null}
        </CardFooter>
      </Card>
    </motion.div>
  );

  return (
    <MainLayout>
      <div className="gradient-hero py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">
              <FileText className="h-3 w-3 mr-1" />
              Offers Management
            </Badge>
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
              Manage Your{" "}
              <span className="text-gradient">Project Offers</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Track offers you've sent and received. Manage bids, accept projects, 
              and collaborate with researchers and students.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-16">
        <Tabs defaultValue="received" className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList>
              <TabsTrigger value="received" className="gap-2">
                <Package className="h-4 w-4" />
                Received ({receivedOffers.length})
              </TabsTrigger>
              <TabsTrigger value="sent" className="gap-2">
                <Send className="h-4 w-4" />
                Sent ({sentOffers.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search offers..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="received" className="space-y-6">
            {filterOffers(receivedOffers).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Offers Received</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't received any offers yet. Complete your profile to get matched!
                  </p>
                  <Link to="/matches">
                    <Button>Find Matches</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterOffers(receivedOffers).map((offer) => renderOfferCard(offer, "received"))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-6">
            {filterOffers(sentOffers).length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Offers Sent</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't sent any offers yet. Find matches and send your first offer!
                  </p>
                  <Link to="/matches">
                    <Button>Find Matches</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterOffers(sentOffers).map((offer) => renderOfferCard(offer, "sent"))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
