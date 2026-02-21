import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PostContent } from "./PostContent";
import { Repeat2 } from "lucide-react";

interface RepostCardProps {
  originalPost: {
    id: string;
    content: string;
    author_id: string;
    created_at: string;
    author?: {
      full_name: string | null;
      university?: string | null;
    };
  };
}

export function RepostCard({ originalPost }: RepostCardProps) {
  return (
    <div className="mt-3 border border-border/60 rounded-lg p-3 bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Repeat2 className="h-3.5 w-3.5 text-muted-foreground" />
        <Link to={`/u/${originalPost.author_id}`} className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {originalPost.author?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium hover:text-primary transition-colors">
            {originalPost.author?.full_name || "Unknown"}
          </span>
        </Link>
        <span className="text-xs text-muted-foreground">
          • {formatDistanceToNow(new Date(originalPost.created_at), { addSuffix: true })}
        </span>
      </div>
      <PostContent content={originalPost.content} />
    </div>
  );
}
