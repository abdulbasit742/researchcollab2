import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useHasEndorsedSkill, useEndorseSkill, useRemoveEndorsement } from "@/hooks/useSkills";
import type { UserSkill } from "@/hooks/useSkills";

interface SkillCardProps {
  skill: UserSkill;
  isOwn?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
}

export function SkillCard({ skill, isOwn, onEdit, onRemove }: SkillCardProps) {
  const { user } = useAuth();
  const { data: hasEndorsed, isLoading: checkingEndorsement } = useHasEndorsedSkill(skill.id);
  const endorseMutation = useEndorseSkill();
  const removeEndorsementMutation = useRemoveEndorsement();
  
  const canEndorse = user && !isOwn && user.id !== skill.user_id;
  const isEndorsing = endorseMutation.isPending || removeEndorsementMutation.isPending;
  
  const handleEndorse = () => {
    if (hasEndorsed) {
      removeEndorsementMutation.mutate(skill.id);
    } else {
      endorseMutation.mutate({ skillId: skill.id });
    }
  };
  
  const getProficiencyColor = (level: string) => {
    switch (level) {
      case "expert": return "bg-primary text-primary-foreground";
      case "advanced": return "bg-green-500/20 text-green-700 dark:text-green-300";
      case "intermediate": return "bg-blue-500/20 text-blue-700 dark:text-blue-300";
      case "beginner": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };
  
  return (
    <Card className="relative overflow-hidden">
      {skill.is_featured && (
        <div className="absolute top-0 right-0 p-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm capitalize line-clamp-1">
              {skill.skill_name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs capitalize">
                {skill.skill_category.replace("_", " ")}
              </Badge>
              <Badge className={`text-xs capitalize ${getProficiencyColor(skill.proficiency_level)}`}>
                {skill.proficiency_level}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span className="text-sm font-medium">{skill.endorsement_count}</span>
          </div>
        </div>
        
        {canEndorse && (
          <Button
            variant={hasEndorsed ? "secondary" : "outline"}
            size="sm"
            className="w-full mt-3"
            onClick={handleEndorse}
            disabled={checkingEndorsement || isEndorsing}
          >
            {checkingEndorsement || isEndorsing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : hasEndorsed ? (
              "Endorsed ✓"
            ) : (
              <>
                <ThumbsUp className="h-4 w-4 mr-1" />
                Endorse
              </>
            )}
          </Button>
        )}
        
        {isOwn && (
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
              Remove
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
