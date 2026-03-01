import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useMyReviewRequests, useUpdateReviewStatus, useSubmitFeedback, useReviewFeedback } from "@/hooks/useResearchWorkflow";
import { ClipboardCheck, MessageSquare, Star, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function ReviewsPage() {
  const { data: reviews = [], isLoading } = useMyReviewRequests();
  const updateStatus = useUpdateReviewStatus();
  const submitFeedback = useSubmitFeedback();

  const [feedbackReviewId, setFeedbackReviewId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState([3]);
  const [selectedReviewForFeedback, setSelectedReviewForFeedback] = useState<string | null>(null);

  const { data: feedbackList = [] } = useReviewFeedback(selectedReviewForFeedback || undefined);

  const handleSubmitFeedback = async () => {
    if (!feedbackReviewId || !feedbackText.trim()) return;
    await submitFeedback.mutateAsync({
      review_request_id: feedbackReviewId,
      feedback_text: feedbackText.trim(),
      rating_score: rating[0],
    });
    setFeedbackText("");
    setRating([3]);
    setFeedbackReviewId(null);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-primary" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const statusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "approved": return "default";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  return (
    <MainLayout>
      <div className="container py-6 px-4 max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Review Requests
          </h1>
          <p className="text-sm text-muted-foreground">Milestones assigned to you for review</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No review requests assigned to you.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviews.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="py-4 px-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {statusIcon(review.status)}
                        <Badge variant={statusVariant(review.status)}>
                          {review.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Milestone:</span>{" "}
                        <span className="font-medium">{review.milestone_id.slice(0, 8)}...</span>
                      </p>
                      {review.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{review.notes}</p>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {review.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus.mutate({
                              id: review.id,
                              projectId: review.project_id,
                              status: "rejected",
                            })}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateStatus.mutate({
                              id: review.id,
                              projectId: review.project_id,
                              status: "approved",
                            })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </>
                      )}

                      <Dialog
                        open={feedbackReviewId === review.id}
                        onOpenChange={(open) => {
                          if (open) setFeedbackReviewId(review.id);
                          else setFeedbackReviewId(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Feedback
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Feedback</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Your review feedback..."
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                            />
                            <div>
                              <label className="text-sm text-muted-foreground mb-2 block">
                                Rating: {rating[0]}/5
                              </label>
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    className={`h-5 w-5 cursor-pointer ${
                                      n <= rating[0] ? "text-primary fill-primary" : "text-muted-foreground"
                                    }`}
                                    onClick={() => setRating([n])}
                                  />
                                ))}
                              </div>
                            </div>
                            <Button
                              onClick={handleSubmitFeedback}
                              disabled={submitFeedback.isPending || !feedbackText.trim()}
                            >
                              {submitFeedback.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                              Submit
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReviewForFeedback(
                          selectedReviewForFeedback === review.id ? null : review.id
                        )}
                      >
                        View
                      </Button>
                    </div>
                  </div>

                  {/* Inline feedback display */}
                  {selectedReviewForFeedback === review.id && feedbackList.length > 0 && (
                    <div className="mt-3 border-t pt-3 space-y-2">
                      {feedbackList.map((fb: any) => (
                        <div key={fb.id} className="p-2 rounded bg-muted/50 text-sm">
                          <div className="flex items-center gap-1 mb-1">
                            {Array.from({ length: fb.rating_score }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 text-primary fill-primary" />
                            ))}
                          </div>
                          <p className="text-xs">{fb.feedback_text}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(fb.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
