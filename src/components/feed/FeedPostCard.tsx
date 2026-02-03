import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Post, useLikePost, useBookmarkPost, useDeletePost } from "@/hooks/useFeed";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
  ExternalLink,
  Globe,
  Users,
  Lock,
  Microscope,
  Megaphone,
  BookOpen,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentThread } from "./CommentThread";
import { ShareModal } from "./ShareModal";
import { ReportPostModal } from "./ReportPostModal";

const postTypeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  text: { icon: FileText, label: "Post", color: "bg-muted" },
  research_update: { icon: Microscope, label: "Research Update", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  announcement: { icon: Megaphone, label: "Announcement", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  publication: { icon: BookOpen, label: "Publication", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  organization_post: { icon: Users, label: "Organization", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  milestone: { icon: Microscope, label: "Milestone", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  collaboration_request: { icon: Users, label: "Collaboration", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
};

const visibilityConfig: Record<string, { icon: React.ElementType; label: string }> = {
  public: { icon: Globe, label: "Public" },
  connections: { icon: Users, label: "Connections" },
  followers: { icon: Users, label: "Followers" },
  private: { icon: Lock, label: "Private" },
};

interface FeedPostCardProps {
  post: Post;
  showComments?: boolean;
}

export function FeedPostCard({ post, showComments = false }: FeedPostCardProps) {
  const { user } = useAuth();
  const likePost = useLikePost();
  const bookmarkPost = useBookmarkPost();
  const deletePost = useDeletePost();

  const [showCommentsPanel, setShowCommentsPanel] = useState(showComments);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isAuthor = user?.id === post.author_id;
  const postConfig = postTypeConfig[post.post_type] || postTypeConfig.text;
  const visConfig = visibilityConfig[post.visibility] || visibilityConfig.public;
  const PostTypeIcon = postConfig.icon;
  const VisIcon = visConfig.icon;

  const handleLike = () => {
    likePost.mutate({ postId: post.id, isLiked: post.has_liked || false });
  };

  const handleBookmark = () => {
    bookmarkPost.mutate({ postId: post.id, isBookmarked: post.has_bookmarked || false });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate(post.id);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/50 hover:border-border/80 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Link to={`/u/${post.author_id}`}>
                  <Avatar className="h-10 w-10 ring-2 ring-background hover:ring-primary/20 transition-all">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {post.author?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link 
                      to={`/u/${post.author_id}`}
                      className="font-semibold hover:text-primary transition-colors"
                    >
                      {post.author?.full_name || "Unknown User"}
                    </Link>
                    {post.post_type !== "text" && (
                      <Badge variant="secondary" className={cn("text-xs", postConfig.color)}>
                        <PostTypeIcon className="h-3 w-3 mr-1" />
                        {postConfig.label}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {post.author?.university && (
                      <>
                        <span>{post.author.university}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    {post.is_edited && (
                      <>
                        <span>•</span>
                        <span>Edited</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <VisIcon className="h-3 w-3" />
                      {visConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/posts/${post.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Post
                    </Link>
                  </DropdownMenuItem>
                  {isAuthor && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isAuthor && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setShowReportModal(true)}>
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-0 pb-3 flex-col">
            {/* Engagement Stats */}
            <div className="w-full flex items-center justify-between text-xs text-muted-foreground mb-2 px-1">
              <span>
                {post.likes_count > 0 && `${post.likes_count} like${post.likes_count !== 1 ? "s" : ""}`}
              </span>
              <div className="flex gap-3">
                {post.comments_count > 0 && (
                  <span>{post.comments_count} comment{post.comments_count !== 1 ? "s" : ""}</span>
                )}
                {post.shares_count > 0 && (
                  <span>{post.shares_count} share{post.shares_count !== 1 ? "s" : ""}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full border-t pt-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={cn(
                    "gap-1.5 flex-1",
                    post.has_liked && "text-destructive hover:text-destructive"
                  )}
                >
                  <Heart className={cn("h-4 w-4", post.has_liked && "fill-current")} />
                  <span className="hidden sm:inline">Like</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                  className="gap-1.5 flex-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Comment</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  className="gap-1.5 flex-1"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={cn(
                    "gap-1.5",
                    post.has_bookmarked && "text-primary"
                  )}
                >
                  <Bookmark className={cn("h-4 w-4", post.has_bookmarked && "fill-current")} />
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            {showCommentsPanel && (
              <div className="w-full mt-3 pt-3 border-t">
                <CommentThread postId={post.id} />
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>

      <ShareModal 
        post={post} 
        open={showShareModal} 
        onOpenChange={setShowShareModal} 
      />
      
      <ReportPostModal
        postId={post.id}
        open={showReportModal}
        onOpenChange={setShowReportModal}
      />
    </>
  );
}
