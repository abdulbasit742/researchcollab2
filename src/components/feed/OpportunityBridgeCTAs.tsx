import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateDealRoom } from "@/hooks/useDealRoom";
import { 
  Handshake, 
  Briefcase, 
  ExternalLink, 
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface OpportunityBridgeCTAsProps {
  authorId: string;
  postId: string;
  linkedEntityType?: string | null;
  linkedEntityId?: string | null;
  disabled?: boolean;
}

export function OpportunityBridgeCTAs({
  authorId,
  postId,
  linkedEntityType,
  linkedEntityId,
  disabled = false,
}: OpportunityBridgeCTAsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createDealRoom = useCreateDealRoom();
  
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalMessage, setProposalMessage] = useState("");

  const isOwnPost = user?.id === authorId;

  const handleInviteToCollaborate = async () => {
    if (!user || disabled) return;

    try {
      await createDealRoom.mutateAsync({
        counterparty_id: authorId,
        title: "Collaboration from Signal",
        scope_description: proposalMessage || "Starting collaboration based on your recent update",
        proposed_amount: 0,
        deliverables: [],
      });
      setShowProposalModal(false);
      setProposalMessage("");
      toast.success("Collaboration request sent!");
      navigate("/deals");
    } catch (error) {
      console.error("Failed to create deal room:", error);
    }
  };

  if (isOwnPost) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Invite to Collaborate */}
      <Dialog open={showProposalModal} onOpenChange={setShowProposalModal}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5"
            disabled={disabled}
          >
            <Handshake className="h-4 w-4" />
            <span className="hidden sm:inline">Invite to Collaborate</span>
            <span className="sm:hidden">Collaborate</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a Collaboration</DialogTitle>
            <DialogDescription>
              This opens a Deal Room where you can define scope, milestones, and escrow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="proposal-message">Initial Message (optional)</Label>
              <Textarea
                id="proposal-message"
                placeholder="What would you like to collaborate on?"
                value={proposalMessage}
                onChange={(e) => setProposalMessage(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowProposalModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleInviteToCollaborate}
                disabled={createDealRoom.isPending}
              >
                {createDealRoom.isPending ? "Creating..." : "Open Deal Room"}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Propose Similar Work */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-1.5"
        disabled={disabled}
        asChild
      >
        <Link to={`/earn?inspire=${postId}`}>
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Propose Similar Work</span>
          <span className="sm:hidden">Propose</span>
        </Link>
      </Button>

      {/* View Related Opportunity (if linked) */}
      {linkedEntityId && linkedEntityType && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1.5"
          asChild
        >
          <Link to={`/${linkedEntityType}s/${linkedEntityId}`}>
            <ExternalLink className="h-4 w-4" />
            View {linkedEntityType}
          </Link>
        </Button>
      )}

      {/* Message Author */}
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-1.5"
        disabled={disabled}
        asChild
      >
        <Link to={`/messages?to=${authorId}`}>
          <MessageSquare className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
