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
import { Trophy, Plus, DollarSign, Clock, Users, Send } from "lucide-react";
import {
  getChallenges, createChallenge, applyToChallenge, getInstitutionNodes, CHALLENGE_TYPES,
} from "@/lib/network/institutionNetwork";

export default function ChallengePortalPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("open");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [challengeType, setChallengeType] = useState("research");
  const [fundingAmount, setFundingAmount] = useState("");
  const [selectedInst, setSelectedInst] = useState("");

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ["gin-challenges", statusFilter],
    queryFn: () => getChallenges(statusFilter && statusFilter !== "all" ? { status: statusFilter } : undefined),
  });

  const { data: institutions = [] } = useQuery({
    queryKey: ["gin-nodes-for-challenges"],
    queryFn: () => getInstitutionNodes(),
  });

  const createMut = useMutation({
    mutationFn: createChallenge,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gin-challenges"] });
      toast.success("Challenge published");
      setShowCreate(false);
      setTitle(""); setDescription(""); setFundingAmount("");
    },
  });

  const applyMut = useMutation({
    mutationFn: applyToChallenge,
    onSuccess: () => toast.success("Application submitted"),
    onError: () => toast.error("Already applied or error"),
  });

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" /> Institution Challenge Portal
          </h1>
          <p className="text-muted-foreground mt-1">Research challenges, innovation programs & competitions</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Publish Challenge</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Challenge Program</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Challenge title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Select value={challengeType} onValueChange={setChallengeType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHALLENGE_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedInst} onValueChange={setSelectedInst}>
                <SelectTrigger><SelectValue placeholder="Select institution" /></SelectTrigger>
                <SelectContent>
                  {institutions.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.institution_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Funding amount" value={fundingAmount} onChange={(e) => setFundingAmount(e.target.value)} />
              <Button className="w-full" disabled={!title || !selectedInst || createMut.isPending}
                onClick={() => createMut.mutate({
                  institution_id: selectedInst, title, description, challenge_type: challengeType,
                  funding_amount: fundingAmount ? Number(fundingAmount) : 0, created_by: user?.id || "",
                })}>
                {createMut.isPending ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? <p className="text-muted-foreground">Loading...</p> : challenges.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No challenges yet. Publish one above.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {challenges.map((c: any) => (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground text-lg">{c.title}</h3>
                      <Badge>{c.status}</Badge>
                      <Badge variant="outline">{c.challenge_type}</Badge>
                    </div>
                    {c.description && <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                    <p className="text-sm text-muted-foreground">
                      By: {c.gin_institution_nodes?.institution_name || "Unknown"} • {c.gin_institution_nodes?.country}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {c.funding_amount > 0 && (
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> ${c.funding_amount.toLocaleString()}</span>
                      )}
                      {c.application_deadline && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(c.application_deadline).toLocaleDateString()}</span>
                      )}
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.submissions_count} applications</span>
                    </div>
                  </div>
                  {c.status === "open" && (
                    <Button size="sm" disabled={applyMut.isPending}
                      onClick={() => applyMut.mutate({ challenge_id: c.id, applicant_id: user?.id || "" })}>
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
