import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Sparkles, AlertCircle } from "lucide-react";
import { milestoneTemplates } from "@/data/wallet";

export interface MilestoneInput {
  title: string;
  description: string;
  amount: number;
  expectedDelivery: string;
}

interface MilestoneFormProps {
  totalBudget: number;
  milestones: MilestoneInput[];
  onChange: (milestones: MilestoneInput[]) => void;
}

export function MilestoneForm({ totalBudget, milestones, onChange }: MilestoneFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const totalAllocated = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const remaining = totalBudget - totalAllocated;
  const isValid = Math.abs(remaining) < 0.01;

  const addMilestone = () => {
    onChange([
      ...milestones,
      {
        title: "",
        description: "",
        amount: remaining > 0 ? remaining : 0,
        expectedDelivery: "",
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      onChange(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: string | number) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const applyTemplate = (templateName: string) => {
    const template = milestoneTemplates.find(t => t.name === templateName);
    if (!template) return;

    const newMilestones = template.milestones.map((m, index) => ({
      title: m.title,
      description: "",
      amount: Math.round((totalBudget * m.percentage) / 100),
      expectedDelivery: "",
    }));

    onChange(newMilestones);
    setSelectedTemplate(templateName);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Milestones</Label>
        <Select value={selectedTemplate} onValueChange={applyTemplate}>
          <SelectTrigger className="w-48">
            <Sparkles className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Use Template" />
          </SelectTrigger>
          <SelectContent>
            {milestoneTemplates.map((template) => (
              <SelectItem key={template.name} value={template.name}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget Allocation Status */}
      <div className={`p-3 rounded-lg border ${
        isValid 
          ? "bg-emerald-500/10 border-emerald-500/20" 
          : "bg-amber-500/10 border-amber-500/20"
      }`}>
        <div className="flex items-center justify-between text-sm">
          <span>Total Budget: ${totalBudget}</span>
          <span>Allocated: ${totalAllocated}</span>
          <span className={isValid ? "text-emerald-600" : "text-amber-600"}>
            {isValid ? "✓ Balanced" : `${remaining > 0 ? "+" : ""}$${remaining} remaining`}
          </span>
        </div>
      </div>

      {!isValid && (
        <div className="flex items-center gap-2 text-xs text-amber-600">
          <AlertCircle className="h-3 w-3" />
          <span>Milestone amounts must equal the total budget</span>
        </div>
      )}

      {/* Milestone Items */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <div key={index} className="p-4 rounded-lg border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Milestone {index + 1}</Badge>
              {milestones.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Title *</Label>
                <Input
                  placeholder="e.g., Initial Draft"
                  value={milestone.title}
                  onChange={(e) => updateMilestone(index, "title", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Amount ($) *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={milestone.amount || ""}
                    onChange={(e) => updateMilestone(index, "amount", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Due Date</Label>
                  <Input
                    type="date"
                    value={milestone.expectedDelivery}
                    onChange={(e) => updateMilestone(index, "expectedDelivery", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                placeholder="What should be delivered in this milestone..."
                rows={2}
                value={milestone.description}
                onChange={(e) => updateMilestone(index, "description", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addMilestone}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Milestone
      </Button>
    </div>
  );
}
