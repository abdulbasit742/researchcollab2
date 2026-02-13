import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Crown, Briefcase, User, ArrowRight, Shield, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/currency";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PaymentMethodModal from "@/components/payment/PaymentMethodModal";

interface SubscriptionCheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const planConfigs = [
  {
    name: "Basic",
    dbName: "Basic",
    price: 0,
    yearlyPrice: 0,
    icon: User,
    color: "text-muted-foreground",
    borderColor: "border-border",
    features: [
      "Access to public tools directory",
      "3 bids/month",
      "1,000 free AI words/month",
      "Basic profile",
      "Community support",
    ],
  },
  {
    name: "Career",
    dbName: "Career",
    price: 499,
    yearlyPrice: 4990,
    icon: Briefcase,
    color: "text-amber-500",
    borderColor: "border-amber-500/50",
    popular: true,
    features: [
      "Everything in Basic",
      "Unlimited bids",
      "10,000 free AI words/month",
      "1 free peer review/month",
      "Verified university badge (.edu)",
      "Priority matching",
      "Discounted AI tools",
      "Email support",
    ],
  },
  {
    name: "Business",
    dbName: "Business",
    price: 1999,
    yearlyPrice: 19990,
    icon: Crown,
    color: "text-primary",
    borderColor: "border-primary/50",
    features: [
      "Everything in Career",
      "50,000 free AI words/month",
      "3 free peer reviews/month",
      "Verified badge + spotlight",
      "Post unlimited projects",
      "Advanced analytics",
      "Priority support",
      "API access",
    ],
  },
];

type BillingCycle = "monthly" | "yearly";
type Step = "select" | "summary" | "processing" | "success";

export function SubscriptionCheckoutModal({ open, onOpenChange, onSuccess }: SubscriptionCheckoutModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("Career");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [step, setStep] = useState<Step>("select");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const plan = planConfigs.find((p) => p.name === selectedPlan)!;
  const price = billingCycle === "monthly" ? plan.price : plan.yearlyPrice;
  const monthlyEquivalent = billingCycle === "yearly" ? Math.round(plan.yearlyPrice / 12) : plan.price;
  const savingsPercent = billingCycle === "yearly" && plan.price > 0
    ? Math.round((1 - plan.yearlyPrice / (plan.price * 12)) * 100)
    : 0;

  const handleContinueToSummary = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to subscribe.", variant: "destructive" });
      return;
    }
    if (plan.price === 0) {
      handleFreeActivation();
      return;
    }
    setStep("summary");
  };

  const handleFreeActivation = async () => {
    if (!user) return;
    setStep("processing");
    setIsProcessing(true);
    try {
      // Cancel existing active subscriptions
      await supabase
        .from("user_subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("status", "active");

      // Get Basic tier id
      const { data: tier } = await supabase
        .from("subscription_tiers")
        .select("id")
        .eq("name", "Basic")
        .single();

      if (tier) {
        await supabase.from("user_subscriptions").insert({
          user_id: user.id,
          tier_id: tier.id,
          billing_cycle: "monthly",
          status: "active",
        });
      }

      setStep("success");
      setTimeout(() => {
        onSuccess?.();
        resetModal();
      }, 2000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setStep("select");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToPayment = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentModal(false);
    setStep("processing");
    setIsProcessing(true);

    try {
      if (!user) throw new Error("Not authenticated");

      // Cancel existing active subscriptions
      await supabase
        .from("user_subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("status", "active");

      // Get tier id
      const { data: tier } = await supabase
        .from("subscription_tiers")
        .select("id")
        .eq("name", plan.dbName)
        .single();

      if (!tier) throw new Error("Plan not found");

      const expiresAt = new Date(
        Date.now() + (billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
      ).toISOString();

      const { error } = await supabase.from("user_subscriptions").insert({
        user_id: user.id,
        tier_id: tier.id,
        billing_cycle: billingCycle,
        status: "active",
        expires_at: expiresAt,
      });

      if (error) throw error;

      setStep("success");
      toast({
        title: "Subscription Activated! 🎉",
        description: `You're now on the ${plan.name} plan.`,
      });

      setTimeout(() => {
        onSuccess?.();
        resetModal();
      }, 2500);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setStep("summary");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setStep("select");
    setSelectedPlan("Career");
    setBillingCycle("monthly");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!isProcessing) onOpenChange(v); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {step === "select" && "Choose Your Plan"}
              {step === "summary" && "Order Summary"}
              {step === "processing" && "Activating..."}
              {step === "success" && "Welcome Aboard!"}
            </DialogTitle>
            {step === "select" && (
              <DialogDescription>Select a plan and billing cycle</DialogDescription>
            )}
          </DialogHeader>

          {/* Step 1: Plan Selection */}
          {step === "select" && (
            <div className="space-y-5 py-2">
              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all",
                    billingCycle === "monthly" ? "bg-background shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all relative",
                    billingCycle === "yearly" ? "bg-background shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Yearly
                  <Badge variant="success" className="absolute -top-2 -right-2 text-[10px] px-1.5">
                    Save 17%
                  </Badge>
                </button>
              </div>

              {/* Plan Cards */}
              <div className="space-y-3">
                {planConfigs.map((p) => {
                  const Icon = p.icon;
                  const displayPrice = billingCycle === "monthly" ? p.price : p.yearlyPrice;
                  const isSelected = selectedPlan === p.name;
                  return (
                    <Card
                      key={p.name}
                      className={cn(
                        "cursor-pointer transition-all",
                        isSelected ? `ring-2 ring-primary ${p.borderColor}` : "hover:border-muted-foreground/30"
                      )}
                      onClick={() => setSelectedPlan(p.name)}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className={cn("p-2 rounded-lg bg-muted", p.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{p.name}</span>
                            {p.popular && (
                              <Badge variant="secondary" className="text-[10px]">Popular</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {p.features.slice(0, 2).join(" · ")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold">{displayPrice === 0 ? "Free" : formatPKR(displayPrice)}</p>
                          <p className="text-xs text-muted-foreground">
                            {displayPrice === 0 ? "forever" : billingCycle === "monthly" ? "/mo" : "/yr"}
                          </p>
                        </div>
                        {isSelected && <Check className="h-5 w-5 text-primary shrink-0" />}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Selected Plan Features */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs font-semibold mb-2">What's included in {plan.name}:</p>
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button className="w-full" onClick={handleContinueToSummary}>
                {plan.price === 0 ? "Activate Basic Plan" : "Continue"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Payment Summary */}
          {step === "summary" && (
            <div className="space-y-5 py-2">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center gap-3">
                  <plan.icon className={cn("h-8 w-8", plan.color)} />
                  <div>
                    <p className="font-bold text-lg">{plan.name} Plan</p>
                    <p className="text-xs text-muted-foreground">
                      {billingCycle === "monthly" ? "Monthly" : "Annual"} billing
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan</span>
                    <span>{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billing</span>
                    <span className="capitalize">{billingCycle}</span>
                  </div>
                  {billingCycle === "yearly" && savingsPercent > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Savings</span>
                      <span>~{savingsPercent}% off ({formatPKR(plan.price * 12 - plan.yearlyPrice)} saved)</span>
                    </div>
                  )}
                  {billingCycle === "yearly" && (
                    <div className="flex justify-between text-muted-foreground text-xs">
                      <span>Equivalent to</span>
                      <span>{formatPKR(monthlyEquivalent)}/mo</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPKR(price)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-emerald-600">Secure Checkout</p>
                  <p className="text-muted-foreground">
                    Cancel anytime. Your subscription stays active until the end of your billing period.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep("select")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleProceedToPayment}>
                  Pay {formatPKR(price)}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === "processing" && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Activating your {plan.name} plan...</p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">You're on {plan.name}! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                Your subscription is now active. Enjoy all your new features!
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PaymentMethodModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        amount={price}
        description={`${plan.name} Plan - ${billingCycle === "monthly" ? "Monthly" : "Annual"}`}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
}
