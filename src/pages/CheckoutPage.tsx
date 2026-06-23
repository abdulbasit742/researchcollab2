import { useSearchParams, Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ShieldCheck, Tag, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { getPlan, type PlanId } from "@/lib/revenue/plans";
import { Helmet } from "react-helmet-async";

export default function CheckoutPage() {
  const [params] = useSearchParams();
  const planId = (params.get("plan") as PlanId) || "student_pro";
  const credits = params.get("credits");
  const plan = getPlan(planId);
  const isCredits = !!credits;

  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [success, setSuccess] = useState(false);

  const creditPacks: Record<string, number> = { "500": 499, "2000": 1799, "5000": 3999 };
  const subtotal = isCredits ? (creditPacks[credits!] ?? 0) : plan.priceMonthly;
  const discountAmt = Math.round(subtotal * (discount / 100));
  const total = subtotal - discountAmt;

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (code === "RCOLLAB20") { setDiscount(20); toast.success("20% off applied"); }
    else if (code === "STUDENT10") { setDiscount(10); toast.success("10% off applied"); }
    else if (code === "") { toast.error("Enter a code"); }
    else { setDiscount(0); toast.error("Invalid promo code"); }
  };

  const confirm = () => {
    setSuccess(true);
    toast.success("Demo purchase recorded");
  };

  if (success) {
    return (
      <div className="container max-w-lg mx-auto py-16 px-4">
        <Card>
          <CardContent className="pt-10 pb-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold">Demo purchase complete</h2>
            <p className="text-muted-foreground text-sm">
              {isCredits ? `${credits} AI credits added to your balance.` : `Welcome to ${plan.name}.`} No real payment was processed.
            </p>
            <div className="rounded-md bg-muted/50 p-3 text-xs font-mono text-left">
              <div>Order ID: <span className="text-foreground">RC-{Date.now().toString().slice(-8)}</span></div>
              <div>Amount: PKR {total.toLocaleString()}</div>
              <div>Status: Demo / Sandbox</div>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button asChild><Link to="/billing">Go to billing</Link></Button>
              <Button variant="outline" asChild><Link to="/home">Back home</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Checkout — ResearchCollab</title></Helmet>
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" /> Demo mode</Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{isCredits ? `${credits} AI Credits Top-up` : `${plan.name} subscription`}</div>
                    <div className="text-xs text-muted-foreground">{isCredits ? "One-time purchase" : "Monthly • cancel anytime"}</div>
                  </div>
                  <div className="font-mono font-medium">PKR {subtotal.toLocaleString()}</div>
                </div>
                {!isCredits && (
                  <ul className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    {plan.features.slice(0, 4).map(f => <li key={f}>• {f}</li>)}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4" /> Promo code</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Input placeholder="Try RCOLLAB20 or STUDENT10" value={promo} onChange={(e) => setPromo(e.target.value)} />
                <Button variant="outline" onClick={applyPromo}>Apply</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment method</CardTitle>
                <CardDescription>Demo mode — no real card needed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
                  Payment integration coming soon.<br />Clicking confirm will record a sandbox order.
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Subtotal" value={`PKR ${subtotal.toLocaleString()}`} />
                {discount > 0 && <Row label={`Discount (${discount}%)`} value={`− PKR ${discountAmt.toLocaleString()}`} subtle />}
                <Row label="Tax" value="PKR 0" subtle />
                <Separator />
                <Row label="Total" value={`PKR ${total.toLocaleString()}`} bold />
                <Button className="w-full mt-3" onClick={confirm}>
                  Confirm demo purchase
                </Button>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground justify-center pt-1">
                  <ShieldCheck className="h-3 w-3" /> Escrow-backed • Refundable
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, subtle, bold }: { label: string; value: string; subtle?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${subtle ? "text-muted-foreground" : ""} ${bold ? "font-semibold text-base" : ""}`}>
      <span>{label}</span><span className="font-mono">{value}</span>
    </div>
  );
}
