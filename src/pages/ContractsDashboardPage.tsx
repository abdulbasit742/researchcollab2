import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileSignature, Shield, Clock, CheckCircle, AlertTriangle,
  Plus, Eye, Lock, ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_signature: "bg-yellow-500/10 text-yellow-600",
  fully_signed: "bg-green-500/10 text-green-600",
  active: "bg-primary/10 text-primary",
  terminated: "bg-destructive/10 text-destructive",
};

const ContractsDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<any[]>([]);
  const [signatures, setSignatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [cRes, sRes] = await Promise.all([
        supabase.from("contracts").select("*").order("created_at", { ascending: false }),
        supabase.from("contract_signatures").select("*").eq("signatory_id", user.id),
      ]);
      setContracts((cRes.data as any[]) || []);
      setSignatures((sRes.data as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const stats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === "active").length,
    pending: contracts.filter(c => c.status === "pending_signature").length,
    myPending: signatures.filter(s => s.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <FileSignature className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Contracts & Signatures</h1>
            <p className="text-sm text-muted-foreground">Digital contract lifecycle management</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Contracts", value: stats.total, icon: FileSignature },
            { label: "Active", value: stats.active, icon: CheckCircle },
            { label: "Awaiting Signatures", value: stats.pending, icon: Clock },
            { label: "My Pending Signs", value: stats.myPending, icon: AlertTriangle },
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

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Contracts</TabsTrigger>
            <TabsTrigger value="pending">Pending Signature</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <ContractsList contracts={contracts} />
          </TabsContent>
          <TabsContent value="pending">
            <ContractsList contracts={contracts.filter(c => c.status === "pending_signature")} />
          </TabsContent>
          <TabsContent value="active">
            <ContractsList contracts={contracts.filter(c => c.status === "active")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const ContractsList = ({ contracts }: { contracts: any[] }) => (
  <ScrollArea className="h-[500px]">
    <div className="space-y-3 mt-4">
      {contracts.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No contracts found</p>
      )}
      {contracts.map(c => (
        <Card key={c.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {c.status === "active" ? (
                <Lock className="h-4 w-4 text-green-500" />
              ) : (
                <FileSignature className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-sm">{c.contract_type.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}</p>
                <p className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[c.status] || ""}>{c.status.replace(/_/g, " ")}</Badge>
              {c.linked_entity_type && (
                <Badge variant="outline" className="text-[10px]">{c.linked_entity_type}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </ScrollArea>
);

export default ContractsDashboardPage;
