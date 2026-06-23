import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Eye, FileText, Search, Sparkles } from "lucide-react";

type Template = {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  estReadMin: number;
  body: string;
};

const TEMPLATES: Template[] = [
  {
    id: "fyp-proposal",
    title: "FYP Proposal",
    category: "Proposals",
    description: "Standard Final Year Project proposal with problem statement, objectives, scope, and timeline.",
    tags: ["FYP", "Undergraduate"],
    estReadMin: 6,
    body: `# Final Year Project Proposal

## 1. Title
{{Project Title}}

## 2. Group Members
- {{Name 1 — Roll No.}}
- {{Name 2 — Roll No.}}
- {{Name 3 — Roll No.}}

## 3. Supervisor
{{Supervisor Name, Department}}

## 4. Problem Statement
Describe the real-world problem in 150–200 words. Why does it matter? Who is affected?

## 5. Objectives
1. {{Primary objective}}
2. {{Secondary objective}}
3. {{Stretch objective}}

## 6. Scope & Limitations
- In scope: {{...}}
- Out of scope: {{...}}

## 7. Literature Review (Summary)
Summarize 5–8 closely related works and the gap your FYP fills.

## 8. Proposed Methodology
- Approach: {{e.g., Design Science / Experimental / Survey}}
- Tools: {{...}}
- Dataset: {{...}}

## 9. Timeline (Semester 1 & 2)
| Phase | Weeks | Deliverable |
|-------|-------|-------------|
| Requirements | 1–3 | SRS |
| Design | 4–6 | Architecture |
| Implementation | 7–14 | Working prototype |
| Evaluation | 15–18 | Results |
| Report | 19–24 | Final report |

## 10. Expected Outcomes
{{Deliverables, impact, possible publication}}
`,
  },
  {
    id: "research-proposal",
    title: "Research Proposal (MS/PhD)",
    category: "Proposals",
    description: "Graduate-level research proposal with hypothesis, methodology, and expected contribution.",
    tags: ["MS", "PhD"],
    estReadMin: 8,
    body: `# Research Proposal

## Title
{{Working title}}

## Abstract (250 words)

## 1. Introduction & Motivation
## 2. Research Questions & Hypotheses
- RQ1: ...
- H1: ...

## 3. Literature Review
## 4. Methodology
- Study design
- Participants / dataset
- Instruments
- Analysis plan

## 5. Ethical Considerations
## 6. Timeline (Gantt)
## 7. Expected Contribution
## 8. References (APA)
`,
  },
  {
    id: "lit-review-matrix",
    title: "Literature Review Matrix",
    category: "Literature Review",
    description: "Tabular synthesis matrix to compare papers across method, dataset, gap, and findings.",
    tags: ["Synthesis"],
    estReadMin: 4,
    body: `# Literature Review Matrix

| # | Author / Year | Problem | Method | Dataset | Key Findings | Gap | Cited By |
|---|---------------|---------|--------|---------|--------------|-----|----------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Synthesis (1 page)
- Themes:
- Disagreements:
- Open gaps your work targets:
`,
  },
  {
    id: "supervisor-meeting",
    title: "Supervisor Meeting Form",
    category: "Meetings",
    description: "Pre/post meeting agenda with action items and next milestones.",
    tags: ["Meeting", "Supervision"],
    estReadMin: 2,
    body: `# Supervisor Meeting — {{Date}}

**Attendees:** ...
**Duration:** ...

## 1. Progress since last meeting
- ...

## 2. Blockers
- ...

## 3. Decisions
- ...

## 4. Action Items
| Owner | Action | Due |
|-------|--------|-----|
| | | |

## 5. Next Meeting
Date: ... | Agenda: ...
`,
  },
  {
    id: "weekly-progress",
    title: "Weekly Progress Report",
    category: "Reports",
    description: "Short weekly status update for supervisor or sponsor.",
    tags: ["Weekly", "Status"],
    estReadMin: 2,
    body: `# Weekly Progress — Week {{N}}

**Project:** ...
**Reporting period:** {{from}} → {{to}}

## Done
- ...

## In Progress
- ...

## Blockers
- ...

## Next Week
- ...

## Risks
- ...
`,
  },
  {
    id: "final-report",
    title: "Final Project Report",
    category: "Reports",
    description: "Full FYP / capstone report structure with all required chapters.",
    tags: ["FYP", "Capstone"],
    estReadMin: 10,
    body: `# Final Report — {{Project Title}}

## Abstract
## Acknowledgements
## Table of Contents

## Chapter 1 — Introduction
## Chapter 2 — Literature Review
## Chapter 3 — Methodology
## Chapter 4 — Design & Implementation
## Chapter 5 — Results & Evaluation
## Chapter 6 — Discussion
## Chapter 7 — Conclusion & Future Work

## References (APA / IEEE)
## Appendices
`,
  },
  {
    id: "viva-slides",
    title: "Viva / Defense Presentation",
    category: "Presentations",
    description: "12-slide viva deck outline covering problem to contribution.",
    tags: ["Viva", "Defense"],
    estReadMin: 3,
    body: `# Viva Presentation — Slide Outline

1. Title & Team
2. Problem
3. Motivation & Impact
4. Research Questions
5. Related Work (1 slide)
6. Proposed Approach
7. System Architecture / Methodology
8. Implementation Highlights
9. Results (charts)
10. Evaluation vs Baselines
11. Limitations & Future Work
12. Q&A — Thank You
`,
  },
  {
    id: "research-paper",
    title: "Conference / Journal Paper",
    category: "Publications",
    description: "IMRaD paper skeleton with placeholders for citations and figures.",
    tags: ["Paper", "IMRaD"],
    estReadMin: 8,
    body: `# {{Paper Title}}

**Authors:** ...
**Affiliation:** ...

## Abstract (200 words)

## 1. Introduction
## 2. Related Work
## 3. Method
## 4. Experiments
## 5. Results
## 6. Discussion
## 7. Conclusion

## References
`,
  },
  {
    id: "grant-proposal",
    title: "Grant Proposal",
    category: "Funding",
    description: "Funding application with budget, milestones, and impact narrative.",
    tags: ["Grant", "Funding"],
    estReadMin: 7,
    body: `# Grant Proposal — {{Programme}}

## Project Summary (1 page)
## Background & Significance
## Specific Aims
## Approach & Methodology
## Innovation
## Team & Capacity
## Workplan & Milestones
## Budget & Justification
| Item | Year 1 | Year 2 | Total |
|------|--------|--------|-------|
| Personnel | | | |
| Equipment | | | |
| Travel | | | |
| Other | | | |
## Expected Impact
## References
`,
  },
  {
    id: "pitch-deck",
    title: "Research-to-Startup Pitch Deck",
    category: "Commercialization",
    description: "10-slide pitch deck mapping research outcome to a venture.",
    tags: ["Pitch", "Startup"],
    estReadMin: 3,
    body: `# Pitch Deck Outline

1. Vision
2. Problem
3. Solution (from research)
4. Market & Customer
5. Product Demo
6. Traction
7. Business Model
8. Competition
9. Team
10. Ask & Use of Funds
`,
  },
  {
    id: "ethics-checklist",
    title: "Research Ethics Checklist",
    category: "Compliance",
    description: "IRB-style self-check covering consent, data, and risk.",
    tags: ["Ethics", "IRB"],
    estReadMin: 3,
    body: `# Ethics Checklist

- [ ] Study involves human subjects
- [ ] Informed consent obtained
- [ ] Data is anonymized
- [ ] Sensitive data storage plan documented
- [ ] Risk to participants assessed (low/med/high)
- [ ] Conflicts of interest disclosed
- [ ] Funding source disclosed
- [ ] AI assistance disclosed per institution policy
- [ ] Plagiarism check (Turnitin/iThenticate) planned
- [ ] Supervisor sign-off attached
`,
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];

export default function TemplateLibraryPage() {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [preview, setPreview] = useState<Template | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TEMPLATES.filter((t) => {
      const matchesCat = cat === "All" || t.category === cat;
      const matchesQ =
        !needle ||
        t.title.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle) ||
        t.tags.some((tag) => tag.toLowerCase().includes(needle));
      return matchesCat && matchesQ;
    });
  }, [q, cat]);

  const copy = async (t: Template) => {
    await navigator.clipboard.writeText(t.body);
    toast({ title: "Copied", description: `${t.title} copied to clipboard.` });
  };

  const download = (t: Template) => {
    const blob = new Blob([t.body], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${t.id}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `${t.id}.md saved.` });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-7 w-7" />
            Template Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready-to-use research, FYP, and funding templates. Preview, copy, or export as Markdown.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates, tags…"
            className="pl-9"
          />
        </div>
      </header>

      <Tabs value={cat} onValueChange={setCat}>
        <TabsList className="flex flex-wrap h-auto">
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={cat} className="mt-6">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Sparkles className="mx-auto h-8 w-8 mb-2 opacity-60" />
                No templates match your search.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => (
                <Card key={t.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{t.title}</CardTitle>
                      <Badge variant="secondary" className="shrink-0">{t.category}</Badge>
                    </div>
                    <CardDescription>{t.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {t.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                      <span className="text-xs text-muted-foreground ml-auto self-center">
                        ~{t.estReadMin} min
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" className="flex-1" onClick={() => setPreview(t)}>
                        <Eye className="h-4 w-4 mr-1.5" /> Preview
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => copy(t)} title="Copy">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => download(t)} title="Download .md">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
            <DialogDescription>{preview?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] rounded-md border bg-muted/30 p-4">
            <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {preview?.body}
            </pre>
          </ScrollArea>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => preview && download(preview)}>
              <Download className="h-4 w-4 mr-1.5" /> Download .md
            </Button>
            <Button onClick={() => preview && copy(preview)}>
              <Copy className="h-4 w-4 mr-1.5" /> Copy to Clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
