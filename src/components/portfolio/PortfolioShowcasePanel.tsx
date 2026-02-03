import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Briefcase, 
  Star, 
  ExternalLink,
  CheckCircle2,
  Image,
  FileText,
  Award
} from "lucide-react";

interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  skills_demonstrated: string[];
  outcomes: { metric: string; value: string }[];
  date_completed: string;
  featured: boolean;
  verification_status: 'unverified' | 'peer_verified' | 'client_verified' | 'institution_verified';
}

interface SkillEvidence {
  skill: string;
  total_evidence_strength: number;
  evidence_items: { type: string; title: string; strength: string }[];
}

interface PortfolioShowcasePanelProps {
  portfolioProjects?: PortfolioProject[];
  skillEvidence?: SkillEvidence[];
  totalViews?: number;
  portfolioScore?: number;
}

export function PortfolioShowcasePanel({
  portfolioProjects = [],
  skillEvidence = [],
  totalViews = 0,
  portfolioScore = 0
}: PortfolioShowcasePanelProps) {
  const getVerificationBadge = (status: PortfolioProject['verification_status']) => {
    switch (status) {
      case 'institution_verified':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-0 text-xs">Institution Verified</Badge>;
      case 'client_verified':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs">Client Verified</Badge>;
      case 'peer_verified':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0 text-xs">Peer Verified</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unverified</Badge>;
    }
  };

  // Default sample data
  const projects = portfolioProjects.length > 0 ? portfolioProjects : [
    {
      id: '1',
      title: 'E-Commerce Analytics Platform',
      description: 'Built a real-time analytics dashboard processing 10M+ events daily',
      skills_demonstrated: ['React', 'Python', 'AWS', 'Data Visualization'],
      outcomes: [
        { metric: 'Processing Speed', value: '10M events/day' },
        { metric: 'Dashboard Load Time', value: '< 2 seconds' }
      ],
      date_completed: '2025-11-15',
      featured: true,
      verification_status: 'client_verified' as const
    },
    {
      id: '2',
      title: 'Research Paper: ML in Healthcare',
      description: 'Published peer-reviewed paper on machine learning applications',
      skills_demonstrated: ['Machine Learning', 'Research', 'Python'],
      outcomes: [
        { metric: 'Citations', value: '45+' },
        { metric: 'Impact Factor', value: '4.2' }
      ],
      date_completed: '2025-08-20',
      featured: true,
      verification_status: 'institution_verified' as const
    }
  ];

  const skills = skillEvidence.length > 0 ? skillEvidence : [
    { skill: 'React', total_evidence_strength: 85, evidence_items: [{ type: 'project', title: 'E-Commerce Platform', strength: 'strong' }] },
    { skill: 'Python', total_evidence_strength: 92, evidence_items: [{ type: 'project', title: 'ML Research', strength: 'strong' }] },
    { skill: 'Machine Learning', total_evidence_strength: 78, evidence_items: [{ type: 'publication', title: 'Healthcare ML Paper', strength: 'strong' }] }
  ];

  const score = portfolioScore || 72;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Portfolio Showcase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Projects</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-2xl font-bold">{totalViews || 234}</div>
            <p className="text-xs text-muted-foreground">Views</p>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <div className="text-2xl font-bold">{score}%</div>
            <p className="text-xs text-muted-foreground">Strength</p>
          </div>
        </div>

        {/* Featured Projects */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Featured Projects</h4>
            <Button variant="ghost" size="sm" className="text-xs">
              + Add Project
            </Button>
          </div>

          {projects.filter(p => p.featured).slice(0, 2).map((project) => (
            <div key={project.id} className="border rounded-lg p-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {project.featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-medium text-sm">{project.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {getVerificationBadge(project.verification_status)}
                <span className="text-xs text-muted-foreground">
                  {new Date(project.date_completed).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {project.skills_demonstrated.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>

              {project.outcomes.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {project.outcomes.slice(0, 2).map((outcome, idx) => (
                    <div key={idx} className="p-2 bg-muted/30 rounded text-center">
                      <p className="text-xs text-muted-foreground">{outcome.metric}</p>
                      <p className="text-sm font-semibold">{outcome.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Skill Evidence */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            Proven Skills
          </h4>

          {skills.slice(0, 4).map((skill) => (
            <div key={skill.skill} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{skill.skill}</span>
                <span className={skill.total_evidence_strength >= 80 ? 'text-green-600' : 'text-muted-foreground'}>
                  {skill.total_evidence_strength}% evidence
                </span>
              </div>
              <Progress value={skill.total_evidence_strength} className="h-1.5" />
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full text-sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          View Full Portfolio
        </Button>
      </CardContent>
    </Card>
  );
}
