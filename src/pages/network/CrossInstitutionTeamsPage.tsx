import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, UserPlus } from "lucide-react";
import {
  getCrossTeams, createCrossTeam, joinCrossTeam, getInstitutionNodes,
} from "@/lib/network/institutionNetwork";

export default function CrossInstitutionTeamsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [domains, setDomains] = useState("");
  const [leadInst, setLeadInst] = useState("");

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["gin-cross-teams"],
    queryFn: getCrossTeams,
  });

  const { data: institutions = [] } = useQuery({
    queryKey: ["gin-nodes-for-teams"],
    queryFn: () => getInstitutionNodes(),
  });

  const createMut = useMutation({
    mutationFn: createCrossTeam,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gin-cross-teams"] });
      toast.success("Cross-institution team created");
      setShowCreate(false);
      setTeamName(""); setDescription(""); setDomains("");
    },
  });

  const joinMut = useMutation({
    mutationFn: joinCrossTeam,
    onSuccess: () => toast.success("Joined team"),
    onError: () => toast.error("Already a member or error"),
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> Cross-Institution Teams
          </h1>
          <p className="text-muted-foreground mt-1">Form research teams spanning multiple institutions</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Create Team</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Cross-Institution Team</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Team name" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input placeholder="Domains (comma separated)" value={domains} onChange={(e) => setDomains(e.target.value)} />
              <Select value={leadInst} onValueChange={setLeadInst}>
                <SelectTrigger><SelectValue placeholder="Lead institution (optional)" /></SelectTrigger>
                <SelectContent>
                  {institutions.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.institution_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full" disabled={!teamName || createMut.isPending}
                onClick={() => createMut.mutate({
                  team_name: teamName, description,
                  domains: domains.split(",").map((s) => s.trim()).filter(Boolean),
                  lead_institution_id: leadInst || undefined,
                  lead_user_id: user?.id || "",
                })}>
                {createMut.isPending ? "Creating..." : "Create Team"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : teams.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No cross-institution teams yet. Create one above.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((t: any) => (
            <Card key={t.id}>
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{t.team_name}</h3>
                    {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                    {t.gin_institution_nodes?.institution_name && (
                      <p className="text-sm text-muted-foreground">Lead: {t.gin_institution_nodes.institution_name}</p>
                    )}
                  </div>
                  <Badge>{t.status}</Badge>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(t.domains || []).map((d: string) => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}
                </div>
                {t.status === "forming" && (
                  <Button size="sm" variant="outline" disabled={joinMut.isPending}
                    onClick={() => joinMut.mutate({ team_id: t.id, user_id: user?.id || "" })}>
                    <UserPlus className="h-4 w-4 mr-1" /> Join Team
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
