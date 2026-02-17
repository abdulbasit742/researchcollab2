import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DollarSign, TrendingUp, Lock, Unlock, ArrowLeft, Shield,
  ArrowUpRight, ArrowDownRight, Banknote
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const FinanceDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [wRes, tRes] = await Promise.all([
        supabase.from("escrow_wallets").select("*").order("created_at", { ascending: false }),
        supabase.from("escrow_transactions").select("*").order("created_at", { ascending: false }).limit(50),
      ]);
      setWallets((wRes.data as any[]) || []);
      setTransactions((tRes.data as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const totalFunded = wallets.reduce((s, w) => s + Number(w.total_funded || 0), 0);
  const totalLocked = wallets.reduce((s, w) => s + Number(w.total_locked || 0), 0);
  const totalReleased = wallets.reduce((s, w) => s + Number(w.total_released || 0), 0);
  const totalRefunded = wallets.reduce((s, w) => s + Number(w.total_refunded || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <DollarSign className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Finance & Escrow</h1>
            <p className="text-sm text-muted-foreground">Payment orchestration & escrow management</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Funded", value: `$${totalFunded.toLocaleString()}`, icon: Banknote, color: "text-green-500" },
            { label: "Locked in Escrow", value: `$${totalLocked.toLocaleString()}`, icon: Lock, color: "text-yellow-500" },
            { label: "Released", value: `$${totalReleased.toLocaleString()}`, icon: Unlock, color: "text-primary" },
            { label: "Refunded", value: `$${totalRefunded.toLocaleString()}`, icon: ArrowDownRight, color: "text-destructive" },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="wallets">
          <TabsList>
            <TabsTrigger value="wallets">Escrow Wallets ({wallets.length})</TabsTrigger>
            <TabsTrigger value="transactions">Transactions ({transactions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="wallets">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 mt-4">
                {wallets.map(w => (
                  <Card key={w.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm capitalize">{w.linked_entity_type}</span>
                        </div>
                        <Badge variant={w.status === "active" ? "default" : "secondary"}>{w.status}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Funded:</span> ${Number(w.total_funded).toLocaleString()}</div>
                        <div><span className="text-muted-foreground">Locked:</span> ${Number(w.total_locked).toLocaleString()}</div>
                        <div><span className="text-muted-foreground">Released:</span> ${Number(w.total_released).toLocaleString()}</div>
                        <div><span className="text-muted-foreground">Refunded:</span> ${Number(w.total_refunded).toLocaleString()}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {wallets.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No escrow wallets</p>}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="transactions">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 mt-4">
                {transactions.map(t => (
                  <Card key={t.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {t.transaction_type === "deposit" ? (
                          <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
                        )}
                        <div>
                          <p className="text-sm font-medium capitalize">{t.transaction_type.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">${Number(t.amount).toLocaleString()}</p>
                        <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {transactions.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No transactions</p>}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinanceDashboardPage;
