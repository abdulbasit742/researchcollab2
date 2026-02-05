/**
 * Pricing Guidance Component
 * Shows suggested pricing with explanation
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePricingEngine } from "@/hooks/usePricingEngine";
import { 
  PricingContext, 
  ProjectComplexity, 
  TimeCommitment, 
  MarketDemandLevel,
  RiskProfile 
} from "@/types/economic-engine";
import { formatPKR } from "@/lib/currency";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  Info,
  Calculator,
  Target
} from "lucide-react";

interface PricingGuidanceProps {
  trustScore?: number;
  valueUnitBalance?: number;
  outcomeSuccessRate?: number;
  skillCategory?: string;
  onPriceSelect?: (price: number) => void;
}

export function PricingGuidance({
  trustScore = 50,
  valueUnitBalance = 100,
  outcomeSuccessRate = 80,
  skillCategory = "general",
  onPriceSelect,
}: PricingGuidanceProps) {
  const { calculatePricing, getMarketDemand } = usePricingEngine();
  
  const [complexity, setComplexity] = useState<ProjectComplexity>("moderate");
  const [timeCommitment, setTimeCommitment] = useState<TimeCommitment>("weeks");
  const [riskProfile, setRiskProfile] = useState<RiskProfile>("standard");
  const [marketDemand, setMarketDemand] = useState<MarketDemandLevel>("moderate");

  const context: PricingContext = {
    userId: "",
    trustScore,
    valueUnitBalance,
    outcomeSuccessRate,
    marketDemand,
    skillCategory,
    projectComplexity: complexity,
    timeCommitment,
    riskProfile,
  };

  const guidance = calculatePricing(context);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Pricing Guidance
        </CardTitle>
        <CardDescription>
          AI-powered pricing suggestions based on your profile and market
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium mb-1 block">Complexity</label>
            <Select value={complexity} onValueChange={(v) => setComplexity(v as ProjectComplexity)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Duration</label>
            <Select value={timeCommitment} onValueChange={(v) => setTimeCommitment(v as TimeCommitment)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Suggested Range */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="text-center mb-3">
            <p className="text-xs text-muted-foreground mb-1">Suggested Price Range</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg text-muted-foreground">{formatPKR(guidance.suggestedRange.min)}</span>
              <span className="text-muted-foreground">—</span>
              <span className="text-2xl font-bold text-primary">{formatPKR(guidance.suggestedRange.optimal)}</span>
              <span className="text-muted-foreground">—</span>
              <span className="text-lg text-muted-foreground">{formatPKR(guidance.suggestedRange.max)}</span>
            </div>
          </div>

          {/* Success probability */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-muted-foreground">At Min</p>
              <p className="font-medium text-green-600">{(guidance.successProbability.atMin * 100).toFixed(0)}% success</p>
            </div>
            <div>
              <p className="text-muted-foreground">At Optimal</p>
              <p className="font-medium">{(guidance.successProbability.atOptimal * 100).toFixed(0)}% success</p>
            </div>
            <div>
              <p className="text-muted-foreground">At Max</p>
              <p className="font-medium text-amber-600">{(guidance.successProbability.atMax * 100).toFixed(0)}% success</p>
            </div>
          </div>
        </div>

        {/* Market Saturation */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium">Market Saturation</span>
            <span className="text-xs text-muted-foreground">{guidance.marketSaturation}%</span>
          </div>
          <Progress 
            value={guidance.marketSaturation} 
            className={`h-2 ${guidance.marketSaturation > 70 ? "[&>div]:bg-red-500" : guidance.marketSaturation > 40 ? "[&>div]:bg-amber-500" : ""}`}
          />
          {guidance.saturationWarning && (
            <p className="text-xs text-amber-600 mt-1 flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              {guidance.saturationWarning}
            </p>
          )}
        </div>

        {/* Pricing Factors */}
        <div>
          <p className="text-xs font-medium mb-2">Factors Affecting Your Price</p>
          <div className="space-y-2">
            {guidance.factors.map((factor, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {factor.impact === "positive" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : factor.impact === "negative" ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="flex-1">{factor.name}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{factor.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          {guidance.explanation}
        </div>

        {/* Quick select buttons */}
        {onPriceSelect && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onPriceSelect(guidance.suggestedRange.min)}
            >
              Competitive
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onPriceSelect(guidance.suggestedRange.optimal)}
            >
              <Target className="h-3 w-3 mr-1" />
              Optimal
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onPriceSelect(guidance.suggestedRange.max)}
            >
              Premium
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
