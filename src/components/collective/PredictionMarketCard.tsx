import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign,
  BarChart3,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PredictionMarket, PredictionPosition } from "@/hooks/useCollectiveIntelligence";

interface PredictionMarketCardProps {
  market: PredictionMarket;
  userPosition?: PredictionPosition;
  onTrade?: (outcomeId: string, tradeType: "buy" | "sell", shares: number) => void;
  className?: string;
}

export function PredictionMarketCard({ 
  market, 
  userPosition,
  onTrade,
  className 
}: PredictionMarketCardProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [shares, setShares] = useState(10);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [trading, setTrading] = useState(false);

  const isActive = market.status === "active";
  const isResolved = market.status === "resolved";
  const resolutionDate = market.resolution_date ? new Date(market.resolution_date) : null;

  const handleTrade = async () => {
    if (!onTrade || !selectedOutcome) return;
    setTrading(true);
    await onTrade(selectedOutcome, tradeType, shares);
    setTrading(false);
    setSelectedOutcome(null);
  };

  const selectedOutcomeData = market.outcomes.find(o => o.id === selectedOutcome);
  const estimatedCost = selectedOutcomeData 
    ? shares * selectedOutcomeData.current_probability 
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={isActive ? "default" : isResolved ? "secondary" : "destructive"}>
                {market.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {market.market_type}
              </Badge>
            </div>
            <CardTitle className="text-lg">{market.question}</CardTitle>
            {market.description && (
              <CardDescription className="mt-1">
                {market.description}
              </CardDescription>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{market.current_liquidity.toLocaleString()} liquidity</span>
          </div>
          {resolutionDate && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {isResolved 
                  ? `Resolved ${formatDistanceToNow(resolutionDate)} ago`
                  : `Resolves ${formatDistanceToNow(resolutionDate, { addSuffix: true })}`
                }
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Outcomes */}
        <div className="space-y-2">
          {market.outcomes.map((outcome) => {
            const probability = outcome.current_probability * 100;
            const isWinner = market.resolved_outcome === outcome.id;
            const isSelected = selectedOutcome === outcome.id;

            return (
              <motion.div
                key={outcome.id}
                whileHover={isActive ? { scale: 1.01 } : {}}
                onClick={() => isActive && setSelectedOutcome(isSelected ? null : outcome.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  isActive && "hover:border-primary/50",
                  isSelected && "border-primary bg-primary/5",
                  isWinner && "border-emerald-500 bg-emerald-500/10",
                  market.status === "resolved" && !isWinner && "opacity-50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isWinner && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                    {market.status === "resolved" && !isWinner && (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{outcome.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-lg font-bold",
                      probability >= 50 ? "text-emerald-500" : "text-amber-500"
                    )}>
                      {probability.toFixed(0)}%
                    </span>
                    {probability >= 50 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </div>
                <Progress value={probability} className="h-1.5" />
              </motion.div>
            );
          })}
        </div>

        {/* Trading interface */}
        {isActive && selectedOutcome && onTrade && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 pt-4 border-t"
          >
            <div className="flex items-center gap-2">
              <Button
                variant={tradeType === "buy" ? "default" : "outline"}
                size="sm"
                onClick={() => setTradeType("buy")}
                className="flex-1"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Buy
              </Button>
              <Button
                variant={tradeType === "sell" ? "destructive" : "outline"}
                size="sm"
                onClick={() => setTradeType("sell")}
                className="flex-1"
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                Sell
              </Button>
            </div>

            <div>
              <Label className="text-sm mb-2 block">Number of Shares</Label>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 0))}
                min={1}
              />
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <div className="flex justify-between mb-1">
                <span>Outcome</span>
                <span className="font-medium">{selectedOutcomeData?.label}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Price per share</span>
                <span className="font-medium">
                  {(selectedOutcomeData?.current_probability || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Estimated {tradeType === "buy" ? "cost" : "return"}</span>
                <span>{estimatedCost.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleTrade}
              disabled={trading}
              variant={tradeType === "buy" ? "default" : "destructive"}
              className="w-full"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {trading ? "Processing..." : `${tradeType === "buy" ? "Buy" : "Sell"} ${shares} Shares`}
            </Button>
          </motion.div>
        )}

        {/* User position */}
        {userPosition && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="font-semibold">Your Position</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Shares:</span>
                <span className="ml-1 font-medium">{userPosition.shares}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Price:</span>
                <span className="ml-1 font-medium">{userPosition.average_price.toFixed(2)}</span>
              </div>
              {userPosition.realized_pnl !== 0 && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">P&L:</span>
                  <span className={cn(
                    "ml-1 font-medium",
                    userPosition.realized_pnl > 0 ? "text-emerald-500" : "text-red-500"
                  )}>
                    {userPosition.realized_pnl > 0 ? "+" : ""}{userPosition.realized_pnl.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resolution criteria */}
        {market.resolution_criteria && (
          <div className="text-xs text-muted-foreground">
            <strong>Resolution criteria:</strong> {market.resolution_criteria}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
