import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Copy, Check, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface AnnotatedBibDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: () => Promise<string | null>;
  loading: boolean;
  paperCount: number;
}

export function AnnotatedBibDialog({ open, onOpenChange, onGenerate, loading, paperCount }: AnnotatedBibDialogProps) {
  const [bibliography, setBibliography] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    const result = await onGenerate();
    if (result) setBibliography(result);
  };

  const handleCopy = () => {
    if (!bibliography) return;
    navigator.clipboard.writeText(bibliography);
    setCopied(true);
    toast.success("Annotated bibliography copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setBibliography(null); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            Annotated Bibliography
          </DialogTitle>
          <DialogDescription>
            AI-generated annotated bibliography from {paperCount} bookmarked/analyzed papers
          </DialogDescription>
        </DialogHeader>

        {!bibliography && !loading && (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Generates a formatted annotated bibliography with APA citations and brief annotations
              describing each paper's purpose, methodology, and key findings.
            </p>
            <Button onClick={handleGenerate} disabled={paperCount < 1} className="w-full gap-2">
              <BookOpen className="h-4 w-4" />
              {paperCount < 1 ? "Bookmark or analyze papers first" : "Generate Annotated Bibliography"}
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating annotated bibliography...
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {bibliography && !loading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="success">Bibliography Ready</Badge>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-4 text-sm">
              <ReactMarkdown>{bibliography}</ReactMarkdown>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
