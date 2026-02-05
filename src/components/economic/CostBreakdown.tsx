/**
 * Cost Breakdown Component
 * Shows transparent fee breakdown with value explanation
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCostTransparency } from "@/hooks/useCostTransparency";
import { formatPKR } from "@/lib/currency";
import { 
  Shield, 
  Server, 
  Users, 
  Sparkles, 
  AlertTriangle,
  ChevronDown,
  CheckCircle,
  Info,
  TrendingDown
} from "lucide-react";
import { useState } from "react";

interface CostBreakdownProps {
  amount: number;
  trustScore?: number;
  monthlyVolume?: number;
  category?: string;
  showComparison?: boolean;
}

const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  "Platform Operations": <Server className="h-4 w-4" />,
  "Trust System": <Shield className="h-4 w-4" />,
  "Escrow Protection": <AlertTriangle className="h-4 w-4" />,
  "Community Development": <Sparkles className="h-4 w-4" />,
  "Safety Reserve": <Users className="h-4 w-4" />,
};

export function CostBreakdown({
  amount,
  trustScore = 50,
  monthlyVolume = 0,
  category,
  showComparison = true,
}: CostBreakdownProps) {
  const { calculateFee, compareToMarket, explainComponent } = useCostTransparency();
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

  const fee = calculateFee(amount, trustScore, monthlyVolume, category);
  const comparison = showComparison ? compareToMarket(fee.netFee, amount) : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">What Your Fee Enables</CardTitle>
        <CardDescription>
          Transparent breakdown of platform costs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fee Summary */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Transaction Amount</p>
            <p className="text-lg font-bold">{formatPKR(amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Platform Fee</p>
            <p className="text-lg font-bold">{formatPKR(fee.netFee)}</p>
            <p className="text-xs text-muted-foreground">{fee.effectiveRate.toFixed(1)}% effective rate</p>
          </div>
        </div>

        {/* Discounts Applied */}
        {(fee.trustDiscount > 0 || fee.volumeDiscount > 0) && (
          <div className="flex flex-wrap gap-2">
            {fee.trustDiscount > 0 && (
              <Badge variant="secondary" className="text-green-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                Trust Discount: -{formatPKR(fee.trustDiscount)}
              </Badge>
            )}
            {fee.volumeDiscount > 0 && (
              <Badge variant="secondary" className="text-green-600">
                <TrendingDown className="h-3 w-3 mr-1" />
                Volume Discount: -{formatPKR(fee.volumeDiscount)}
              </Badge>
            )}
          </div>
        )}

        <Separator />

        {/* Component Breakdown */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">WHERE YOUR FEE GOES</p>
          
          {fee.breakdown.components.map((component) => (
            <Collapsible 
              key={component.name}
              open={expandedComponent === component.name}
              onOpenChange={(open) => setExpandedComponent(open ? component.name : null)}
            >
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="text-muted-foreground">
                    {COMPONENT_ICONS[component.name] || <Info className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{component.name}</p>
                    <p className="text-xs text-muted-foreground">{component.purpose}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPKR(component.amount)}</p>
                    <p className="text-xs text-muted-foreground">{component.percentage.toFixed(0)}%</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedComponent === component.name ? "rotate-180" : ""}`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-9 mr-4 mb-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground whitespace-pre-line">
                  {explainComponent(component.name)}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <Separator />

        {/* Value Explanation */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">WHAT THIS ENABLES</p>
          <div className="space-y-2">
            {fee.breakdown.valueExplanation.whatThisEnables.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Who Benefits */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">WHO BENEFITS</p>
          <div className="space-y-1">
            {fee.breakdown.valueExplanation.whoBenefits.map((beneficiary, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{beneficiary.beneficiary}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2">
                        <Progress value={beneficiary.percentage} className="w-16 h-1.5" />
                        <span className="w-8 text-right">{beneficiary.percentage}%</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{beneficiary.impact}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </div>

        {/* Market Comparison */}
        {comparison && comparison.savings > 0 && (
          <>
            <Separator />
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-600">
                  You're saving {formatPKR(comparison.savings)}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {comparison.savingsPercentage.toFixed(0)}% less than industry average ({formatPKR(comparison.marketAverage)})
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function CostBreakdownMini({ amount, trustScore = 50 }: { amount: number; trustScore?: number }) {
  const { calculateFee } = useCostTransparency();
  const fee = calculateFee(amount, trustScore, 0);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span>Fee: {formatPKR(fee.netFee)}</span>
            <Info className="h-3 w-3" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium mb-1">What this enables:</p>
          <ul className="text-xs space-y-0.5">
            <li>• Secure escrow protection</li>
            <li>• Trust verification</li>
            <li>• Dispute resolution</li>
            <li>• Platform improvements</li>
          </ul>
          {fee.trustDiscount > 0 && (
            <p className="text-xs text-green-500 mt-1">
              Trust discount applied: -{formatPKR(fee.trustDiscount)}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
