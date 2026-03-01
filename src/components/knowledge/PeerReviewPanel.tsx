/**
 * PeerReviewPanel — UI for submitting and viewing peer reviews on knowledge objects.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useReviewsForRequest,
  useSubmitReview,
  useCreateReviewRequest,
  type PeerReview,
} from "@/hooks/usePeerReviews";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Star, MessageSquare, Eye, EyeOff, Plus, CheckCircle } from "lucide-react";

interface PeerReviewPanelProps {
  targetId: string;
  targetType: string;
  targetTitle: string;
  reviewRequestId?: string;
}

export function PeerReviewPanel({
  targetId,
  targetType,
  targetTitle,
  reviewRequestId,
}: PeerReviewPanelProps) {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useReviewsForRequest(reviewRequestId);
  const submitReview = useSubmitReview();
  const createRequest = useCreateReviewRequest();

  const [showSubmit, setShowSubmit] = useState(false);
  const [score, setScore] = useState(7);
  const [feedback, setFeedback] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const avgScore = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.overall_score || 0), 0) / reviews.length).toFixed(1)
    : null;

  const handleRequestReview = async () => {
    await createRequest.mutateAsync({
      targetId,
      targetType,
      reviewType: "standard",
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewRequestId || !feedback.trim()) return;
    await submitReview.mutateAsync({
      reviewRequestId,
      overallScore: score,
      summaryFeedback: feedback,
      isAnonymous,
    });
    setShowSubmit(false);
    setFeedback("");
    setScore(7);
  };

  const alreadyReviewed = reviews?.some(r => r.reviewer_id === user?.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-amber-500" />
            Peer Reviews
          </CardTitle>
          <div className="flex items-center gap-2">
            {avgScore && (
              <Badge variant="outline" className="gap-1 text-amber-600 border-amber-500/30">
                <Star className="h-3 w-3 fill-amber-500" />
                {avgScore}/10
              </Badge>
            )}
            <Badge variant="secondary">{reviews?.length || 0} reviews</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Request Review / Submit Review Actions */}
        {!reviewRequestId ? (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleRequestReview}
            disabled={createRequest.isPending}
          >
            <Plus className="h-4 w-4" />
            {createRequest.isPending ? "Requesting..." : "Request Peer Review"}
          </Button>
        ) : !alreadyReviewed ? (
          <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <MessageSquare className="h-4 w-4" />
                Submit Your Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review: {targetTitle}</DialogTitle>
                <DialogDescription>
                  Your review contributes to the knowledge credibility score.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="space-y-3">
                  <Label>Overall Score: {score}/10</Label>
                  <Slider
                    value={[score]}
                    onValueChange={([v]) => setScore(v)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive feedback on methodology, rigor, and contribution..."
                    rows={5}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isAnonymous ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <Label htmlFor="anonymous">Submit anonymously</Label>
                  </div>
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSubmit(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitReview.isPending || !feedback.trim()}
                  >
                    {submitReview.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-500/10 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            You have already reviewed this item
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No reviews submitted yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewCard({ review }: { review: PeerReview }) {
  return (
    <div className="p-4 rounded-lg border bg-muted/20">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {review.is_anonymous ? "Anonymous Reviewer" : review.reviewer_name}
          </span>
          {review.is_anonymous && <EyeOff className="h-3 w-3 text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-amber-600 border-amber-500/30">
            <Star className="h-3 w-3 fill-amber-500" />
            {review.overall_score}/10
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
      {review.summary_feedback && (
        <p className="text-sm text-muted-foreground">{review.summary_feedback}</p>
      )}
    </div>
  );
}
