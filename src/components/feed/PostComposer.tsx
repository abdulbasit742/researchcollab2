import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePost, PostType, PostVisibility } from "@/hooks/useFeed";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Image,
  FileText,
  Microscope,
  Megaphone,
  BookOpen,
  Users,
  Globe,
  Lock,
  Send,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const postTypes: { value: PostType; label: string; icon: React.ElementType }[] = [
  { value: "text", label: "Post", icon: FileText },
  { value: "research_update", label: "Research Update", icon: Microscope },
  { value: "announcement", label: "Announcement", icon: Megaphone },
  { value: "publication", label: "Publication", icon: BookOpen },
  { value: "collaboration_request", label: "Collaboration", icon: Users },
];

const visibilityOptions: { value: PostVisibility; label: string; icon: React.ElementType }[] = [
  { value: "public", label: "Everyone", icon: Globe },
  { value: "connections", label: "Connections", icon: Users },
  { value: "followers", label: "Followers", icon: Users },
  { value: "private", label: "Only me", icon: Lock },
];

export function PostComposer() {
  const { user, profile } = useAuth();
  const createPost = useCreatePost();
  
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("text");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await createPost.mutateAsync({
      content: content.trim(),
      post_type: postType,
      visibility,
    });
    
    setContent("");
    setPostType("text");
    setVisibility("public");
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  if (!user) return null;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary">
              {profile?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share your research, insights, or updates..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onKeyDown={handleKeyDown}
              className={cn(
                "min-h-[60px] resize-none border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all",
                isExpanded && "min-h-[120px]"
              )}
            />

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {/* Post Type Selection */}
                  <div className="flex flex-wrap gap-2">
                    {postTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = postType === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setPostType(type.value)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80 text-muted-foreground"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground">
                        <Image className="h-4 w-4" />
                        <span className="hidden sm:inline">Media</span>
                      </Button>
                      
                      <Select value={visibility} onValueChange={(v) => setVisibility(v as PostVisibility)}>
                        <SelectTrigger className="h-8 w-auto gap-1.5 border-0 bg-transparent">
                          {(() => {
                            const opt = visibilityOptions.find(v => v.value === visibility);
                            const Icon = opt?.icon || Globe;
                            return (
                              <>
                                <Icon className="h-4 w-4" />
                                <SelectValue />
                              </>
                            );
                          })()}
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

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsExpanded(false);
                          setContent("");
                        }}
                        className="h-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!content.trim() || createPost.isPending}
                        className="h-8 gap-1.5"
                      >
                        {createPost.isPending ? (
                          <Sparkles className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Post
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
