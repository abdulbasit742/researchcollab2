import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Post } from "@/hooks/useFeed";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTrustProfile } from "@/hooks/useMyTrustProfile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ExternalLink,
  Flag,
  Microscope,
  Megaphone,
  BookOpen,
  FileText,
  Users,
  Briefcase,
  Shield,
  TrendingUp,
  AlertCircle,
  Handshake,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfessionalReactionBar } from "./ProfessionalReactionBar";
import { OpportunityBridgeCTAs } from "./OpportunityBridgeCTAs";
import { PeerReviewComments } from "@/components/signals/PeerReviewComments";

const postTypeConfig: Record<string, { icon: React.ElementType; label: string; color: string }> = {
  text: { icon: FileText, label: "Update", color: "bg-muted" },
  research_update: { icon: Microscope, label: "Research", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  announcement: { icon: Megaphone, label: "Announcement", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  publication: { icon: BookOpen, label: "Publication", color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  milestone: { icon: Target, label: "Milestone", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  collaboration_request: { icon: Users, label: "Collaboration", color: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
};

// Trust tier configuration
const trustTierConfig = {
  platinum: { label: "Platinum", color: "text-purple-500", bg: "bg-purple-500/10" },
  gold: { label: "Gold", color: "text-amber-500", bg: "bg-amber-500/10" },
  silver: { label: "Silver", color: "text-gray-400", bg: "bg-gray-400/10" },
  bronze: { label: "Bronze", color: "text-orange-400", bg: "bg-orange-400/10" },
};

interface CredibilityFeedCardProps {
  post: Post & { 
    author_trust_score?: number;
    author_trust_tier?: 'platinum' | 'gold' | 'silver' | 'bronze';
    linked_project_title?: string;
    is_failure_context?: boolean;
  };
  showComments?: boolean;
  showOpportunityBridge?: boolean;
}

export function CredibilityFeedCard({ 
  post, 
  showComments = false,
  showOpportunityBridge = true,
}: CredibilityFeedCardProps) {
  const { user } = useAuth();
  const { trustProfile } = useMyTrustProfile();
  
  const [showCommentsPanel, setShowCommentsPanel] = useState(showComments);
  const [showReportModal, setShowReportModal] = useState(false);

  const isAuthor = user?.id === post.author_id;
  const postConfig = postTypeConfig[post.post_type] || postTypeConfig.text;
  const PostTypeIcon = postConfig.icon;
  
  // Author trust tier
  const authorTrustScore = post.author_trust_score ?? 50;
  const authorTrustTier = authorTrustScore >= 80 ? "platinum" : 
                          authorTrustScore >= 60 ? "gold" : 
                          authorTrustScore >= 40 ? "silver" : "bronze";
  const tierConfig = trustTierConfig[authorTrustTier];

  // Check if viewer has low trust (for gating certain actions)
  const viewerTrustScore = trustProfile?.trust_score ?? 0;
  const isLowTrustViewer = viewerTrustScore < 30;

  // Credibility indicators
  const hasLinkedEntity = !!post.linked_entity_id;
  const isFailureContext = post.is_failure_context ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "border-border/50 hover:border-border/80 transition-colors",
        isFailureContext && "border-l-4 border-l-warning"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Link to={`/u/${post.author_id}`}>
                <div className="relative">
                  <Avatar className="h-10 w-10 ring-2 ring-background hover:ring-primary/20 transition-all">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {post.author?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Trust Tier Badge */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center border-2 border-background",
                          tierConfig.bg
                        )}>
                          <Shield className={cn("h-3 w-3", tierConfig.color)} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{tierConfig.label} Tier</p>
                        <p className="text-xs text-muted-foreground">Trust Score: {authorTrustScore}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
                  {isFailureContext && (
                    <Badge variant="outline" className="text-xs gap-1 border-amber-500/50 text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      Failure Context
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
                    View Full Post
                  </Link>
                </DropdownMenuItem>
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
          {/* Linked Entity Banner */}
          {hasLinkedEntity && (
            <div className="mb-3 p-2 rounded-md bg-primary/5 border border-primary/10 flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Linked to:</span>
              <Link 
                to={`/${post.linked_entity_type}s/${post.linked_entity_id}`}
                className="font-medium text-primary hover:underline"
              >
                {post.linked_project_title || `${post.linked_entity_type} #${post.linked_entity_id?.slice(0, 8)}`}
              </Link>
            </div>
          )}

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

        <CardFooter className="pt-0 pb-3 flex-col border-t">
          {/* Professional Reactions - NOT Likes */}
          <div className="w-full py-2">
            <ProfessionalReactionBar 
              postId={post.id} 
              disabled={isLowTrustViewer}
              disabledReason={isLowTrustViewer ? "Build trust to react" : undefined}
            />
          </div>

          {/* Social → Opportunity Bridge CTAs */}
          {showOpportunityBridge && (
            <div className="w-full pt-2 border-t">
              <OpportunityBridgeCTAs 
                authorId={post.author_id}
                postId={post.id}
                linkedEntityType={post.linked_entity_type}
                linkedEntityId={post.linked_entity_id}
                disabled={isLowTrustViewer}
              />
            </div>
          )}

          {/* Peer Review Comments */}
          {showCommentsPanel && (
            <div className="w-full mt-3 pt-3 border-t">
              <PeerReviewComments signalId={post.id} />
            </div>
          )}

          {/* Toggle Comments */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommentsPanel(!showCommentsPanel)}
            className="w-full mt-2"
          >
            {showCommentsPanel ? "Hide" : "Show"} Peer Review
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
