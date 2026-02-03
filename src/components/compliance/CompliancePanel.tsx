import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  FileCheck,
  Users,
  Scale
} from "lucide-react";

interface EthicsReview {
  review_id: string;
  project_id: string;
  review_type: 'irb' | 'iacuc' | 'biosafety' | 'data_privacy' | 'export_control';
  status: 'not_started' | 'in_preparation' | 'submitted' | 'under_review' | 'approved' | 'revision_required' | 'rejected';
  expiry_date?: string;
}

interface ConflictOfInterest {
  declaration_id: string;
  declaration_type: 'financial' | 'personal' | 'intellectual' | 'institutional';
  related_entity: string;
  status: 'pending' | 'acknowledged' | 'mitigated' | 'requires_action';
}

interface CompliancePanelProps {
  ethicsReviews?: EthicsReview[];
  conflicts?: ConflictOfInterest[];
  overallCompliance?: number;
}

export function CompliancePanel({
  ethicsReviews = [],
  conflicts = [],
  overallCompliance = 0
}: CompliancePanelProps) {
  const getStatusColor = (status: EthicsReview['status']) => {
    const colors: Record<string, string> = {
      'not_started': 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
      'in_preparation': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'submitted': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
      'under_review': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      'approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'revision_required': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const getConflictStatusColor = (status: ConflictOfInterest['status']) => {
    switch (status) {
      case 'acknowledged': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'mitigated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'requires_action': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    }
  };

  const getReviewTypeIcon = (type: EthicsReview['review_type']) => {
    switch (type) {
      case 'irb': return <Users className="h-4 w-4" />;
      case 'data_privacy': return <Shield className="h-4 w-4" />;
      default: return <FileCheck className="h-4 w-4" />;
    }
  };

  // Default sample data
  const reviews = ethicsReviews.length > 0 ? ethicsReviews : [
    {
      review_id: '1',
      project_id: 'proj-1',
      review_type: 'irb' as const,
      status: 'approved' as const,
      expiry_date: '2027-01-15'
    },
    {
      review_id: '2',
      project_id: 'proj-2',
      review_type: 'data_privacy' as const,
      status: 'under_review' as const
    }
  ];

  const displayConflicts = conflicts.length > 0 ? conflicts : [
    {
      declaration_id: '1',
      declaration_type: 'financial' as const,
      related_entity: 'TechCorp Advisory Role',
      status: 'acknowledged' as const
    }
  ];

  const compliance = overallCompliance || 85;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Compliance & Ethics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Compliance Score */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Compliance</span>
            <Badge variant={compliance >= 80 ? "default" : compliance >= 60 ? "secondary" : "destructive"}>
              {compliance}%
            </Badge>
          </div>
          <Progress value={compliance} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {compliance >= 80 ? 'Excellent compliance status' : 
             compliance >= 60 ? 'Some items need attention' : 
             'Action required on multiple items'}
          </p>
        </div>

        {/* Ethics Reviews */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Ethics Reviews</h4>
            <Button variant="ghost" size="sm" className="text-xs">
              + New Review
            </Button>
          </div>

          {reviews.map((review) => (
            <div key={review.review_id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getReviewTypeIcon(review.review_type)}
                  <span className="text-sm font-medium uppercase">{review.review_type.replace('_', ' ')}</span>
                </div>
                <Badge className={`${getStatusColor(review.status)} border-0`}>
                  {review.status.replace('_', ' ')}
                </Badge>
              </div>
              
              {review.expiry_date && review.status === 'approved' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Valid until {new Date(review.expiry_date).toLocaleDateString()}</span>
                </div>
              )}

              {review.status === 'revision_required' && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs mt-2">
                  <AlertTriangle className="h-3 w-3 text-orange-600" />
                  <span className="text-orange-800 dark:text-orange-400">
                    Revisions requested by committee
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Conflict of Interest Declarations */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Scale className="h-4 w-4" />
              COI Declarations
            </h4>
            <Button variant="ghost" size="sm" className="text-xs">
              + Declare
            </Button>
          </div>

          {displayConflicts.map((conflict) => (
            <div key={conflict.declaration_id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium capitalize">{conflict.declaration_type}</p>
                <p className="text-xs text-muted-foreground">{conflict.related_entity}</p>
              </div>
              <Badge className={`${getConflictStatusColor(conflict.status)} border-0 capitalize`}>
                {conflict.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}

          {displayConflicts.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-400">
                No conflicts declared
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
