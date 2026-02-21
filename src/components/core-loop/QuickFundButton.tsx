import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatPKR } from "@/lib/currency";
import { Zap, Shield, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface QuickFundButtonProps {
  projectTitle: string;
  amount: number;
  studentTrustScore?: number;
  onFund?: () => Promise<void>;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function QuickFundButton({
  projectTitle,
  amount,
  studentTrustScore,
  onFund,
  disabled,
  size = "default",
  className,
}: QuickFundButtonProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  const platformFee = amount * 0.08;
  const escrowTotal = amount;
  const isHighTrust = (studentTrustScore || 0) >= 75;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onFund?.();
      setStep(3);
    } catch {
      // error handled upstream
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setOpen(false);
  };

  return (
    <>
      <Button
        size={size}
        className={cn(
          "gap-2 font-bold shadow-lg",
          isHighTrust && "bg-gradient-to-r from-primary to-primary/80 shadow-primary/25",
          className
        )}
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        <Zap className="h-4 w-4" />
        Quick Fund
        {isHighTrust && (
          <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
            ⚡ High Trust
          </Badge>
        )}
      </Button>

      <Dialog open={open} onOpenChange={reset}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              {step === 3 ? "Funding Confirmed!" : "Quick Fund"}
            </DialogTitle>
            <DialogDescription>
              {step === 1 && "Review project details"}
              {step === 2 && "Confirm escrow deposit"}
              {step === 3 && "Funds locked in escrow"}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="font-semibold text-sm mb-1">{projectTitle}</h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-2xl font-bold">{formatPKR(amount)}</span>
                    {isHighTrust && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                        ⚡ High-Trust Student
                      </Badge>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={reset}>Cancel</Button>
                  <Button onClick={() => setStep(2)} className="gap-2">
                    Continue <span className="text-xs opacity-70">1/2</span>
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Project Amount</span>
                    <span className="font-semibold">{formatPKR(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee (8%)</span>
                    <span className="text-muted-foreground">{formatPKR(platformFee)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm font-bold">
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      Escrow Deposit
                    </span>
                    <span>{formatPKR(escrowTotal)}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
                  <Shield className="h-3.5 w-3.5 inline mr-1.5" />
                  Funds are locked until you approve milestones. Full protection guaranteed.
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={handleConfirm} disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Lock in Escrow
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                >
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
                </motion.div>
                <div>
                  <p className="font-semibold text-lg">{formatPKR(escrowTotal)} Locked</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Escrow secured for "{projectTitle}"
                  </p>
                </div>
                <Button onClick={reset} className="w-full">Done</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
