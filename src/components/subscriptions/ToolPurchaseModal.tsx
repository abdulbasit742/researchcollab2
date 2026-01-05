import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Check, ShoppingCart, Shield } from "lucide-react";
import { ToolPlan, getPlansByToolId } from "@/data/subscriptions";
import { Tool } from "@/data/tools";
import { useToast } from "@/hooks/use-toast";

interface ToolPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tool: Tool;
}

const planTypeLabels: Record<string, string> = {
  "semi-private": "Semi-Private (Shared)",
  "private": "Private (Dedicated)",
  "byo": "BYO (Your Account)",
  "team": "Team Plan",
};

export function ToolPurchaseModal({ open, onOpenChange, tool }: ToolPurchaseModalProps) {
  const { toast } = useToast();
  const plans = getPlansByToolId(tool.id);
  
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || "");
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [byoEmail, setByoEmail] = useState("");
  const [byoDetails, setByoDetails] = useState("");

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const selectedDurationOption = selectedPlan?.durations.find(d => d.months === selectedDuration);
  const finalPrice = selectedDurationOption?.price || selectedPlan?.monthlyPrice || 0;

  const handlePurchase = () => {
    if (selectedPlan?.type === "byo" && !byoEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your account email for BYO plan",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order Created!",
      description: `Your order for ${tool.name} (${selectedPlan?.name}) has been created. Redirecting to payment...`,
    });
    
    onOpenChange(false);
  };

  if (plans.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Subscribe to {tool.name}
          </DialogTitle>
          <DialogDescription>
            Choose your plan and subscription duration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Plan</Label>
            <RadioGroup value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <div className="grid gap-3">
                {plans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`relative flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedPlanId === plan.id 
                        ? "border-primary bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={plan.id} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{plan.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {planTypeLabels[plan.type]}
                          </Badge>
                        </div>
                        <span className="font-bold text-lg">
                          PKR {plan.monthlyPrice.toLocaleString()}/mo
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.notes}
                      </p>
                      {plan.limits && (
                        <p className="text-xs text-amber-600 mt-1">
                          Limits: {plan.limits}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Duration Selection */}
          {selectedPlan && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Subscription Duration</Label>
              <div className="grid grid-cols-3 gap-3">
                {selectedPlan.durations.map((duration) => (
                  <button
                    key={duration.months}
                    type="button"
                    onClick={() => setSelectedDuration(duration.months)}
                    className={`relative p-4 rounded-lg border text-center transition-all ${
                      selectedDuration === duration.months
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {duration.discount && (
                      <Badge 
                        variant="premium" 
                        className="absolute -top-2 -right-2 text-xs"
                      >
                        Save {duration.discount}%
                      </Badge>
                    )}
                    <p className="font-semibold">
                      {duration.months} {duration.months === 1 ? "Month" : "Months"}
                    </p>
                    <p className="text-2xl font-bold mt-1">PKR {duration.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      PKR {Math.round(duration.price / duration.months).toLocaleString()}/mo
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BYO Account Details */}
          {selectedPlan?.type === "byo" && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label className="text-base font-semibold">Your Account Details</Label>
                <p className="text-sm text-muted-foreground">
                  We'll upgrade your existing account. Please provide your login details.
                </p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="byo-email">Your Account Email *</Label>
                    <Input
                      id="byo-email"
                      type="email"
                      placeholder="your@email.com"
                      value={byoEmail}
                      onChange={(e) => setByoEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="byo-details">Additional Details (Optional)</Label>
                    <Textarea
                      id="byo-details"
                      placeholder="Any additional information we need to know..."
                      rows={2}
                      value={byoDetails}
                      onChange={(e) => setByoDetails(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Order Summary */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <h4 className="font-semibold">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tool</span>
                <span>{tool.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Plan</span>
                <span>{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span>{selectedDuration} {selectedDuration === 1 ? "month" : "months"}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="capitalize">{selectedPlan?.deliveryMethod.replace("_", " ")}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>PKR {finalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-emerald-600">Secure & Protected</p>
              <p className="text-muted-foreground">
                Your credentials are encrypted and only visible to you. 
                Delivery typically within 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Subscribe Now - PKR {finalPrice.toLocaleString()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
