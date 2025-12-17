import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/data/users";

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  targetUser: UserProfile | null;
}

export function ConnectModal({ isOpen, onClose, onSend, targetUser }: ConnectModalProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSend(message);
    setMessage("");
    setIsLoading(false);
  };

  if (!targetUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Connection Request</DialogTitle>
          <DialogDescription>
            Introduce yourself and explain why you'd like to connect.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={targetUser.avatar} />
            <AvatarFallback>
              {targetUser.name.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-semibold">{targetUser.name}</h4>
            <p className="text-sm text-muted-foreground">
              {targetUser.type === "student" 
                ? `${targetUser.department} • ${targetUser.university}`
                : `${(targetUser as any).title} • ${(targetUser as any).university}`
              }
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="connect-message">Why are you connecting?</Label>
          <Textarea
            id="connect-message"
            placeholder="Hi! I noticed we share interests in... I'd love to collaborate on..."
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">
            {message.length}/500 characters
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!message.trim() || isLoading}>
            {isLoading ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
