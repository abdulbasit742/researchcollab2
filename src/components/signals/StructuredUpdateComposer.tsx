import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { 
  useCreateProfessionalUpdate, 
  PROFESSIONAL_UPDATE_TYPES,
  ProfessionalUpdateType,
} from "@/hooks/useProfessionalSignals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  X,
  Link as LinkIcon,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StructuredUpdateComposer() {
  const { user, profile } = useAuth();
  const createUpdate = useCreateProfessionalUpdate();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [updateType, setUpdateType] = useState<ProfessionalUpdateType>("case_outcome");
  const [content, setContent] = useState("");
  const [linkedEntityType, setLinkedEntityType] = useState<string>("");
  const [linkedEntityId, setLinkedEntityId] = useState("");
  const [isFailureContext, setIsFailureContext] = useState(false);

  const selectedConfig = PROFESSIONAL_UPDATE_TYPES[updateType];

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await createUpdate.mutateAsync({
      updateType,
      content: content.trim(),
      linkedEntityType: linkedEntityType as any || undefined,
      linkedEntityId: linkedEntityId || undefined,
      isFailureContext,
    });
    
    // Reset form
    setContent("");
    setUpdateType("case_outcome");
    setLinkedEntityType("");
    setLinkedEntityId("");
    setIsFailureContext(false);
    setIsExpanded(false);
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
            {/* Collapsed State */}
            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="w-full text-left p-3 bg-muted/50 rounded-lg border border-border/50 text-muted-foreground hover:border-border transition-colors"
              >
                Share a professional update (work, research, outcomes, lessons)...
              </button>
            )}

            {/* Expanded State */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Update Type Selection */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Update Type</Label>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(PROFESSIONAL_UPDATE_TYPES) as [ProfessionalUpdateType, typeof PROFESSIONAL_UPDATE_TYPES[ProfessionalUpdateType]][]).map(
                        ([type, config]) => (
                          <button
                            key={type}
                            onClick={() => setUpdateType(type)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                              updateType === type
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            )}
                          >
                            <span>{config.icon}</span>
                            {config.label}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <Textarea
                    placeholder={selectedConfig?.description || "Share your professional update..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] resize-none border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary/50"
                  />

                  {/* Linked Entity (if required) */}
                  {selectedConfig?.requiresLink && (
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LinkIcon className="h-4 w-4" />
                        <span>Link to work (required for {selectedConfig.label})</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Select value={linkedEntityType} onValueChange={setLinkedEntityType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="project">Project</SelectItem>
                            <SelectItem value="offer">Opportunity</SelectItem>
                            <SelectItem value="publication">Publication</SelectItem>
                            <SelectItem value="grant">Grant</SelectItem>
                            <SelectItem value="milestone">Milestone</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Entity ID or URL..."
                          value={linkedEntityId}
                          onChange={(e) => setLinkedEntityId(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Failure Context Toggle */}
                  {(updateType === 'lesson_learned' || updateType === 'case_outcome') && (
                    <div className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <div>
                          <p className="text-sm font-medium">Learning from failure?</p>
                          <p className="text-xs text-muted-foreground">
                            Sharing failures builds trust through transparency
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={isFailureContext}
                        onCheckedChange={setIsFailureContext}
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Professional updates are visible to relevant professionals
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsExpanded(false);
                          setContent("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={
                          !content.trim() || 
                          createUpdate.isPending ||
                          (selectedConfig?.requiresLink && !linkedEntityId)
                        }
                        className="gap-1.5"
                      >
                        {createUpdate.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Publish
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
