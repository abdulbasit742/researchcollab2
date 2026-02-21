import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePost, PostVisibility } from "@/hooks/useFeed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Users, Lock, Send, Sparkles } from "lucide-react";

const visibilityOptions = [
  { value: "public" as const, label: "Everyone", icon: Globe },
  { value: "connections" as const, label: "Connections", icon: Users },
  { value: "private" as const, label: "Only me", icon: Lock },
];

interface ArticleComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArticleComposer({ open, onOpenChange }: ArticleComposerProps) {
  const { user } = useAuth();
  const createPost = useCreatePost();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    const fullContent = `# ${title.trim()}\n\n${content.trim()}`;

    await createPost.mutateAsync({
      content: fullContent,
      post_type: "publication",
      visibility,
    });

    setTitle("");
    setContent("");
    setVisibility("public");
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write an Article</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold border-0 border-b rounded-none focus-visible:ring-0 px-0"
          />

          <Textarea
            placeholder="Write your article content here... You can use markdown formatting."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] resize-none border-0 focus-visible:ring-0 px-0"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{content.length} characters</span>
            <span>~{Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)} min read</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Select value={visibility} onValueChange={(v) => setVisibility(v as PostVisibility)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {visibilityOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {opt.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || createPost.isPending}
            className="gap-1.5"
          >
            {createPost.isPending ? (
              <Sparkles className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Publish Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
