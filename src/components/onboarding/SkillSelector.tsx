import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Search, ChevronDown, ChevronUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const SKILL_CATEGORIES: Record<string, string[]> = {
  Programming: [
    "Python", "R", "MATLAB", "JavaScript", "C++", "Java", "SQL", "Julia",
  ],
  "Data & Analytics": [
    "Data Analysis", "Machine Learning", "Deep Learning", "Statistical Modeling",
    "Data Visualization", "NLP", "Computer Vision", "Big Data",
  ],
  Research: [
    "Literature Review", "Experimental Design", "Qualitative Analysis",
    "Quantitative Analysis", "Survey Design", "Lab Techniques", "Peer Review", "Grant Writing",
  ],
  Design: [
    "UI/UX Design", "Graphic Design", "CAD Modeling", "3D Printing",
    "Scientific Illustration", "Poster Design", "Prototyping", "Figma",
  ],
  Writing: [
    "Academic Writing", "Technical Writing", "Copywriting", "Editing & Proofreading",
    "Proposal Writing", "Report Writing", "Content Strategy", "LaTeX",
  ],
  "Domain Expertise": [
    "Biotechnology", "Nanotechnology", "Renewable Energy", "IoT",
    "Quantum Computing", "Cybersecurity", "Robotics", "Materials Science",
  ],
};

interface SkillSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export function SkillSelector({ selectedSkills, onSkillsChange }: SkillSelectorProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(Object.keys(SKILL_CATEGORIES))
  );

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return SKILL_CATEGORIES;
    const q = search.toLowerCase();
    const result: Record<string, string[]> = {};
    for (const [cat, skills] of Object.entries(SKILL_CATEGORIES)) {
      const matched = skills.filter((s) => s.toLowerCase().includes(q));
      if (matched.length > 0) result[cat] = matched;
    }
    return result;
  }, [search]);

  const toggleSkill = (skill: string) => {
    onSkillsChange(
      selectedSkills.includes(skill)
        ? selectedSkills.filter((s) => s !== skill)
        : [...selectedSkills, skill]
    );
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const selectAllInCategory = (cat: string, skills: string[]) => {
    const allSelected = skills.every((s) => selectedSkills.includes(s));
    if (allSelected) {
      onSkillsChange(selectedSkills.filter((s) => !skills.includes(s)));
    } else {
      const newSkills = new Set([...selectedSkills, ...skills]);
      onSkillsChange(Array.from(newSkills));
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Selected count */}
      {selectedSkills.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {selectedSkills.length} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2 text-muted-foreground"
            onClick={() => onSkillsChange([])}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Categories */}
      <ScrollArea className="h-[280px] pr-2">
        <div className="space-y-3">
          {Object.entries(filteredCategories).map(([category, skills]) => {
            const isExpanded = expandedCategories.has(category);
            const selectedInCat = skills.filter((s) => selectedSkills.includes(s)).length;
            const allSelected = selectedInCat === skills.length;

            return (
              <div key={category} className="rounded-lg border border-border bg-card/50 overflow-hidden">
                {/* Category header */}
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{category}</span>
                    {selectedInCat > 0 && (
                      <Badge variant="default" className="text-[10px] h-5 px-1.5">
                        {selectedInCat}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[11px] h-5 px-2 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAllInCategory(category, skills);
                      }}
                    >
                      {allSelected ? "Deselect" : "Select all"}
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Skills */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-3 pb-3"
                  >
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {skills.map((skill) => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <Badge
                            key={skill}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer transition-all text-xs"
                            onClick={() => toggleSkill(skill)}
                          >
                            {isSelected && <Check className="h-3 w-3 mr-1" />}
                            {skill}
                          </Badge>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
