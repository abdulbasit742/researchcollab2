import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { usePostComments, useCreateComment, useLikeComment, PostComment } from "@/hooks/useFeed";
import { usePeerValidation } from "@/hooks/useProfessionalSignals";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Send, 
  CheckCircle2, 
  Shield,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PeerReviewCommentsProps {
  signalId: string;
}

const VALIDATION_TYPES = [
  { type: 'accurate', label: 'Accurate', icon: CheckCircle2 },
  { type: 'can_confirm', label: 'Can Confirm', icon: ThumbsUp },
  { type: 'worked_with', label: 'Worked With', icon: Shield },
] as const;

export function PeerReviewComments({ signalId }: PeerReviewCommentsProps) {
  const { user, profile } = useAuth();
  const { data: comments, isLoading } = usePostComments(signalId);
  const createComment = useCreateComment();
  
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    await createComment.mutateAsync({
      postId: signalId,
      content: newComment.trim(),
    });
    
    setNewComment("");
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comment Guidelines */}
      <div className="p-2 bg-muted/30 rounded-md border border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Comments here function as <span className="font-medium text-foreground">peer review</span>. 
          Add clarification, validation, or constructive critique.
        </p>
      </div>

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
              placeholder="Add professional feedback or validation..."
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
            <PeerReviewCommentItem
              key={comment.id}
              comment={comment}
              signalId={signalId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            No peer reviews yet. Be the first to add professional feedback.
          </p>
        </div>
      )}
    </div>
  );
}

interface PeerReviewCommentItemProps {
  comment: PostComment;
  signalId: string;
}

function PeerReviewCommentItem({ comment, signalId }: PeerReviewCommentItemProps) {
  const { user } = useAuth();
  const likeComment = useLikeComment();
  const { validate, isValidating } = usePeerValidation(comment.id);

  const handleValidate = (validationType: typeof VALIDATION_TYPES[number]['type']) => {
    validate(validationType);
  };

  return (
    <div className="flex gap-2">
      <Link to={`/u/${comment.user_id}`}>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="text-xs bg-muted">
            {comment.author?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <div className="bg-muted/30 rounded-lg px-3 py-2 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Link 
              to={`/u/${comment.user_id}`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {comment.author?.full_name || "Professional"}
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
        
        {/* Validation Actions */}
        <div className="flex items-center gap-2 mt-1.5 ml-1">
          <TooltipProvider delayDuration={200}>
            {VALIDATION_TYPES.map(({ type, label, icon: Icon }) => (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleValidate(type)}
                    disabled={isValidating || comment.has_liked}
                    className={cn(
                      "text-xs flex items-center gap-1 px-2 py-0.5 rounded transition-colors",
                      comment.has_liked 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:text-primary hover:bg-muted"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark this feedback as "{label}"</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
          
          {comment.likes_count > 0 && (
            <Badge variant="secondary" className="text-xs h-5">
              {comment.likes_count} validated
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
