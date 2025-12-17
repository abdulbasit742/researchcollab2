import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MessageSquare } from "lucide-react";
import { Subscription } from "@/data/subscriptions";
import { useToast } from "@/hooks/use-toast";

interface SupportTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription;
}

const problemTypes = [
  { value: "access_issue", label: "Access Issue", description: "Can't log in or access the service" },
  { value: "password_reset", label: "Password Reset", description: "Need new login credentials" },
  { value: "billing", label: "Billing", description: "Payment or refund related" },
  { value: "other", label: "Other", description: "Any other issue" },
];

export function SupportTicketModal({ open, onOpenChange, subscription }: SupportTicketModalProps) {
  const { toast } = useToast();
  const [problemType, setProblemType] = useState<string>("access_issue");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please describe your issue",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Ticket Created",
      description: "Our support team will respond within 24 hours.",
    });
    
    setMessage("");
    setProblemType("access_issue");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Create a support ticket for {subscription.toolName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Problem Type */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">What's the issue?</Label>
            <RadioGroup value={problemType} onValueChange={setProblemType}>
              <div className="grid gap-2">
                {problemTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      problemType === type.value 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={type.value} className="mt-0.5" />
                    <div>
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Describe the issue *</Label>
            <Textarea
              id="message"
              placeholder="Please provide details about the problem you're experiencing..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Subscription Info */}
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="text-muted-foreground">Subscription ID: {subscription.id}</p>
            <p className="text-muted-foreground">Plan: {subscription.planName}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit Ticket
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
