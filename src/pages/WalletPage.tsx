import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Shield, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  Clock,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  FileText,
  Activity,
  GitBranch,
} from "lucide-react";
import { useWallet, WalletTransaction } from "@/hooks/useWallet";
import { useEscrowMonitor } from "@/hooks/useEscrowMonitor";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoneyFlowSummary,
  MoneyFlowTimeline,
  EscrowPositionsCard,
  EscrowStateMachine,
  FeeTransparencyCard,
} from "@/components/escrow";

const transactionTypeConfig: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
}> = {
  escrow_deposit: { label: "Escrow Deposit", icon: Shield, color: "text-amber-500" },
  escrow_release: { label: "Escrow Release", icon: Shield, color: "text-amber-500" },
  milestone_release: { label: "Milestone Payment", icon: CheckCircle2, color: "text-emerald-500" },
  commission_deduction: { label: "Platform Fee", icon: DollarSign, color: "text-muted-foreground" },
  refund: { label: "Refund", icon: ArrowDownLeft, color: "text-blue-500" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-primary" },
  tool_purchase: { label: "Tool Purchase", icon: CreditCard, color: "text-violet-500" },
  deposit: { label: "Deposit", icon: ArrowDownLeft, color: "text-emerald-500" },
  credit: { label: "Credit", icon: ArrowDownLeft, color: "text-emerald-500" },
};

export default function WalletPage() {
  const { toast } = useToast();
  const { wallet, transactions, loading, requestWithdrawal } = useWallet();
  const { summary, loading: escrowLoading } = useEscrowMonitor();

  const handleWithdraw = async () => {
    if (wallet && wallet.available_balance > 0) {
      await requestWithdrawal(wallet.available_balance);
    } else {
      toast({
        title: "No Available Balance",
        description: "You don't have any funds available to withdraw.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="gradient-hero py-8 sm:py-12 md:py-16">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-3 sm:mb-4">
              <Wallet className="h-3 w-3 mr-1" />
              Financial Command Center
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold md:text-4xl">
              Money Flow <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Real-time escrow tracking, fee transparency, and complete money audit trail
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-8 space-y-6">
        {/* Money Flow Summary Cards */}
        {escrowLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <MoneyFlowSummary summary={summary} />
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Wallet Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {loading ? (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-12 w-48" />
                  </CardContent>
                </Card>
              ) : wallet ? (
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                    <div className="flex items-center gap-2 mb-4">
                      <Wallet className="h-6 w-6" />
                      <span className="font-semibold">My Wallet</span>
                    </div>
                    <p className="text-sm opacity-80">Available Balance</p>
                    <p className="text-4xl font-bold mt-1">PKR {wallet.available_balance.toLocaleString()}</p>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                          <Shield className="h-4 w-4" />
                          <span className="text-xs font-medium">In Escrow</span>
                        </div>
                        <p className="text-xl font-bold">PKR {wallet.escrow_balance.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-xs font-medium">Total Earned</span>
                        </div>
                        <p className="text-xl font-bold">PKR {wallet.total_earned.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No Wallet Found</h3>
                    <p className="text-sm text-muted-foreground">Your wallet will be created automatically.</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleWithdraw} 
                className="gap-2 h-12 touch-manipulation"
                disabled={loading || !wallet || wallet.available_balance <= 0}
              >
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm sm:text-base">Withdraw</span>
              </Button>
              <Link to="/tools" className="block">
                <Button 
                  variant="outline" 
                  className="gap-2 w-full h-12 touch-manipulation"
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm sm:text-base">Buy Tools</span>
                </Button>
              </Link>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="flows" className="space-y-4 sm:space-y-6">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="flows" className="text-xs sm:text-sm touch-manipulation">
                  <Activity className="h-3 w-3 mr-1 hidden sm:inline" />
                  Flows
                </TabsTrigger>
                <TabsTrigger value="escrow" className="text-xs sm:text-sm touch-manipulation">
                  <Shield className="h-3 w-3 mr-1 hidden sm:inline" />
                  Escrow
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-xs sm:text-sm touch-manipulation">
                  <FileText className="h-3 w-3 mr-1 hidden sm:inline" />
                  History
                </TabsTrigger>
                <TabsTrigger value="machine" className="text-xs sm:text-sm touch-manipulation">
                  <GitBranch className="h-3 w-3 mr-1 hidden sm:inline" />
                  States
                </TabsTrigger>
              </TabsList>

              {/* Money Flow Timeline */}
              <TabsContent value="flows">
                <MoneyFlowTimeline flows={summary.recent_flows} />
              </TabsContent>

              {/* Active Escrow Positions */}
              <TabsContent value="escrow">
                <EscrowPositionsCard positions={summary.positions} />
              </TabsContent>

              {/* Transaction History */}
              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Transaction History</CardTitle>
                    <CardDescription className="text-sm">Complete audit trail</CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No transactions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {transactions.map((txn) => {
                          const config = transactionTypeConfig[txn.type] || {
                            label: txn.type,
                            icon: DollarSign,
                            color: "text-muted-foreground"
                          };
                          const TxnIcon = config.icon;
                          const isPositive = txn.amount > 0;

                          return (
                            <div 
                              key={txn.id}
                              className="flex items-center gap-3 sm:gap-4 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors touch-manipulation active:bg-accent/50"
                            >
                              <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isPositive ? "bg-emerald-500/10" : "bg-muted"
                              }`}>
                                <TxnIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${config.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm">{config.label}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {txn.description || "Transaction"}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className={`font-semibold text-sm sm:text-base ${
                                  isPositive ? "text-emerald-500" : ""
                                }`}>
                                  {isPositive ? "+" : ""}PKR {Math.abs(txn.amount).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(txn.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Escrow State Machine */}
              <TabsContent value="machine">
                <EscrowStateMachine 
                  activeState={
                    summary.positions.length > 0
                      ? summary.positions[0].status === "in_progress" ? "locked" : "uninitialized"
                      : "uninitialized"
                  } 
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Earned</span>
                  <span className="font-semibold text-emerald-500">
                    PKR {wallet?.total_earned?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Spent</span>
                  <span className="font-semibold">PKR {wallet?.total_spent?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Deals</span>
                  <span className="font-semibold">{summary.active_deals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transactions</span>
                  <span className="font-semibold">{transactions.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Fee Transparency */}
            <FeeTransparencyCard totalFeesPaid={summary.total_fees_paid} />

            {/* Escrow Protection Info */}
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-8 w-8 text-amber-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Atomic Escrow</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Every fund movement is atomic — money can never be lost, duplicated, or trapped.
                      All transactions are logged with full audit trails.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2">Need Help?</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Questions about payments, escrow, or disputes?
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
