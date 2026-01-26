import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, Shield, DollarSign, Clock, TrendingUp } from "lucide-react";

// Flexible wallet type that works with both database and mock data
export interface WalletCardData {
  id: string;
  userId?: string;
  userName?: string;
  userType?: "student" | "researcher" | "project_owner" | "admin";
  availableBalance: number;
  escrowBalance: number;
  pendingBalance: number;
  totalEarned?: number;
  totalSpent?: number;
  lifetimeEarnings?: number;
  lifetimeSpend?: number;
  currency?: string;
}

interface WalletCardProps {
  wallet: WalletCardData;
  variant?: "full" | "compact";
}

export function WalletCard({ wallet, variant = "full" }: WalletCardProps) {
  if (variant === "compact") {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">PKR {wallet.availableBalance.toLocaleString()}</p>
              </div>
            </div>
            {wallet.escrowBalance > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                PKR {wallet.escrowBalance.toLocaleString()} in escrow
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const lifetimeEarnings = wallet.lifetimeEarnings ?? wallet.totalEarned ?? 0;
  const lifetimeSpend = wallet.lifetimeSpend ?? wallet.totalSpent ?? 0;

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <span className="font-semibold">My Wallet</span>
          </div>
          {wallet.userType && (
            <Badge className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30">
              {wallet.userType === "student" ? "Student" : "Researcher"}
            </Badge>
          )}
        </div>
        <p className="text-sm opacity-80">Available Balance</p>
        <p className="text-4xl font-bold mt-1">
          PKR {wallet.availableBalance.toLocaleString()}
        </p>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
              <Shield className="h-4 w-4" />
              <span className="text-xs font-medium">In Escrow</span>
            </div>
            <p className="text-xl font-bold">PKR {wallet.escrowBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Protected funds</p>
          </div>

          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium">Pending</span>
            </div>
            <p className="text-xl font-bold">PKR {wallet.pendingBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Awaiting release</p>
          </div>

          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Total Earned</span>
            </div>
            <p className="text-xl font-bold">PKR {lifetimeEarnings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs font-medium">Total Spent</span>
            </div>
            <p className="text-xl font-bold">PKR {lifetimeSpend.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
