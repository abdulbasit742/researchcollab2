import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { PostComment, usePostComments, useCreateComment, useLikeComment } from "@/hooks/useFeed";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Reply, Send, CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface CommentThreadProps {
  postId: string;
}

export function CommentThread({ postId }: CommentThreadProps) {
  const { user, profile } = useAuth();
  const { data: comments, isLoading } = usePostComments(postId);
  const createComment = useCreateComment();
  
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    await createComment.mutateAsync({
      postId,
      content: newComment.trim(),
    });
    
    setNewComment("");
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    await createComment.mutateAsync({
      postId,
      content: replyContent.trim(),
      parentCommentId: parentId,
    });
    
    setReplyContent("");
    setReplyingTo(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      {user && (
        <div className="flex gap-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {profile?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[40px] text-sm resize-none flex-1"
              rows={1}
            />
            <Button
              size="sm"
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || createComment.isPending}
              className="h-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments && comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
              isSubmitting={createComment.isPending}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: PostComment;
  postId: string;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string) => void;
  isSubmitting: boolean;
  isReply?: boolean;
}

function CommentItem({
  comment,
  postId,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  isSubmitting,
  isReply = false,
}: CommentItemProps) {
  const { user, profile } = useAuth();
  const likeComment = useLikeComment();

  const handleLike = () => {
    likeComment.mutate({
      commentId: comment.id,
      postId,
      isLiked: comment.has_liked || false,
    });
  };

  return (
    <div className={cn("space-y-2", isReply && "ml-8")}>
      <div className="flex gap-2">
        <Link to={`/u/${comment.user_id}`}>
          <Avatar className={cn("shrink-0", isReply ? "h-6 w-6" : "h-8 w-8")}>
            <AvatarFallback className="text-xs bg-muted">
              {comment.author?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 mb-0.5">
              <Link 
                to={`/u/${comment.user_id}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {comment.author?.full_name || "Unknown"}
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              {comment.is_edited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-3 mt-1 ml-1">
            <button
              onClick={handleLike}
              className={cn(
                "text-xs flex items-center gap-1 hover:text-primary transition-colors",
                comment.has_liked ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <Heart className={cn("h-3 w-3", comment.has_liked && "fill-current")} />
              {comment.likes_count > 0 && comment.likes_count}
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <Reply className="h-3 w-3" />
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Input */}
      {replyingTo === comment.id && user && (
        <div className="ml-8 flex gap-2">
          <CornerDownRight className="h-4 w-4 text-muted-foreground mt-2" />
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {profile?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder={`Reply to ${comment.author?.full_name || "user"}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[36px] text-sm resize-none flex-1"
              rows={1}
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => onSubmitReply(comment.id)}
              disabled={!replyContent.trim() || isSubmitting}
              className="h-9"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={onSubmitReply}
              isSubmitting={isSubmitting}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
