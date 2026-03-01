import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { usePublicProfile } from "@/hooks/usePlatformExcellence";
import { User, Award, FileText, CheckCircle, TrendingUp, Loader2 } from "lucide-react";

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading, error } = usePublicProfile(username);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!profile || error) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">This profile doesn't exist or is private.</p>
        </div>
      </MainLayout>
    );
  }

  const initials = profile.username?.slice(0, 2).toUpperCase() || "??";

  return (
    <MainLayout>
      <div className="container py-8 px-4 max-w-3xl space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">@{profile.username}</h1>
                {profile.headline && (
                  <p className="text-muted-foreground mt-1">{profile.headline}</p>
                )}
                {profile.bio && (
                  <p className="text-sm mt-3">{profile.bio}</p>
                )}
                {profile.expertise_tags && profile.expertise_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {profile.expertise_tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{Number(profile.execution_score).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Execution Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <CheckCircle className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{profile.verified_projects_count}</p>
              <p className="text-xs text-muted-foreground">Verified Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <FileText className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{profile.published_research_count}</p>
              <p className="text-xs text-muted-foreground">Publications</p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Trust Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Execution Reliability</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(Number(profile.execution_score), 100)}%` }}
                  />
                </div>
                <span className="font-medium w-12 text-right">{Number(profile.execution_score).toFixed(0)}%</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verified Deliverables</span>
              <Badge variant="outline">{profile.verified_projects_count} projects</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Research Output</span>
              <Badge variant="outline">{profile.published_research_count} papers</Badge>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Profile data verified by RCollab execution engine
        </p>
      </div>
    </MainLayout>
  );
}
