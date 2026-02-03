import { useState } from "react";
import { Post, useSharePost, PostVisibility } from "@/hooks/useFeed";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Globe, Users, Lock, Share2 } from "lucide-react";

interface ShareModalProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const visibilityOptions = [
  { value: "public", label: "Everyone", icon: Globe },
  { value: "connections", label: "Connections", icon: Users },
  { value: "followers", label: "Followers", icon: Users },
  { value: "private", label: "Only me", icon: Lock },
];

export function ShareModal({ post, open, onOpenChange }: ShareModalProps) {
  const sharePost = useSharePost();
  const [comment, setComment] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");

  const handleShare = async () => {
    await sharePost.mutateAsync({
      postId: post.id,
      comment: comment.trim() || undefined,
      visibility,
    });
    
    setComment("");
    setVisibility("public");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Post
          </DialogTitle>
          <DialogDescription>
            Share this post with your network
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-2">
            <Label>Add your thoughts (optional)</Label>
            <Textarea
              placeholder="Write something about this post..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label>Who can see this?</Label>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as PostVisibility)}>
              <SelectTrigger>
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
          </div>

          {/* Preview of original post */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Sharing:</Label>
            <Card className="p-3 bg-muted/30">
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {post.author?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {post.author?.full_name || "Unknown User"}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {post.content}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={sharePost.isPending}>
            {sharePost.isPending ? "Sharing..." : "Share"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
