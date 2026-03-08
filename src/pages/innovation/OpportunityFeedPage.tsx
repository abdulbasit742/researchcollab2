import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, Plus, Clock, DollarSign, Send } from "lucide-react";
import {
  getOpportunities, createOpportunity, applyToOpportunity, getMyTalentProfile, OPPORTUNITY_TYPES,
} from "@/lib/innovation/talentExchange";

export default function OpportunityFeedPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [oppType, setOppType] = useState("contract");
  const [skillsInput, setSkillsInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("open");

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["gtex-opportunities", statusFilter],
    queryFn: () => getOpportunities(statusFilter ? { status: statusFilter } : undefined),
  });

  const { data: myProfile } = useQuery({
    queryKey: ["gtex-my-profile", user?.id],
    queryFn: () => getMyTalentProfile(user?.id || ""),
    enabled: !!user?.id,
  });

  const createMut = useMutation({
    mutationFn: createOpportunity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gtex-opportunities"] });
      toast.success("Opportunity posted");
      setShowCreate(false);
      setTitle(""); setDescription(""); setDomain("");
    },
  });

  const applyMut = useMutation({
    mutationFn: applyToOpportunity,
    onSuccess: () => toast.success("Application submitted"),
    onError: () => toast.error("Already applied or error"),
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" /> Opportunity Feed
          </h1>
          <p className="text-muted-foreground mt-1">Execution contracts, research roles & team formation</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Post Opportunity</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Post Opportunity</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input placeholder="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
              <Input placeholder="Required skills (comma separated)" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} />
              <Select value={oppType} onValueChange={setOppType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OPPORTUNITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button className="w-full" disabled={!title || createMut.isPending}
                onClick={() => createMut.mutate({
                  posted_by: user?.id || "",
                  title,
                  description,
                  domain,
                  opportunity_type: oppType,
                  required_skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
                })}>
                {createMut.isPending ? "Posting..." : "Post"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="filled">Filled</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : opportunities.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No opportunities yet. Post one above.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {opportunities.map((opp: any) => (
            <Card key={opp.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-lg">{opp.title}</h3>
                      <Badge variant="outline">{opp.opportunity_type?.replace("_", " ")}</Badge>
                      <Badge>{opp.status}</Badge>
                    </div>
                    {opp.description && <p className="text-sm text-muted-foreground line-clamp-2">{opp.description}</p>}
                    <div className="flex gap-1 flex-wrap">
                      {(opp.required_skills || []).map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {opp.domain && <span>{opp.domain}</span>}
                      {opp.timeline_weeks && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {opp.timeline_weeks}w</span>}
                      {(opp.compensation_range_min || opp.compensation_range_max) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {opp.compensation_range_min?.toLocaleString()} - {opp.compensation_range_max?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {myProfile && opp.status === "open" && (
                    <Button size="sm" disabled={applyMut.isPending}
                      onClick={() => applyMut.mutate({ opportunity_id: opp.id, talent_id: myProfile.id })}>
                      <Send className="h-4 w-4 mr-1" /> Apply
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
