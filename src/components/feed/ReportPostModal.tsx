import { useState } from "react";
import { useReportPost } from "@/hooks/useFeed";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag } from "lucide-react";

interface ReportPostModalProps {
  postId?: string;
  commentId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const reportReasons = [
  { value: "spam", label: "Spam or misleading" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "misinformation", label: "Misinformation" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "copyright_violation", label: "Copyright violation" },
  { value: "off_topic", label: "Off-topic or irrelevant" },
  { value: "other", label: "Other" },
];

export function ReportPostModal({ postId, commentId, open, onOpenChange }: ReportPostModalProps) {
  const reportPost = useReportPost();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = async () => {
    if (!reason) return;

    await reportPost.mutateAsync({
      postId,
      commentId,
      reason,
      details: details.trim() || undefined,
    });

    setReason("");
    setDetails("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report {commentId ? "Comment" : "Post"}
          </DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with this content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Why are you reporting this?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((r) => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Additional details (optional)</Label>
            <Textarea
              placeholder="Provide more context..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit} 
            disabled={!reason || reportPost.isPending}
          >
            {reportPost.isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
