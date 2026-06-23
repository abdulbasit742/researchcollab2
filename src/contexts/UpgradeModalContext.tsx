import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PLANS, type PlanId } from "@/lib/revenue/plans";

interface UpgradePrompt {
  feature: string;
  reason: string;
  currentLimit?: string;
  recommendedPlan: PlanId;
}

interface UpgradeModalContextValue {
  prompt: (p: UpgradePrompt) => void;
}

const Ctx = createContext<UpgradeModalContextValue | null>(null);

export function UpgradeModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<UpgradePrompt | null>(null);

  const prompt = useCallback((p: UpgradePrompt) => {
    setData(p);
    setOpen(true);
  }, []);

  const plan = data ? PLANS.find((pl) => pl.id === data.recommendedPlan) : null;

  return (
    <Ctx.Provider value={{ prompt }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="secondary" className="text-[10px]">PREMIUM FEATURE</Badge>
            </div>
            <DialogTitle>{data?.feature ?? "Premium feature"}</DialogTitle>
            <DialogDescription>{data?.reason}</DialogDescription>
          </DialogHeader>

          {data?.currentLimit && (
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Your current plan: <span className="font-medium text-foreground">{data.currentLimit}</span>
            </div>
          )}

          {plan && (
            <div className="rounded-lg border-2 border-primary/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">PKR {plan.priceMonthly.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground">/month</div>
                </div>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 pt-1">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-primary">✓</span>{f}</li>
                ))}
              </ul>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button asChild className="w-full" onClick={() => setOpen(false)}>
              <Link to={`/checkout?plan=${data?.recommendedPlan ?? "student_pro"}`}>
                Upgrade now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <div className="flex gap-2 w-full">
              <Button asChild variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                <Link to="/pricing">Compare plans</Link>
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
                Continue limited
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

export function useUpgradeModal() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Safe no-op fallback so consumers don't crash if provider missing
    return { prompt: (_: UpgradePrompt) => {} };
  }
  return ctx;
}
