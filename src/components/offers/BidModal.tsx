import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Send, AlertTriangle, Shield, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTrustScoreComponents } from "@/hooks/useTrustEngine";

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
  const { components } = useTrustScoreComponents();
  const [proposedPrice, setProposedPrice] = useState(suggestedBudget.toString());
  const [deliveryTime, setDeliveryTime] = useState("");
  const [message, setMessage] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [understandConsequences, setUnderstandConsequences] = useState(false);
  const [step, setStep] = useState<"form" | "confirm">("form");

  const handleProceed = () => {
    if (!proposedPrice || !deliveryTime || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    // Show confirmation step with consequences
    setStep("confirm");
  };

  const handleSubmit = () => {
    if (!understandConsequences) {
      toast({
        title: "Confirmation Required",
        description: "You must acknowledge the consequences before submitting",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bid Submitted!",
      description: "Your bid has been sent to the project owner. If accepted, you'll be held accountable for delivery.",
    });

    // Reset and close
    setProposedPrice(suggestedBudget.toString());
    setDeliveryTime("");
    setMessage("");
    setPortfolioLink("");
    setUnderstandConsequences(false);
    setStep("form");
    onOpenChange(false);
  };

  const handleBack = () => {
    setStep("form");
    setUnderstandConsequences(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setStep("form"); setUnderstandConsequences(false); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "confirm" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {step === "form" ? "Place Your Bid" : "Confirm Your Commitment"}
          </DialogTitle>
          <DialogDescription>
            {step === "form" 
              ? `Submit a bid for "${offerTitle}"`
              : "Review the consequences before committing"
            }
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <>
            <div className="space-y-4 py-4">
              {/* Trust Score Warning for Low Trust Users */}
              {(components?.total_trust_score ?? 0) < 30 && (
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
                  <CardContent className="py-3 flex items-start gap-3">
                    <Shield className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-700 dark:text-amber-400">Low Trust Score</p>
                      <p className="text-muted-foreground">Your trust score is {components?.total_trust_score ?? 0}. Completing this project successfully will significantly improve your score.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

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
              <Button onClick={handleProceed}>
                Review & Submit
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* CONFIRMATION STEP - THE FRICTION */}
            <div className="space-y-4 py-4">
              {/* Bid Summary */}
              <Card>
                <CardContent className="py-4">
                  <h4 className="font-medium mb-2">Your Bid Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">PKR {Number(proposedPrice).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery:</span>
                      <span className="font-medium">{deliveryTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CONSEQUENCES - Cannot be hidden */}
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="py-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    If you fail to deliver:
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">Trust score penalty:</span> -20 points (permanent record)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">Escrow: </span> Funds will NOT be released to you
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">Visibility:</span> Failure shown publicly on your profile
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Checkbox confirmation */}
              <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                <Checkbox
                  id="understand"
                  checked={understandConsequences}
                  onCheckedChange={(c) => setUnderstandConsequences(c === true)}
                />
                <Label
                  htmlFor="understand"
                  className="text-sm font-medium cursor-pointer"
                >
                  I understand that failure to deliver will permanently affect my trust score and be visible on my profile
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!understandConsequences}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Bid
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
