import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, ArrowRight, ArrowLeft, Check, Clock, Users, 
  DollarSign, AlertTriangle, Target, Lightbulb, Package,
  Brain, FileText, ChevronDown, ChevronUp, User, Star
} from "lucide-react";
import {
  ProjectType, ComplexityLevel, TeamPreference, DeadlineUrgency,
  ProjectScope, AIEstimate, PricingEstimate, AutoMilestone,
  TalentSuggestion, ToolRecommendation,
  projectTypeLabels, complexityLabels, teamPreferenceLabels, urgencyLabels,
  deliverableOptions, generateEstimate, generatePricing, generateMilestones
} from "@/data/aiScoping";
import { tools } from "@/data/tools";
import { TrustScoreDisplay } from "@/components/badges/TrustScore";

const AIProjectScopePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Form state
  const [projectType, setProjectType] = useState<ProjectType | ''>('');
  const [complexity, setComplexity] = useState<ComplexityLevel | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDeliverables, setSelectedDeliverables] = useState<string[]>([]);
  const [techTools, setTechTools] = useState('');
  const [urgency, setUrgency] = useState<DeadlineUrgency>('standard');
  const [teamPreference, setTeamPreference] = useState<TeamPreference>('solo');
  
  // Generated results
  const [estimate, setEstimate] = useState<AIEstimate | null>(null);
  const [pricing, setPricing] = useState<PricingEstimate | null>(null);
  const [milestones, setMilestones] = useState<AutoMilestone[]>([]);
  const [adjustedPrice, setAdjustedPrice] = useState<number | null>(null);
  const [talentSuggestions, setTalentSuggestions] = useState<TalentSuggestion[]>([]);
  const [toolRecommendations, setToolRecommendations] = useState<ToolRecommendation[]>([]);

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const handleDeliverableToggle = (deliverable: string) => {
    setSelectedDeliverables(prev => 
      prev.includes(deliverable) 
        ? prev.filter(d => d !== deliverable)
        : [...prev, deliverable]
    );
  };

  const generateResults = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const scope: ProjectScope = {
        id: `scope-${Date.now()}`,
        projectType: projectType as ProjectType,
        complexityLevel: complexity as ComplexityLevel,
        title,
        description,
        deliverables: selectedDeliverables,
        techTools: techTools.split(',').map(t => t.trim()).filter(Boolean),
        deadlineUrgency: urgency,
        teamPreference,
        createdAt: new Date()
      };

      const est = generateEstimate(scope);
      const price = generatePricing(scope, est);
      const ms = generateMilestones(scope, price);
      
      setEstimate(est);
      setPricing(price);
      setMilestones(ms);
      setAdjustedPrice(price.recommendedPrice);
      
      // Generate talent suggestions
      // Talent suggestions will come from real profiles in production
      setTalentSuggestions([]);
      
      // Generate tool recommendations based on project type
      const recommendedTools: ToolRecommendation[] = [];
      if (complexity === 'advanced' || complexity === 'research_grade') {
        recommendedTools.push({
          toolId: 'chatgpt-5-3',
          toolName: 'ChatGPT 5.3 Pro',
          reason: 'Accelerate development and documentation',
          timeSaved: '~20 hours',
          monthlyCost: 25,
          priority: 'recommended'
        });
      }
      if (projectType === 'research_paper' || projectType === 'fyp') {
        recommendedTools.push({
          toolId: 'perplexity-pro',
          toolName: 'Perplexity Pro',
          reason: 'Research and literature review assistance',
          timeSaved: '~15 hours',
          monthlyCost: 20,
          priority: projectType === 'research_paper' ? 'essential' : 'recommended'
        });
      }
      setToolRecommendations(recommendedTools);
      
      setIsGenerating(false);
      setStep(5);
    }, 1500);
  };

  const handlePublish = () => {
    toast({
      title: "Project Published!",
      description: "Your AI-scoped project is now live and accepting bids."
    });
    navigate('/offers');
  };

  const canProceed = () => {
    switch (step) {
      case 1: return projectType !== '';
      case 2: return complexity !== '';
      case 3: return title && description && selectedDeliverables.length > 0;
      case 4: return true;
      default: return true;
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Project Scoping</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Scope & Price Your Project</h1>
          <p className="text-muted-foreground">
            Let AI help you define, estimate, and price your project in minutes
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Project Type */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>What type of project is this?</CardTitle>
              <CardDescription>Select the category that best describes your project</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(projectTypeLabels).map(([key, label]) => (
                    <div key={key} className="relative">
                      <RadioGroupItem value={key} id={key} className="peer sr-only" />
                      <Label
                        htmlFor={key}
                        className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Complexity */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>How complex is this project?</CardTitle>
              <CardDescription>This helps us estimate effort and pricing accurately</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={complexity} onValueChange={(v) => setComplexity(v as ComplexityLevel)}>
                <div className="space-y-4">
                  {Object.entries(complexityLabels).map(([key, label]) => {
                    const descriptions: Record<string, string> = {
                      basic: 'Standard requirements, well-documented, minimal research needed',
                      intermediate: 'Some custom requirements, moderate complexity, may need guidance',
                      advanced: 'Complex requirements, significant expertise needed, custom solutions',
                      research_grade: 'Publication quality, original research, expert supervision recommended'
                    };
                    return (
                      <div key={key} className="relative">
                        <RadioGroupItem value={key} id={key} className="peer sr-only" />
                        <Label
                          htmlFor={key}
                          className="flex items-start gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                            <Brain className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <span className="font-medium block">{label}</span>
                            <span className="text-sm text-muted-foreground">{descriptions[key]}</span>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Requirements */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Describe your requirements</CardTitle>
              <CardDescription>Provide details to help us scope accurately</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Project Title</Label>
                <Input
                  placeholder="e.g., AI-Powered Student Performance Prediction System"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what you need built, the problem you're solving, and any specific requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div>
                <Label className="mb-3 block">Expected Deliverables</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {projectType && deliverableOptions[projectType as ProjectType]?.map(deliverable => (
                    <div key={deliverable} className="flex items-center space-x-2">
                      <Checkbox
                        id={deliverable}
                        checked={selectedDeliverables.includes(deliverable)}
                        onCheckedChange={() => handleDeliverableToggle(deliverable)}
                      />
                      <Label htmlFor={deliverable} className="text-sm cursor-pointer">
                        {deliverable}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Technologies / Tools Required</Label>
                <Input
                  placeholder="e.g., Python, TensorFlow, React (comma-separated)"
                  value={techTools}
                  onChange={(e) => setTechTools(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Preferences */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Timeline & Team Preferences</CardTitle>
              <CardDescription>Help us match you with the right talent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Deadline Urgency</Label>
                <RadioGroup value={urgency} onValueChange={(v) => setUrgency(v as DeadlineUrgency)}>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(urgencyLabels).map(([key, label]) => (
                      <div key={key} className="relative">
                        <RadioGroupItem value={key} id={`urgency-${key}`} className="peer sr-only" />
                        <Label
                          htmlFor={`urgency-${key}`}
                          className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="mb-3 block">Team Preference</Label>
                <RadioGroup value={teamPreference} onValueChange={(v) => setTeamPreference(v as TeamPreference)}>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(teamPreferenceLabels).map(([key, label]) => (
                      <div key={key} className="relative">
                        <RadioGroupItem value={key} id={`team-${key}`} className="peer sr-only" />
                        <Label
                          htmlFor={`team-${key}`}
                          className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: AI Results */}
        {step === 5 && estimate && pricing && (
          <div className="space-y-6">
            {/* Estimate Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Estimate
                  </CardTitle>
                  <Badge variant="outline">
                    {estimate.confidenceScore}% Confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{estimate.effortHours}h</p>
                    <p className="text-sm text-muted-foreground">Effort</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Target className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{estimate.effortWeeks}w</p>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{estimate.suggestedTeamSize}</p>
                    <p className="text-sm text-muted-foreground">Team Size</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <AlertTriangle className={`h-5 w-5 mx-auto mb-2 ${
                      estimate.riskLevel === 'high' ? 'text-destructive' : 
                      estimate.riskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`} />
                    <p className="text-2xl font-bold capitalize">{estimate.riskLevel}</p>
                    <p className="text-sm text-muted-foreground">Risk</p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setShowExplanation(!showExplanation)}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Why this estimate?
                  {showExplanation ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </Button>
                {showExplanation && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm">
                    {estimate.explanation}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Smart Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Recommended Price</p>
                  <p className="text-4xl font-bold text-primary">${pricing.recommendedPrice}</p>
                  <p className="text-sm text-muted-foreground">
                    Range: ${pricing.minPrice} - ${pricing.maxPrice}
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {pricing.factors.map((factor, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{factor.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{factor.description}</span>
                        <Badge variant={factor.impact.startsWith('+') ? 'default' : 'secondary'}>
                          {factor.impact}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg mb-6">
                  <div className="flex justify-between mb-2">
                    <span>Platform Commission (10%)</span>
                    <span>-${pricing.platformCommission}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Net to Provider</span>
                    <span>${pricing.netToProvider}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-2 block">Adjust Price (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[adjustedPrice || pricing.recommendedPrice]}
                      min={pricing.minPrice}
                      max={pricing.maxPrice}
                      step={10}
                      onValueChange={([v]) => setAdjustedPrice(v)}
                      className="flex-1"
                    />
                    <span className="font-semibold w-20 text-right">${adjustedPrice}</span>
                  </div>
                  {adjustedPrice !== pricing.recommendedPrice && (
                    <p className="text-sm text-yellow-600 mt-2">
                      ⚠️ Adjusting away from recommended price may affect matching
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 6: Milestones & Recommendations */}
        {step === 6 && (
          <div className="space-y-6">
            {/* Milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Auto-Generated Milestones</CardTitle>
                <CardDescription>Review and edit before publishing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((ms, index) => (
                    <div key={ms.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{ms.title}</p>
                        <p className="text-sm text-muted-foreground">{ms.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${ms.amount}</p>
                        <p className="text-sm text-muted-foreground">{ms.durationDays} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Talent Suggestions */}
            {talentSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Talent</CardTitle>
                  <CardDescription>Best matches for your project</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {talentSuggestions.map(talent => (
                      <div key={talent.userId} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{talent.name}</p>
                            {talent.isVerified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-3 w-3" />
                            <span>Trust: {talent.trustScore}</span>
                            <span>•</span>
                            <span>{talent.completedProjects} projects</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {talent.skills.map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="mb-2">{talent.matchScore}% Match</Badge>
                          <Button size="sm" variant="outline">Invite</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tool Recommendations */}
            {toolRecommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Recommended Tools
                  </CardTitle>
                  <CardDescription>Speed up your project with these AI tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {toolRecommendations.map(tool => (
                      <div key={tool.toolId} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{tool.toolName}</p>
                            <Badge variant={tool.priority === 'essential' ? 'default' : 'outline'}>
                              {tool.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.reason}</p>
                          <p className="text-sm text-green-600">Save {tool.timeSaved}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${tool.monthlyCost}/mo</p>
                          <Button size="sm" variant="outline" onClick={() => navigate('/tools')}>
                            Add to Project
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {step < 4 && (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {step === 4 && (
            <Button onClick={generateResults} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Estimate
                </>
              )}
            </Button>
          )}
          
          {step === 5 && (
            <Button onClick={() => setStep(6)}>
              Review Milestones
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {step === 6 && (
            <Button onClick={handlePublish}>
              <Check className="h-4 w-4 mr-2" />
              Publish Project
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AIProjectScopePage;
