import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { CheckCircle2, XCircle, AlertTriangle, ClipboardCheck } from "lucide-react";
import { getQualityReviews, submitQualityReview, getDatasets } from "@/lib/innovation/datasetKnowledgeExchange";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function DatasetQualityReviewPage() {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<any[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quality, setQuality] = useState(70);
  const [completeness, setCompleteness] = useState(70);
  const [accuracy, setAccuracy] = useState(70);
  const [documentation, setDocumentation] = useState(70);
  const [notes, setNotes] = useState("");
  const [recommendation, setRecommendation] = useState("approve");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadDatasets(); }, []);
  useEffect(() => { if (selectedDataset) loadReviews(); }, [selectedDataset]);

  async function loadDatasets() {
    setLoading(true);
    try { setDatasets(await getDatasets({ status: "submitted" })); }
    catch { /* fallback to all */ try { setDatasets(await getDatasets()); } catch {} }
    finally { setLoading(false); }
  }

  async function loadReviews() {
    try { setReviews(await getQualityReviews(selectedDataset)); }
    catch { setReviews([]); }
  }

  async function handleSubmit() {
    if (!user || !selectedDataset) return;
    setSubmitting(true);
    try {
      await submitQualityReview({
        asset_type: "dataset", asset_id: selectedDataset, reviewer_id: user.id,
        reviewer_role: "peer", quality_score: quality, completeness_score: completeness,
        accuracy_score: accuracy, documentation_score: documentation,
        review_notes: notes, recommendation,
      });
      toast.success("Review submitted");
      loadReviews();
      setNotes("");
    } catch { toast.error("Failed to submit review"); }
    finally { setSubmitting(false); }
  }

  const recIcon = (r: string) => {
    if (r === "approve") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (r === "reject") return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-7 w-7 text-primary" /> Dataset Quality Review
        </h1>
        <p className="text-sm text-muted-foreground">Peer review and quality validation for research datasets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Form */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Submit Review</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger><SelectValue placeholder="Select a dataset to review" /></SelectTrigger>
              <SelectContent>
                {datasets.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
              </SelectContent>
            </Select>

            {selectedDataset && (
              <>
                <div className="space-y-3">
                  {[
                    { label: "Quality", value: quality, set: setQuality },
                    { label: "Completeness", value: completeness, set: setCompleteness },
                    { label: "Accuracy", value: accuracy, set: setAccuracy },
                    { label: "Documentation", value: documentation, set: setDocumentation },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-medium">{s.value}%</span>
                      </div>
                      <Slider value={[s.value]} onValueChange={([v]) => s.set(v)} max={100} step={1} />
                    </div>
                  ))}
                </div>

                <Select value={recommendation} onValueChange={setRecommendation}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="revise">Request Revision</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea placeholder="Review notes..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />

                <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Existing Reviews */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Review History</CardTitle></CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {selectedDataset ? "No reviews yet for this dataset" : "Select a dataset to view reviews"}
              </p>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3">
                  {reviews.map(r => (
                    <div key={r.id} className="p-3 rounded-lg border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {recIcon(r.recommendation)}
                          <Badge className="text-[10px] capitalize">{r.recommendation}</Badge>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{r.reviewer_role}</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div><p className="text-muted-foreground">Quality</p><p className="font-medium">{r.quality_score}%</p></div>
                        <div><p className="text-muted-foreground">Complete</p><p className="font-medium">{r.completeness_score}%</p></div>
                        <div><p className="text-muted-foreground">Accuracy</p><p className="font-medium">{r.accuracy_score}%</p></div>
                        <div><p className="text-muted-foreground">Docs</p><p className="font-medium">{r.documentation_score}%</p></div>
                      </div>
                      {r.review_notes && <p className="text-xs text-muted-foreground">{r.review_notes}</p>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
