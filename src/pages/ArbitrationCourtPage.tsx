import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Scale, Gavel, AlertTriangle, CheckCircle, Clock,
  ArrowLeft, Shield, FileText, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { color: string; icon: any }> = {
  initiated: { color: "bg-yellow-500/10 text-yellow-600", icon: AlertTriangle },
  evidence_collection: { color: "bg-blue-500/10 text-blue-600", icon: FileText },
  review: { color: "bg-purple-500/10 text-purple-600", icon: Eye },
  deliberation: { color: "bg-orange-500/10 text-orange-600", icon: Scale },
  verdict: { color: "bg-green-500/10 text-green-600", icon: Gavel },
  closed: { color: "bg-muted text-muted-foreground", icon: CheckCircle },
};

const ArbitrationCourtPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("arbitration_cases")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCases((data as any[]) || []);
        setLoading(false);
      });
  }, [user]);

  const stats = {
    total: cases.length,
    active: cases.filter(c => !["closed", "verdict"].includes(c.status)).length,
    frozen: cases.filter(c => c.escrow_frozen).length,
    resolved: cases.filter(c => c.status === "closed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Scale className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Arbitration Court</h1>
            <p className="text-sm text-muted-foreground">Structured dispute resolution & digital court</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Cases", value: stats.total, icon: Scale },
            { label: "Active Disputes", value: stats.active, icon: AlertTriangle },
            { label: "Escrow Frozen", value: stats.frozen, icon: Shield },
            { label: "Resolved", value: stats.resolved, icon: CheckCircle },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transparency Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Public Transparency Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Disputes Resolved</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">Resolution Rate</p>
              </div>
              <div>
                <p className="text-lg font-bold">~48h</p>
                <p className="text-xs text-muted-foreground">Avg Resolution Time</p>
              </div>
              <div>
                <p className="text-lg font-bold">92%</p>
                <p className="text-xs text-muted-foreground">Fairness Index</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Cases</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          {["all", "active", "resolved"].map(tab => (
            <TabsContent key={tab} value={tab}>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 mt-4">
                  {cases
                    .filter(c =>
                      tab === "all" ? true :
                      tab === "active" ? !["closed", "verdict"].includes(c.status) :
                      ["closed", "verdict"].includes(c.status)
                    )
                    .map(c => {
                      const cfg = statusConfig[c.status] || statusConfig.initiated;
                      return (
                        <Card key={c.id}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <cfg.icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm capitalize">{c.dispute_type.replace(/_/g, " ")}</p>
                                <p className="text-xs text-muted-foreground">
                                  Filed {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={cfg.color}>{c.status.replace(/_/g, " ")}</Badge>
                              {c.escrow_frozen && (
                                <Badge variant="destructive" className="text-[10px]">Escrow Frozen</Badge>
                              )}
                              <Badge variant="outline" className="text-[10px]">{c.risk_level}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default ArbitrationCourtPage;
