import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVisibilityBoosts, BoostType } from "@/hooks/useVisibilityBoosts";
import { formatPKR } from "@/lib/currency";
import { Zap, User, Briefcase, FolderKanban, Target } from "lucide-react";

const BOOST_OPTIONS: { type: BoostType; label: string; description: string; icon: any }[] = [
  { type: "profile", label: "Profile Boost", description: "Appear higher in search & matching results", icon: User },
  { type: "bid", label: "Bid Boost", description: "Make your proposals stand out to clients", icon: Briefcase },
  { type: "project", label: "Project Boost", description: "Get more visibility for your posted project", icon: FolderKanban },
  { type: "opportunity", label: "Opportunity Boost", description: "Increase matching relevance score", icon: Target },
];

interface BoostVisibilityModalProps {
  targetId?: string;
  defaultType?: BoostType;
  trigger?: React.ReactNode;
}

export function BoostVisibilityModal({ targetId, defaultType, trigger }: BoostVisibilityModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<BoostType | null>(defaultType ?? null);
  const { createBoost, boostCosts, activeBoosts } = useVisibilityBoosts();

  const handleBoost = () => {
    if (!selectedType) return;
    createBoost.mutate(
      { boostType: selectedType, targetId },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <Zap className="h-4 w-4" /> Boost Visibility
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Boost Visibility</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {BOOST_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = activeBoosts.some((b: any) => b.boost_type === opt.type);
            return (
              <Card
                key={opt.type}
                className={`cursor-pointer transition-colors ${selectedType === opt.type ? "border-primary bg-primary/5" : ""} ${isActive ? "opacity-50" : ""}`}
                onClick={() => !isActive && setSelectedType(opt.type)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatPKR(boostCosts[opt.type])}</p>
                    {isActive && <Badge variant="outline" className="text-xs">Active</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBoost}
            disabled={!selectedType || createBoost.isPending}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            {createBoost.isPending ? "Boosting..." : "Activate Boost"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
