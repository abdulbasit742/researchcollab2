import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Check, Reply, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  anchor_text: string | null;
  is_suggestion: boolean;
  suggestion_content: string | null;
  suggestion_status: string;
  is_resolved: boolean;
  parent_comment_id: string | null;
  created_at: string;
}

interface DocumentCommentsPanelProps {
  documentId: string;
}

export function DocumentCommentsPanel({ documentId }: DocumentCommentsPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from("document_comments")
      .select("id, user_id, content, anchor_text, is_suggestion, suggestion_content, suggestion_status, is_resolved, parent_comment_id, created_at")
      .eq("document_id", documentId)
      .order("created_at", { ascending: true });
    if (data) setComments(data as unknown as Comment[]);
  }, [documentId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const addComment = async (parentId?: string) => {
    const text = parentId ? replyText : newComment;
    if (!text.trim() || !user) return;
    const { error } = await supabase.from("document_comments").insert({
      document_id: documentId,
      user_id: user.id,
      content: text.trim(),
      parent_comment_id: parentId || null,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    if (parentId) { setReplyText(""); setReplyingTo(null); }
    else setNewComment("");
    fetchComments();
  };

  const resolveComment = async (id: string) => {
    await supabase.from("document_comments").update({
      is_resolved: true,
      resolved_by: user?.id,
      resolved_at: new Date().toISOString(),
    } as any).eq("id", id);
    fetchComments();
  };

  const topLevel = comments.filter(c => !c.parent_comment_id);
  const replies = (parentId: string) => comments.filter(c => c.parent_comment_id === parentId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Comments ({topLevel.length})
        </h4>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {topLevel.map(c => (
            <div key={c.id} className={`rounded-lg border p-2.5 text-sm ${c.is_resolved ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                </span>
                {c.is_suggestion && (
                  <Badge variant="outline" className="text-[10px] h-4">Suggestion</Badge>
                )}
              </div>
              {c.anchor_text && (
                <div className="text-xs bg-muted px-2 py-1 rounded mb-1.5 italic border-l-2 border-primary">
                  "{c.anchor_text}"
                </div>
              )}
              <p className="text-sm">{c.content}</p>

              <div className="flex items-center gap-1 mt-2">
                {!c.is_resolved && (
                  <>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => resolveComment(c.id)}>
                      <Check className="h-3 w-3" /> Resolve
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={() => setReplyingTo(c.id)}>
                      <Reply className="h-3 w-3" /> Reply
                    </Button>
                  </>
                )}
              </div>

              {replies(c.id).map(r => (
                <div key={r.id} className="ml-3 mt-2 pl-2 border-l text-xs">
                  <p>{r.content}</p>
                  <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}

              {replyingTo === c.id && (
                <div className="mt-2 flex gap-1">
                  <Textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Reply..."
                    className="min-h-[40px] text-xs"
                    rows={1}
                  />
                  <Button size="icon" className="h-8 w-8 shrink-0" onClick={() => addComment(c.id)}>
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <div className="flex gap-1.5">
          <Textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[40px] text-xs"
            rows={2}
          />
          <Button size="icon" className="h-10 w-10 shrink-0" onClick={() => addComment()} disabled={!newComment.trim()}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
