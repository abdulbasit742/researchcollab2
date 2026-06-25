import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectTemplatesByType, type ProjectTemplate } from "@/config/projectTemplates";
import type { ProjectCreationType } from "@/config/projectCreation";
import { FilePlus2, Sparkles } from "lucide-react";

type ProjectTemplatePickerProps = {
  activeType?: ProjectCreationType;
  onApply: (template: ProjectTemplate) => void;
};

export function ProjectTemplatePicker({ activeType, onApply }: ProjectTemplatePickerProps) {
  const templates = getProjectTemplatesByType(activeType);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Start from a project template
        </CardTitle>
        <CardDescription>
          Pick a template to auto-fill the brief, skills, outcomes, timeline, and budget. You can edit everything after applying it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="rounded-lg border bg-background p-4 space-y-3">
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold leading-tight">{template.title}</h4>
                  <Badge variant="outline">{template.prototype_tier}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{template.recommended_for}</p>
              </div>

              <p className="line-clamp-2 text-sm text-muted-foreground">{template.problem_description}</p>

              <div className="flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{template.preferred_timeline}</span>
                <span>{template.budget_range}</span>
              </div>

              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => onApply(template)}>
                <FilePlus2 className="mr-2 h-4 w-4" /> Apply template
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
