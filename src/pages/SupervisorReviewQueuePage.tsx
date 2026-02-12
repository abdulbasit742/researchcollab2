import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, RotateCcw, AlertTriangle, Clock, User } from "lucide-react";

type ReviewStatus = "pending" | "approved" | "rejected" | "revision_needed";
interface Review { id: string; student: string; project: string; type: "milestone" | "final" | "revision"; milestone: string; submitted: string; status: ReviewStatus; }
const mockReviews: Review[] = [
  { id: "1", student: "Fatima Ali", project: "AI-Powered Academic Integrity System", type: "milestone", milestone: "Prototype Development", submitted: "2026-02-10", status: "pending" },
  { id: "2", student: "Hassan Raza", project: "Blockchain-Based Credential Verification", type: "final", milestone: "Final Submission", submitted: "2026-02-08", status: "pending" },
  { id: "3", student: "Aisha Noor", project: "IoT Smart Campus Energy Monitor", type: "revision", milestone: "Software Integration", submitted: "2026-02-05", status: "pending" },
];

const typeColor: Record<string, string> = {
  milestone: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  final: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  revision: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

export default function SupervisorReviewQueuePage() {
  const [reviews, setReviews] = useState(mockReviews);
  const [comments, setComments] = useState<Record<string, string>>({});

  const handleDecision = (id: string, decision: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: decision as any } : r));
  };

  const pending = reviews.filter(r => r.status === "pending");
  const resolved = reviews.filter(r => r.status !== "pending");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" /> Review Queue
          </h1>
          <p className="text-muted-foreground mt-1">Approve, reject, or request revisions for student submissions</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{pending.length}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">{resolved.filter(r => r.status === "approved").length}</p>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-red-600">{resolved.filter(r => r.status === "rejected").length}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList><TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger><TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger></TabsList>
          <TabsContent value="pending" className="space-y-4 mt-4">
            {pending.map(r => (
              <Card key={r.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{r.project}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><User className="h-3 w-3" /> {r.student} · {r.milestone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={typeColor[r.type]}>{r.type}</Badge>
                      <span className="text-xs text-muted-foreground">{r.submitted}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea placeholder="Add comments..." value={comments[r.id] || ""} onChange={e => setComments(prev => ({ ...prev, [r.id]: e.target.value }))} rows={2} />
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1" onClick={() => handleDecision(r.id, "approved")}><CheckCircle2 className="h-4 w-4" /> Approve</Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDecision(r.id, "rejected")}><XCircle className="h-4 w-4" /> Reject</Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => handleDecision(r.id, "revision_needed")}><RotateCcw className="h-4 w-4" /> Request Revision</Button>
                    <Button size="sm" variant="outline" className="gap-1 ml-auto"><AlertTriangle className="h-4 w-4" /> Flag Risk</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pending.length === 0 && <p className="text-center text-muted-foreground py-8">No pending reviews</p>}
          </TabsContent>
          <TabsContent value="resolved" className="space-y-3 mt-4">
            {resolved.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium">{r.student}</p>
                  <p className="text-sm text-muted-foreground">{r.project} · {r.milestone}</p>
                </div>
                <Badge variant="outline" className={r.status === "approved" ? "bg-green-500/10 text-green-600" : r.status === "rejected" ? "bg-red-500/10 text-red-600" : "bg-orange-500/10 text-orange-600"}>{r.status}</Badge>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
