import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, GraduationCap, Briefcase, Star, CheckCircle2, MessageSquare, Send } from "lucide-react";
import { UserProfile } from "@/data/users";
import { QuickOfferModal } from "@/components/offers/QuickOfferModal";
import { useAuth } from "@/contexts/AuthContext";
import { PremiumBadge } from "@/components/badges/PremiumBadge";
import { useIsPremium } from "@/hooks/usePremiumUsers";

interface MatchCardProps {
  user: UserProfile;
  matchScore: number;
  onConnect: () => void;
  onMessage: () => void;
  showConnectButton?: boolean;
  status?: "pending" | "accepted" | "declined" | null;
}

export function MatchCard({ 
  user, 
  matchScore, 
  onConnect, 
  onMessage, 
  showConnectButton = true,
  status = null 
}: MatchCardProps) {
  const [showOfferModal, setShowOfferModal] = useState(false);
  const { user: authUser } = useAuth();
  const premiumTier = useIsPremium(user.id);
  const isStudent = user.type === "student";
  const tags = isStudent 
    ? user.skills.slice(0, 3) 
    : user.researchInterests.slice(0, 3);

  // If viewing own profile, link to /profile, otherwise link to /u/:id
  const profileLink = authUser?.id === user.id ? "/profile" : `/u/${user.id}`;

  const getStatusBadge = () => {
    if (!status) return null;
    switch (status) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "accepted":
        return <Badge variant="success">Connected</Badge>;
      case "declined":
        return <Badge variant="secondary">Declined</Badge>;
    }
  };

  return (
    <>
      <Card variant="interactive" className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                  {premiumTier && <PremiumBadge tier={premiumTier} size="sm" />}
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    {isStudent ? (
                      <>
                        <GraduationCap className="h-3 w-3" />
                        Student
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-3 w-3" />
                        {(user as any).title}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge()}
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10">
                    <Star className="h-4 w-4 text-primary fill-primary" />
                    <span className="text-sm font-bold text-primary">{matchScore}%</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-1">
                {isStudent ? user.department : (user as any).discipline}
                {" • "}
                {isStudent ? user.university : (user as any).university}
              </p>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {user.location}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 gap-2 flex-wrap">
          <Link to={profileLink} className="flex-1 min-w-[100px]">
            <Button variant="outline" className="w-full" size="sm">
              View Profile
            </Button>
          </Link>
          {showConnectButton && status !== "accepted" && status !== "pending" && (
            <Button onClick={onConnect} size="sm" className="flex-1 min-w-[100px]">
              Connect
            </Button>
          )}
          {(status === "accepted" || !showConnectButton) && (
            <Button onClick={onMessage} size="sm" variant="secondary" className="flex-1 min-w-[100px]">
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
          )}
          <Button 
            onClick={() => setShowOfferModal(true)} 
            size="sm" 
            variant="outline"
            className="gap-1"
          >
            <Send className="h-3 w-3" />
            Send Offer
          </Button>
        </CardFooter>
      </Card>

      <QuickOfferModal
        open={showOfferModal}
        onOpenChange={setShowOfferModal}
        recipientName={user.name}
        recipientId={user.id}
      />
    </>
  );
}
