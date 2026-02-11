import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatPKR } from "@/lib/currency";
import {
  Zap,
  DollarSign,
  Clock,
  FileText,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface QuickApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    title: string;
    budget_min: number | null;
    budget_max: number | null;
    deadline_days: number | null;
    bid_count?: number;
  };
  onSuccess?: () => void;
}

export function QuickApplyModal({ open, onOpenChange, project, onSuccess }: QuickApplyModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState(
    project.budget_min ? String(Math.round((project.budget_min + (project.budget_max || project.budget_min)) / 2)) : ""
  );
  const [days, setDays] = useState(project.deadline_days ? String(Math.max(1, project.deadline_days - 2)) : "7");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Suggested price band
  const suggestedMin = project.budget_min ? Math.round(project.budget_min * 0.85) : null;
  const suggestedMax = project.budget_max ? Math.round(project.budget_max * 0.95) : null;

  // Simple success probability
  const getSuccessProbability = () => {
    const amt = parseFloat(amount) || 0;
    const bids = project.bid_count || 0;
    let probability = 70;

    // Lower price = higher chance
    if (project.budget_min && amt <= project.budget_min) probability += 10;
    if (project.budget_max && amt > project.budget_max) probability -= 20;

    // Competition
    if (bids > 10) probability -= 15;
    else if (bids > 5) probability -= 8;
    else if (bids <= 2) probability += 10;

    // Timeline
    const d = parseInt(days) || 0;
    if (project.deadline_days && d < project.deadline_days) probability += 5;

    // Message quality
    if (message.length > 50) probability += 5;

    return Math.max(10, Math.min(95, probability));
  };

  const handleSubmit = async () => {
    if (!user || !amount) return;
    setSubmitting(true);

    try {
      const idempotencyKey = `bid_${user.id}_${project.id}_${Date.now()}`;
      
      const { error } = await supabase.from("earning_bids").insert([{
        project_id: project.id,
        bidder_id: user.id,
        amount: parseFloat(amount),
        delivery_days: parseInt(days) || 7,
        message: message || null,
        status: "pending",
        idempotency_key: idempotencyKey,
      }]);

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already bid", description: "You've already submitted a bid for this project.", variant: "destructive" });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Bid submitted! 🎉", description: "You'll be notified when the project owner responds." });
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const probability = getSuccessProbability();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-primary" />
            Quick Apply
          </DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{project.title}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Price Input */}
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              Your Price (PKR) *
            </label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {suggestedMin && suggestedMax && (
              <p className="text-xs text-muted-foreground mt-1">
                Suggested range: {formatPKR(suggestedMin)} – {formatPKR(suggestedMax)}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Delivery (days) *
            </label>
            <Input
              type="number"
              placeholder="Days to deliver"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>

          {/* Quick Message */}
          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Cover Note
            </label>
            <Textarea
              placeholder="I can deliver this because..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Success Probability */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Success Probability</span>
            </div>
            <Badge variant={probability >= 60 ? "default" : probability >= 40 ? "secondary" : "destructive"}>
              {probability}%
            </Badge>
          </div>

          {/* Scarcity signals */}
          <div className="flex flex-wrap gap-2">
            {(project.bid_count || 0) > 0 && (
              <Badge variant="outline" className="text-xs">
                {project.bid_count} bids submitted
              </Badge>
            )}
            {project.deadline_days && project.deadline_days <= 5 && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                Deadline soon
              </Badge>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={!amount || submitting} className="w-full gap-2">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {submitting ? "Submitting..." : "Submit Bid"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
