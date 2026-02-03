import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { 
  ProfessionalSignal, 
  PROFESSIONAL_UPDATE_TYPES,
  useProfessionalReactions,
} from "@/hooks/useProfessionalSignals";
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
  MoreHorizontal,
  ExternalLink,
  Flag,
  MessageSquare,
  ArrowRight,
  Shield,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfessionalReactionPicker, ReactionsSummary } from "./ProfessionalReactionPicker";
import { PeerReviewComments } from "./PeerReviewComments";

interface ProfessionalSignalCardProps {
  signal: ProfessionalSignal;
  showComments?: boolean;
}

export function ProfessionalSignalCard({ signal, showComments = false }: ProfessionalSignalCardProps) {
  const { user } = useAuth();
  const { react, removeReaction, isReacting } = useProfessionalReactions(signal.id);
  
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(showComments);
  
  const updateConfig = PROFESSIONAL_UPDATE_TYPES[signal.update_type];
  const isAuthor = user?.id === signal.author_id;

  const handleReactionSelect = (type: Parameters<typeof react>[0]) => {
    if (signal.my_reaction === type) {
      removeReaction();
    } else {
      react(type);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "border-border/50 hover:border-border/80 transition-colors",
        signal.is_failure_context && "border-l-4 border-l-amber-500/50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Link to={`/u/${signal.author_id}`}>
                <Avatar className="h-10 w-10 ring-2 ring-background hover:ring-primary/20 transition-all">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {signal.author?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link 
                    to={`/u/${signal.author_id}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {signal.author?.full_name || "Unknown Professional"}
                  </Link>
                  
                  {/* Trust Score Badge */}
                  {signal.author?.trust_score !== undefined && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Shield className="h-3 w-3" />
                      {signal.author.trust_score}
                    </Badge>
                  )}
                  
                  {/* Update Type Badge */}
                  <Badge variant="secondary" className="text-xs">
                    <span className="mr-1">{updateConfig?.icon}</span>
                    {updateConfig?.label || "Update"}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {signal.author?.university && (
                    <>
                      <span>{signal.author.university}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{formatDistanceToNow(new Date(signal.created_at), { addSuffix: true })}</span>
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
                  <Link to={`/posts/${signal.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {!isAuthor && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 mr-2" />
                      Report Issue
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {/* Failure Context Warning */}
          {signal.is_failure_context && (
            <div className="flex items-center gap-2 p-2 mb-3 bg-amber-500/10 rounded-md border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Learning from failure — transparency builds trust
              </span>
            </div>
          )}
          
          {/* Content */}
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{signal.content}</p>
          
          {/* Linked Entity */}
          {signal.linked_entity_id && (
            <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 text-sm">
                <LinkIcon className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Linked to:</span>
                <Link 
                  to={`/${signal.linked_entity_type}s/${signal.linked_entity_id}`}
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  {signal.linked_entity_title || `View ${signal.linked_entity_type}`}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Reactions Summary */}
          {signal.reaction_counts && (
            <div className="mt-3">
              <ReactionsSummary 
                reactions={signal.reaction_counts}
                myReaction={signal.my_reaction}
                onReactionClick={handleReactionSelect}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 pb-3 flex-col">
          {/* Action Buttons */}
          <div className="w-full border-t pt-2">
            <div className="flex items-center justify-between">
              {/* Professional Reaction Button */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReactionPicker(!showReactionPicker)}
                  disabled={isReacting}
                  className={cn(
                    "gap-1.5",
                    signal.my_reaction && "text-primary"
                  )}
                >
                  <span className="text-base">
                    {signal.my_reaction 
                      ? PROFESSIONAL_UPDATE_TYPES[signal.update_type]?.icon || "📌"
                      : "📌"}
                  </span>
                  <span className="hidden sm:inline">React</span>
                </Button>
                <ProfessionalReactionPicker
                  isOpen={showReactionPicker}
                  onSelect={handleReactionSelect}
                  onClose={() => setShowReactionPicker(false)}
                  currentReaction={signal.my_reaction}
                  disabled={isReacting}
                />
              </div>
              
              {/* Peer Review Comments */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommentsPanel(!showCommentsPanel)}
                className="gap-1.5"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Peer Review</span>
                {signal.peer_validations_count !== undefined && signal.peer_validations_count > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 text-xs">
                    {signal.peer_validations_count}
                  </Badge>
                )}
              </Button>
              
              {/* Collaborate CTA */}
              {signal.update_type === 'collaboration_request' && (
                <Button
                  size="sm"
                  variant="default"
                  className="gap-1.5"
                  asChild
                >
                  <Link to={`/messages?to=${signal.author_id}`}>
                    Collaborate
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Peer Review Comments Section */}
          {showCommentsPanel && (
            <div className="w-full mt-3 pt-3 border-t">
              <PeerReviewComments signalId={signal.id} />
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
