import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Search, Building, Plus } from "lucide-react";
import {
  getInvestors, registerInvestor, getStartupCandidates, expressInterest, INVESTOR_TYPES,
} from "@/lib/innovation/ventureFactory";

export default function InvestorDiscoveryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [investorType, setInvestorType] = useState("angel");

  const { data: investors = [] } = useQuery({ queryKey: ["vf-investors", typeFilter], queryFn: () => getInvestors(typeFilter ? { investorType: typeFilter } : undefined) });
  const { data: candidates = [] } = useQuery({ queryKey: ["vf-candidates-for-investors"], queryFn: () => getStartupCandidates() });

  const registerMut = useMutation({
    mutationFn: registerInvestor,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vf-investors"] }); toast.success("Investor profile created"); setShowRegister(false); },
  });

  const interestMut = useMutation({
    mutationFn: expressInterest,
    onSuccess: () => toast.success("Interest expressed"),
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" /> Investor Discovery
          </h1>
          <p className="text-muted-foreground mt-1">Connect investors with research-born ventures</p>
        </div>
        <Dialog open={showRegister} onOpenChange={setShowRegister}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Register as Investor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Investor Profile</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Organization name" value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              <Select value={investorType} onValueChange={setInvestorType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INVESTOR_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full" disabled={registerMut.isPending} onClick={() => registerMut.mutate({ user_id: user?.id || "", investor_type: investorType, organization_name: orgName })}>
                {registerMut.isPending ? "Registering..." : "Register"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="opportunities">
        <TabsList>
          <TabsTrigger value="opportunities"><Search className="h-4 w-4 mr-1" /> Opportunities</TabsTrigger>
          <TabsTrigger value="investors"><Building className="h-4 w-4 mr-1" /> Investors</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {candidates.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No startup candidates available yet.</CardContent></Card>
          ) : candidates.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="pt-6 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{c.status}</Badge>
                    {c.research_domain && <Badge variant="secondary">{c.research_domain}</Badge>}
                    <Badge>Score: {c.commercialization_score ?? "—"}</Badge>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled={interestMut.isPending}
                  onClick={() => { if (investors[0]) interestMut.mutate({ investor_id: investors[0].id, candidate_id: c.id }); else toast.error("Register as investor first"); }}>
                  Express Interest
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="investors" className="space-y-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="All types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {INVESTOR_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          {investors.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No investors registered yet.</CardContent></Card>
          ) : investors.map((inv: any) => (
            <Card key={inv.id}>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-foreground">{inv.organization_name || "Individual"}</h3>
                <Badge variant="outline" className="mt-1">{inv.investor_type?.replace("_", " ")}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
