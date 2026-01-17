import { useState } from "react";
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
  AlertCircle,
  CreditCard,
  TrendingUp,
  FileText
} from "lucide-react";
import { WalletCard } from "@/components/wallet/WalletCard";
import { 
  dummyWallets, 
  dummyWalletTransactions, 
  dummyMilestones,
  WalletTransaction 
} from "@/data/wallet";
import { dummyOffers } from "@/data/offers";
import { useToast } from "@/hooks/use-toast";

const transactionTypeConfig: Record<WalletTransaction["type"], {
  label: string;
  icon: React.ElementType;
  color: string;
}> = {
  escrow_deposit: { label: "Escrow Deposit", icon: Shield, color: "text-amber-500" },
  milestone_release: { label: "Milestone Release", icon: CheckCircle2, color: "text-emerald-500" },
  commission_deduction: { label: "Platform Fee", icon: DollarSign, color: "text-muted-foreground" },
  refund: { label: "Refund", icon: ArrowDownLeft, color: "text-blue-500" },
  withdrawal: { label: "Withdrawal", icon: ArrowUpRight, color: "text-primary" },
  tool_purchase: { label: "Tool Purchase", icon: CreditCard, color: "text-violet-500" },
};

export default function WalletPage() {
  const { toast } = useToast();
  
  // Simulate current user's wallet (student-1 for demo)
  const currentWallet = dummyWallets[0];
  const transactions = dummyWalletTransactions.filter(t => t.walletId === currentWallet.id);
  
  // Get active escrow projects
  const escrowProjects = dummyOffers.filter(o => 
    o.status === "accepted" || o.status === "in_progress"
  ).map(offer => {
    const milestones = dummyMilestones.filter(m => m.offerId === offer.id);
    const pendingAmount = milestones
      .filter(m => m.status !== "released")
      .reduce((sum, m) => sum + m.amount, 0);
    return { offer, milestones, pendingAmount };
  });

  const handleWithdraw = () => {
    toast({
      title: "Withdrawal Initiated",
      description: "Your withdrawal request is being processed. Funds will arrive in 2-3 business days.",
    });
  };

  return (
    <MainLayout>
      {/* Hero Section - Mobile Optimized */}
      <div className="gradient-hero py-8 sm:py-12 md:py-16">
        <div className="container px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-3 sm:mb-4">
              <Wallet className="h-3 w-3 mr-1" />
              My Wallet
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-bold md:text-4xl">
              Manage Your{" "}
              <span className="text-gradient">Funds</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">
              Track earnings, escrow balances, and transactions
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container px-4 py-6 sm:py-8">
        {/* Mobile: Stack vertically, Desktop: 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Wallet Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WalletCard wallet={currentWallet} />
            </motion.div>

            {/* Action Buttons - Full width on mobile */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleWithdraw} 
                className="gap-2 h-12 touch-manipulation"
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

            {/* Mobile Quick Stats - Show on mobile only */}
            <div className="lg:hidden grid grid-cols-2 gap-3">
              <Card className="bg-card/50">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                  <div className="text-lg font-bold text-emerald-500">+$580</div>
                  <div className="text-xs text-muted-foreground">This Month</div>
                </CardContent>
              </Card>
              <Card className="bg-card/50">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-5 w-5 mx-auto text-primary mb-1" />
                  <div className="text-lg font-bold">94%</div>
                  <div className="text-xs text-muted-foreground">Completion</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs - Scrollable on mobile */}
            <Tabs defaultValue="transactions" className="space-y-4 sm:space-y-6">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger 
                  value="transactions" 
                  className="text-sm touch-manipulation"
                >
                  Transactions
                </TabsTrigger>
                <TabsTrigger 
                  value="escrow" 
                  className="text-sm touch-manipulation"
                >
                  Escrow Funds
                </TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Recent Transactions</CardTitle>
                    <CardDescription className="text-sm">Your wallet activity</CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    {transactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No transactions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {transactions.map((txn) => {
                          const config = transactionTypeConfig[txn.type];
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
                                  {txn.description}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className={`font-semibold text-sm sm:text-base ${
                                  isPositive ? "text-emerald-500" : ""
                                }`}>
                                  {isPositive ? "+" : ""}${Math.abs(txn.amount).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(txn.createdAt).toLocaleDateString()}
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

              <TabsContent value="escrow" className="space-y-4">
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                      Funds in Escrow
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Protected funds awaiting milestone completion
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    {escrowProjects.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No active escrow projects</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {escrowProjects.map(({ offer, milestones, pendingAmount }) => (
                          <div key={offer.id} className="p-3 sm:p-4 rounded-lg border bg-card">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-sm sm:text-base truncate">{offer.title}</h4>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {offer.senderName}
                                </p>
                              </div>
                              <Badge variant="secondary" className="gap-1 flex-shrink-0 text-xs">
                                <Shield className="h-3 w-3" />
                                ${pendingAmount}
                              </Badge>
                            </div>
                            <div className="mt-3 space-y-2">
                              {milestones.map((m, index) => (
                                <div 
                                  key={m.id}
                                  className="flex items-center justify-between text-xs sm:text-sm"
                                >
                                  <span className="text-muted-foreground truncate mr-2">
                                    M{index + 1}: {m.title}
                                  </span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span>${m.amount}</span>
                                    {m.status === "released" ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : m.status === "disputed" ? (
                                      <AlertCircle className="h-4 w-4 text-destructive" />
                                    ) : (
                                      <Clock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <Link to={`/workroom/${offer.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-3 w-full h-10 touch-manipulation"
                              >
                                View Work Room
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Hidden on mobile (shown as quick stats above) */}
          <div className="hidden lg:block space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-semibold text-emerald-500">+$580</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Milestones</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-semibold">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg. Response Time</span>
                  <span className="font-semibold">2.4 hrs</span>
                </div>
              </CardContent>
            </Card>

            {/* Escrow Protection Info */}
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-8 w-8 text-amber-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Escrow Protection</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      All project funds are held securely in escrow until milestones are approved. 
                      This protects both clients and service providers.
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

        {/* Mobile Help Section */}
        <div className="lg:hidden mt-6 space-y-4">
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-amber-500 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm">Escrow Protection</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    All funds are held securely until milestones are approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
