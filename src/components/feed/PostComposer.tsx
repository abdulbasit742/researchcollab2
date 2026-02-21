import { useState, useMemo, useRef } from "react";
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
  PenLine,
  Hash,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ArticleComposer } from "./ArticleComposer";
import { uploadMedia, validateImageFile } from "@/lib/uploadMedia";
import { toast } from "@/hooks/use-toast";

const MAX_CHARS = 3000;

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

function extractHashtags(text: string): string[] {
  const matches = text.match(/#(\w+)/g);
  return matches ? [...new Set(matches.map((m) => m.slice(1)))] : [];
}

function extractMentions(text: string): string[] {
  const matches = text.match(/@(\w+)/g);
  return matches ? [...new Set(matches.map((m) => m.slice(1)))] : [];
}

export function PostComposer() {
  const { user, profile } = useAuth();
  const createPost = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("text");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showArticleComposer, setShowArticleComposer] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const detectedHashtags = useMemo(() => extractHashtags(content), [content]);
  const detectedMentions = useMemo(() => extractMentions(content), [content]);
  const charCount = content.length;
  const charPercent = Math.min((charCount / MAX_CHARS) * 100, 100);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const previews: string[] = [];

    for (const file of files) {
      if (mediaFiles.length + validFiles.length >= 4) break;
      const err = validateImageFile(file);
      if (err) {
        toast({ title: "Invalid file", description: err, variant: "destructive" });
        continue;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    setMediaFiles(prev => [...prev, ...validFiles]);
    setMediaPreviews(prev => [...prev, ...previews]);
    if (e.target) e.target.value = "";
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if ((!content.trim() && mediaFiles.length === 0) || charCount > MAX_CHARS || !user) return;

    setIsUploading(true);
    try {
      // Upload images
      const mediaUrls: string[] = [];
      for (const file of mediaFiles) {
        const url = await uploadMedia(file, "post-media", user.id);
        mediaUrls.push(url);
      }

      await createPost.mutateAsync({
        content: content.trim(),
        post_type: postType,
        visibility,
        tags: detectedHashtags,
        mentioned_users: detectedMentions,
        media_urls: mediaUrls,
      });

      // Cleanup
      mediaPreviews.forEach(url => URL.revokeObjectURL(url));
      setContent("");
      setPostType("text");
      setVisibility("public");
      setIsExpanded(false);
      setMediaFiles([]);
      setMediaPreviews([]);
    } catch (err) {
      // Error is handled by mutation
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  if (!user) return null;

  return (
    <>
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

              {/* Image Previews */}
              {mediaPreviews.length > 0 && (
                <div className={cn(
                  "grid gap-2",
                  mediaPreviews.length === 1 ? "grid-cols-1" :
                  mediaPreviews.length === 2 ? "grid-cols-2" :
                  mediaPreviews.length === 3 ? "grid-cols-3" : "grid-cols-2"
                )}>
                  {mediaPreviews.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden">
                      <img src={url} alt="" className="w-full h-40 object-cover rounded-lg" />
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {/* Detected Hashtags Preview */}
                    {detectedHashtags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        {detectedHashtags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

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
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          className="hidden"
                          onChange={handleMediaSelect}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-muted-foreground"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={mediaFiles.length >= 4}
                        >
                          <Image className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            Photo {mediaFiles.length > 0 && `(${mediaFiles.length}/4)`}
                          </span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-muted-foreground"
                          onClick={() => setShowArticleComposer(true)}
                        >
                          <PenLine className="h-4 w-4" />
                          <span className="hidden sm:inline">Article</span>
                        </Button>

                        <Select value={visibility} onValueChange={(v) => setVisibility(v as PostVisibility)}>
                          <SelectTrigger className="h-8 w-auto gap-1.5 border-0 bg-transparent">
                            {(() => {
                              const opt = visibilityOptions.find((v) => v.value === visibility);
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
                        {/* Character Count */}
                        <div className="flex items-center gap-1.5">
                          <div className="relative h-5 w-5">
                            <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="8" fill="none" strokeWidth="2" className="stroke-muted" />
                              <circle
                                cx="10" cy="10" r="8" fill="none" strokeWidth="2"
                                strokeDasharray={`${charPercent * 0.502} 50.2`}
                                className={cn(
                                  "transition-all",
                                  charCount > MAX_CHARS ? "stroke-destructive" :
                                  charCount > MAX_CHARS * 0.9 ? "stroke-yellow-500" : "stroke-primary"
                                )}
                              />
                            </svg>
                          </div>
                          {charCount > MAX_CHARS * 0.8 && (
                            <span className={cn("text-xs font-medium", charCount > MAX_CHARS ? "text-destructive" : "text-muted-foreground")}>
                              {MAX_CHARS - charCount}
                            </span>
                          )}
                        </div>

                        <Button
                          variant="ghost" size="sm"
                          onClick={() => {
                            setIsExpanded(false);
                            setContent("");
                            mediaPreviews.forEach(url => URL.revokeObjectURL(url));
                            setMediaFiles([]);
                            setMediaPreviews([]);
                          }}
                          className="h-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSubmit}
                          disabled={(!content.trim() && mediaFiles.length === 0) || charCount > MAX_CHARS || createPost.isPending || isUploading}
                          className="h-8 gap-1.5"
                        >
                          {(createPost.isPending || isUploading) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
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

      <ArticleComposer open={showArticleComposer} onOpenChange={setShowArticleComposer} />
    </>
  );
}
