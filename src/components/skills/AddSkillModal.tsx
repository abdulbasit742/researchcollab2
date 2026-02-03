import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAddSkill } from "@/hooks/useSkills";
import { Loader2 } from "lucide-react";

interface AddSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SKILL_CATEGORIES = [
  { value: "research", label: "Research" },
  { value: "technical", label: "Technical" },
  { value: "writing", label: "Writing" },
  { value: "analysis", label: "Analysis" },
  { value: "domain", label: "Domain Expertise" },
  { value: "soft_skills", label: "Soft Skills" },
];

const PROFICIENCY_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

export function AddSkillModal({ open, onOpenChange }: AddSkillModalProps) {
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState("technical");
  const [proficiency, setProficiency] = useState("intermediate");
  const [isFeatured, setIsFeatured] = useState(false);
  
  const addSkillMutation = useAddSkill();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!skillName.trim()) return;
    
    await addSkillMutation.mutateAsync({
      skill_name: skillName,
      skill_category: category,
      proficiency_level: proficiency,
      is_featured: isFeatured,
    });
    
    setSkillName("");
    setCategory("technical");
    setProficiency("intermediate");
    setIsFeatured(false);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Skill</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skillName">Skill Name</Label>
            <Input
              id="skillName"
              placeholder="e.g., Machine Learning, Data Analysis"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SKILL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="proficiency">Proficiency Level</Label>
            <Select value={proficiency} onValueChange={setProficiency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROFICIENCY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="featured" className="cursor-pointer">
              Feature this skill on profile
            </Label>
            <Switch
              id="featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addSkillMutation.isPending || !skillName.trim()}>
              {addSkillMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Skill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
