import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/currency";
import {
  Landmark,
  Shield,
  Server,
  Headphones,
  Scale,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FeeTransparencyCardProps {
  totalFeesPaid: number;
  exampleAmount?: number;
}

const FEE_BREAKDOWN = [
  {
    label: "Trust & Verification",
    percent: 30,
    icon: Shield,
    description: "Powers the 5-dimension trust engine, identity verification, and abuse detection",
  },
  {
    label: "Escrow Operations",
    percent: 25,
    icon: Scale,
    description: "Atomic fund locking, milestone releases, dispute resolution, and refund processing",
  },
  {
    label: "Platform Infrastructure",
    percent: 25,
    icon: Server,
    description: "Database hosting, edge functions, real-time updates, file storage, and security",
  },
  {
    label: "Support & Resolution",
    percent: 20,
    icon: Headphones,
    description: "Dispute mediation, user support, fraud investigation, and community safety",
  },
];

export function FeeTransparencyCard({ totalFeesPaid, exampleAmount = 10000 }: FeeTransparencyCardProps) {
  const feeRate = 10; // 10% platform fee
  const exampleFee = exampleAmount * (feeRate / 100);
  const exampleNet = exampleAmount - exampleFee;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Landmark className="h-5 w-5 text-muted-foreground" />
          Fee Transparency
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Example calculation */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Example: {formatPKR(exampleAmount)} milestone
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Milestone Amount</span>
              <span className="font-semibold">{formatPKR(exampleAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Platform Fee ({feeRate}%)</span>
              <span>-{formatPKR(exampleFee)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Provider Receives
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatPKR(exampleNet)}
              </span>
            </div>
          </div>
        </div>

        {/* Where fees go */}
        <div>
          <p className="text-xs font-semibold mb-3 flex items-center gap-1">
            Where Your Fees Go
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">
                    Every fee directly funds the systems that protect your money and reputation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </p>

          <div className="space-y-3">
            {FEE_BREAKDOWN.map((item) => {
              const Icon = item.icon;
              const allocation = totalFeesPaid > 0 ? (totalFeesPaid * item.percent) / 100 : 0;

              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.percent}%</span>
                  </div>
                  <Progress value={item.percent} className="h-1" />
                  <p className="text-[10px] text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lifetime fees */}
        {totalFeesPaid > 0 && (
          <div className="pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lifetime Fees Paid</span>
              <span className="font-semibold">{formatPKR(totalFeesPaid)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
