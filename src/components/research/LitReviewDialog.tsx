import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileText, Copy, Check, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface LitReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (topic: string) => Promise<string | null>;
  loading: boolean;
  analyzedCount: number;
}

export function LitReviewDialog({ open, onOpenChange, onGenerate, loading, analyzedCount }: LitReviewDialogProps) {
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const result = await onGenerate(topic.trim());
    if (result) setOutline(result);
  };

  const handleCopy = () => {
    if (!outline) return;
    navigator.clipboard.writeText(outline);
    setCopied(true);
    toast.success("Outline copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setOutline(null); setTopic(""); } }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Literature Review Outline Generator
          </DialogTitle>
          <DialogDescription>
            AI generates a structured outline with citations from your {analyzedCount} analyzed papers
          </DialogDescription>
        </DialogHeader>

        {!outline && !loading && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Research Topic / Question</label>
              <Input
                placeholder="e.g., Impact of AI on drug discovery methodologies"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!topic.trim() || analyzedCount < 1}
              className="w-full gap-2"
            >
              <FileText className="h-4 w-4" />
              {analyzedCount < 1 ? "Analyze at least 1 paper first" : "Generate Outline"}
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating literature review outline...
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {outline && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="success">Outline Ready</Badge>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-4 text-sm">
              <ReactMarkdown>{outline}</ReactMarkdown>
            </div>
            <Button variant="ghost" size="sm" className="w-full" onClick={() => { setOutline(null); }}>
              Generate Another
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
