import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Star,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProvenSkill {
  name: string;
  projectCount: number;
  isProven: boolean;
  endorsementCount?: number;
}

interface ProvenSkillsBadgeProps {
  skills: ProvenSkill[];
  maxDisplay?: number;
  className?: string;
}

export function ProvenSkillsBadge({ 
  skills, 
  maxDisplay = 5,
  className 
}: ProvenSkillsBadgeProps) {
  const displaySkills = skills.slice(0, maxDisplay);
  const remaining = skills.length - maxDisplay;

  if (skills.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {displaySkills.map((skill) => (
        <TooltipProvider key={skill.name}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={skill.isProven ? "default" : "secondary"}
                className={cn(
                  "gap-1 cursor-help",
                  skill.isProven 
                    ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20" 
                    : ""
                )}
              >
                {skill.isProven ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Sparkles className="h-3 w-3 opacity-50" />
                )}
                {skill.name}
                {skill.projectCount > 0 && (
                  <span className="text-[10px] opacity-70">({skill.projectCount})</span>
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">{skill.name}</p>
                {skill.isProven ? (
                  <p className="text-xs text-muted-foreground">
                    Proven in {skill.projectCount} completed project{skill.projectCount !== 1 ? "s" : ""}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Self-declared skill (not yet proven via work)
                  </p>
                )}
                {skill.endorsementCount && skill.endorsementCount > 0 && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {skill.endorsementCount} endorsement{skill.endorsementCount !== 1 ? "s" : ""} from collaborators
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remaining} more
        </Badge>
      )}
    </div>
  );
}

interface SkillsSectionProps {
  provenSkills: ProvenSkill[];
  claimedSkills: string[];
  className?: string;
}

export function SkillsSection({ 
  provenSkills, 
  claimedSkills,
  className 
}: SkillsSectionProps) {
  // Merge and categorize skills
  const provenNames = new Set(provenSkills.map(s => s.name.toLowerCase()));
  const onlyClaimedSkills = claimedSkills.filter(
    skill => !provenNames.has(skill.toLowerCase())
  );

  return (
    <div className={cn("space-y-4", className)}>
      {provenSkills.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Proven Skills
          </h4>
          <ProvenSkillsBadge skills={provenSkills} maxDisplay={10} />
        </div>
      )}

      {onlyClaimedSkills.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Other Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {onlyClaimedSkills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-muted-foreground">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {provenSkills.length === 0 && onlyClaimedSkills.length === 0 && (
        <p className="text-sm text-muted-foreground">No skills added yet</p>
      )}
    </div>
  );
}
