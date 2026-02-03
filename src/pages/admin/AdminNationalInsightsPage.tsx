import { AdminLayout } from "@/components/admin/AdminLayout";
import { useNationalInsights } from "@/hooks/useNationalInsights";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Eye,
  Building2,
  Globe,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminNationalInsightsPage() {
  const { user } = useAuth();
  const {
    insights,
    biasMonitoring,
    institutions,
    loading,
    approveInsight,
    reviewBiasReport,
    verifyInstitution,
  } = useNationalInsights();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const pendingInsights = insights.filter(i => !i.approved_at);
  const unreviewedBias = biasMonitoring.filter(b => !b.reviewed_at);
  const unverifiedInstitutions = institutions.filter(i => !i.verified);

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case "research_gap":
        return <TrendingUp className="h-4 w-4" />;
      case "funding_efficiency":
        return <Brain className="h-4 w-4" />;
      case "integrity_risk":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">National Insights & AI Governance</h1>
          <p className="text-muted-foreground">
            AI-generated insights, bias monitoring, and international institutions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingInsights.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unreviewed Bias Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{unreviewedBias.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unverified Institutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unverifiedInstitutions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Institutions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{institutions.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="insights" className="space-y-4">
          <TabsList>
            <TabsTrigger value="insights">National Insights</TabsTrigger>
            <TabsTrigger value="bias">AI Bias Monitoring</TabsTrigger>
            <TabsTrigger value="institutions">Institutions</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            {insights.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Insights Generated</h3>
                  <p className="text-muted-foreground">
                    AI-generated national insights will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {insights.map((insight) => (
                  <Card key={insight.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getInsightTypeIcon(insight.insight_type)}
                            <Badge variant="outline">{insight.insight_type.replace(/_/g, " ")}</Badge>
                            {insight.country_code && (
                              <Badge variant="secondary">{insight.country_code}</Badge>
                            )}
                            {insight.is_public ? (
                              <Badge className="bg-green-500/10 text-green-500">Published</Badge>
                            ) : (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
                          <p className="text-muted-foreground mb-4">{insight.summary}</p>
                          {insight.confidence_score && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-muted-foreground">Confidence:</span>
                              <Progress value={insight.confidence_score * 100} className="w-24 h-2" />
                              <span className="text-sm font-medium">{Math.round(insight.confidence_score * 100)}%</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Generated {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                            {insight.approved_at && ` • Approved ${formatDistanceToNow(new Date(insight.approved_at), { addSuffix: true })}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!insight.approved_at && (
                            <Button 
                              size="sm" 
                              onClick={() => user?.id && approveInsight(insight.id, user.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bias" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Bias Monitoring</CardTitle>
                <CardDescription>
                  Review AI decision fairness and demographic impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                {biasMonitoring.length === 0 ? (
                  <div className="py-12 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Bias Reports</h3>
                    <p className="text-muted-foreground">
                      AI bias monitoring reports will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {biasMonitoring.map((report) => (
                      <div key={report.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{report.ai_capability}</h4>
                            <p className="text-sm text-muted-foreground">
                              {report.total_decisions.toLocaleString()} decisions analyzed
                            </p>
                            {report.fairness_score && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm">Fairness Score:</span>
                                <Progress 
                                  value={report.fairness_score} 
                                  className={`w-24 h-2 ${report.fairness_score < 70 ? "[&>div]:bg-red-500" : ""}`}
                                />
                                <span className={`text-sm font-medium ${report.fairness_score < 70 ? "text-red-500" : "text-green-500"}`}>
                                  {report.fairness_score}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {report.reviewed_at ? (
                              <Badge className="bg-green-500/10 text-green-500">Reviewed</Badge>
                            ) : (
                              <Button 
                                size="sm" 
                                onClick={() => user?.id && reviewBiasReport(report.id, user.id)}
                              >
                                Mark Reviewed
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="institutions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>International Institutions</CardTitle>
                <CardDescription>
                  Manage global academic institution registry
                </CardDescription>
              </CardHeader>
              <CardContent>
                {institutions.length === 0 ? (
                  <div className="py-12 text-center">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Institutions</h3>
                    <p className="text-muted-foreground">
                      International institutions will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {institutions.map((institution) => (
                      <div key={institution.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Globe className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{institution.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {institution.city && `${institution.city}, `}{institution.country_code} • {institution.institution_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {institution.ranking_tier && (
                            <Badge variant="outline">{institution.ranking_tier}</Badge>
                          )}
                          {institution.verified ? (
                            <Badge className="bg-green-500/10 text-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Button size="sm" onClick={() => verifyInstitution(institution.id)}>
                              Verify
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
