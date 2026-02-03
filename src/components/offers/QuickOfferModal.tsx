import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, X, Paperclip, Send, AlertTriangle, DollarSign, Shield, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { OfferCategory } from "@/data/offers";

interface QuickOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName?: string;
  recipientId?: string;
}

const categories: OfferCategory[] = [
  "FYP / Thesis",
  "Research Paper Support",
  "Data Analysis",
  "Coding / App Dev",
  "UI/Design",
  "Presentation/Poster",
  "Other",
];

// Minimum budget threshold (anti-farming)
const MINIMUM_BUDGET = 50;

export function QuickOfferModal({ open, onOpenChange, recipientName, recipientId }: QuickOfferModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<OfferCategory | "">("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [budgetType, setBudgetType] = useState<"fixed" | "hourly">("fixed");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [understandEscrow, setUnderstandEscrow] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleProceed = () => {
    if (!title || !category || !description || !budget || !deadline) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const budgetNum = parseFloat(budget);
    if (budgetNum < MINIMUM_BUDGET) {
      toast({
        title: "Budget Too Low",
        description: `Minimum budget is $${MINIMUM_BUDGET} to prevent trust farming. This is a serious work platform.`,
        variant: "destructive",
      });
      return;
    }

    setStep("confirm");
  };

  const handleSubmit = () => {
    if (!understandEscrow) {
      toast({
        title: "Confirmation Required",
        description: "You must acknowledge the escrow requirements",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Offer Created!",
      description: visibility === "private" 
        ? `Your offer has been sent to ${recipientName}. Funds will be locked in escrow when accepted.`
        : "Your offer has been published. Funds will be locked in escrow when a bid is accepted.",
    });

    // Reset form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setSkills([]);
    setBudget("");
    setDeadline(undefined);
    setVisibility("private");
    setStep("form");
    setUnderstandEscrow(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "confirm" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {step === "form" ? "Create Project Offer" : "Confirm Escrow Commitment"}
          </DialogTitle>
          <DialogDescription>
            {step === "form" 
              ? (recipientName ? `Create an offer for ${recipientName}` : "Create a new project offer")
              : "Review your commitment before posting"
            }
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <>
            <div className="space-y-6 py-4">
              {/* Minimum Budget Notice */}
              <Card className="border-dashed bg-muted/30">
                <CardContent className="py-3 flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Minimum budget: <span className="font-medium text-foreground">${MINIMUM_BUDGET}</span>. 
                    This is a serious work platform — all projects require escrow.
                  </p>
                </CardContent>
              </Card>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Offer Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Data Analysis for Research Project"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as OfferCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project in detail..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Required Skills */}
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" variant="secondary" onClick={addSkill}>
                    Add
                  </Button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget Type & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Budget Type *</Label>
                  <RadioGroup value={budgetType} onValueChange={(v) => setBudgetType(v as "fixed" | "hourly")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed" className="font-normal">Fixed Price</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hourly" id="hourly" />
                      <Label htmlFor="hourly" className="font-normal">Hourly Rate</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">
                    {budgetType === "fixed" ? "Budget Amount ($)" : "Hourly Rate ($)"} *
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    min={MINIMUM_BUDGET}
                    placeholder={budgetType === "fixed" ? "500" : "25"}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Minimum: ${MINIMUM_BUDGET}</p>
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label>Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : "Select deadline"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label>Visibility *</Label>
                <RadioGroup value={visibility} onValueChange={(v) => setVisibility(v as "private" | "public")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="font-normal">
                      Only {recipientName || "selected user"} (Private)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="font-normal">
                      Public (Post to Earn Hub)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Evidence Requirement Notice */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-3 flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Evidence Required</p>
                    <p className="text-muted-foreground">
                      Milestones require proof attachments. No payment without evidence.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleProceed}>
                Review & Confirm
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* CONFIRMATION STEP - ESCROW COMMITMENT */}
            <div className="space-y-4 py-4">
              {/* Offer Summary */}
              <Card>
                <CardContent className="py-4">
                  <h4 className="font-medium mb-3">Project Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium">{title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">${Number(budget).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-medium">{deadline ? format(deadline, "PPP") : "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Visibility:</span>
                      <span className="font-medium capitalize">{visibility}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ESCROW COMMITMENT - THE FRICTION */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="py-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Escrow Commitment
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">Funds locked:</span> ${Number(budget).toLocaleString()} will be held in escrow when accepted
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">Release:</span> Only on milestone approval with evidence
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">Disputes:</span> Leave permanent marks on both parties' records
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Checkbox confirmation */}
              <div className="flex items-center space-x-2 p-3 border rounded-lg bg-muted/50">
                <Checkbox
                  id="understand-escrow"
                  checked={understandEscrow}
                  onCheckedChange={(c) => setUnderstandEscrow(c === true)}
                />
                <Label
                  htmlFor="understand-escrow"
                  className="text-sm font-medium cursor-pointer"
                >
                  I understand funds will be locked in escrow and released only upon verified milestone completion
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep("form")}>
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!understandEscrow}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Create Offer
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
