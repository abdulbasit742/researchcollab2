import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, ThumbsUp, ThumbsDown, Lightbulb, BookOpen, TrendingUp } from "lucide-react";
import { PostCrisisReview } from "@/types/crisis-coordination";

interface PostCrisisReviewCardProps {
  review: PostCrisisReview;
  onComplete?: () => void;
}

const statusColors = {
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  archived: "bg-muted",
};

export function PostCrisisReviewCard({ review, onComplete }: PostCrisisReviewCardProps) {
  const totalItems = review.whatWorked.length + review.whatFailed.length;
  const implementedRecs = review.recommendations.filter(r => r.status === "implemented").length;
  const appliedPlaybooks = review.playbookUpdates.filter(p => p.appliedAt).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Post-Crisis Review</CardTitle>
          </div>
          <Badge variant="outline" className={`${statusColors[review.status]} text-white`}>
            {review.status.replace("_", " ")}
          </Badge>
        </div>
        <CardDescription>{review.missionName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatBlock 
            icon={<ThumbsUp className="h-4 w-4 text-green-500" />}
            value={review.whatWorked.length}
            label="Worked"
          />
          <StatBlock 
            icon={<ThumbsDown className="h-4 w-4 text-red-500" />}
            value={review.whatFailed.length}
            label="Failed"
          />
          <StatBlock 
            icon={<Lightbulb className="h-4 w-4 text-amber-500" />}
            value={review.recommendations.length}
            label="Recs"
          />
        </div>

        {/* What Worked */}
        {review.whatWorked.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-green-600">
              <ThumbsUp className="h-4 w-4" />
              What Worked ({review.whatWorked.length})
            </h4>
            <div className="space-y-1">
              {review.whatWorked.slice(0, 3).map((item) => (
                <div key={item.id} className="text-sm p-2 rounded bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <span>{item.description}</span>
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What Failed */}
        {review.whatFailed.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-red-600">
              <ThumbsDown className="h-4 w-4" />
              What Failed ({review.whatFailed.length})
            </h4>
            <div className="space-y-1">
              {review.whatFailed.slice(0, 3).map((item) => (
                <div key={item.id} className="text-sm p-2 rounded bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center justify-between">
                    <span>{item.description}</span>
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Progress */}
        {review.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Recommendations ({implementedRecs}/{review.recommendations.length} implemented)
            </h4>
            <div className="space-y-1">
              {review.recommendations.slice(0, 3).map((rec) => (
                <div 
                  key={rec.id} 
                  className={`
                    text-sm p-2 rounded border
                    ${rec.status === "implemented" 
                      ? "bg-green-500/10 border-green-500/20" 
                      : "bg-muted/50 border-transparent"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{rec.title}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs capitalize ${rec.status === "implemented" ? "text-green-600" : ""}`}
                    >
                      {rec.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playbook Updates */}
        {review.playbookUpdates.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Playbook Updates</span>
            </div>
            <span className="text-muted-foreground">
              {appliedPlaybooks}/{review.playbookUpdates.length} applied
            </span>
          </div>
        )}

        {/* Readiness Adjustments */}
        {review.readinessAdjustments.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Readiness Adjustments</span>
            </div>
            <span className="text-muted-foreground">
              {review.readinessAdjustments.length} adjustments
            </span>
          </div>
        )}

        {/* Complete Button */}
        {review.status === "in_progress" && onComplete && (
          <button 
            onClick={onComplete}
            className="w-full py-2 px-4 rounded text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Complete Review
          </button>
        )}

        {/* Meta */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Conducted {new Date(review.conductedAt).toLocaleDateString()} · {review.participants.length} participants
        </div>
      </CardContent>
    </Card>
  );
}

function StatBlock({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/50">
      <div className="flex items-center justify-center gap-1 text-xl font-bold">
        {icon}
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
