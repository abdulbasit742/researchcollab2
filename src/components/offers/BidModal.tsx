import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BidModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerTitle: string;
  offerId: string;
  suggestedBudget: number;
  budgetType: "fixed" | "hourly";
}

export function BidModal({ 
  open, 
  onOpenChange, 
  offerTitle, 
  offerId, 
  suggestedBudget, 
  budgetType 
}: BidModalProps) {
  const { toast } = useToast();
  const [proposedPrice, setProposedPrice] = useState(suggestedBudget.toString());
  const [deliveryTime, setDeliveryTime] = useState("");
  const [message, setMessage] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");

  const handleSubmit = () => {
    if (!proposedPrice || !deliveryTime || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bid Submitted!",
      description: "Your bid has been sent to the project owner",
    });

    // Reset and close
    setProposedPrice(suggestedBudget.toString());
    setDeliveryTime("");
    setMessage("");
    setPortfolioLink("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Place Your Bid</DialogTitle>
          <DialogDescription>
            Submit a bid for "{offerTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Proposed Price */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Proposed {budgetType === "fixed" ? "Price" : "Hourly Rate"} (PKR) *
            </Label>
            <Input
              id="price"
              type="number"
              placeholder={suggestedBudget.toString()}
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Suggested: PKR {suggestedBudget.toLocaleString()} {budgetType === "hourly" ? "/hr" : ""}
            </p>
          </div>

          {/* Delivery Time */}
          <div className="space-y-2">
            <Label htmlFor="delivery">Proposed Delivery Time *</Label>
            <Input
              id="delivery"
              placeholder="e.g., 10 days, 2 weeks"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message *</Label>
            <Textarea
              id="message"
              placeholder="Explain why you're the best fit for this project..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Portfolio Link */}
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio / Sample Work Link</Label>
            <Input
              id="portfolio"
              placeholder="https://github.com/yourusername"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Submit Bid
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
