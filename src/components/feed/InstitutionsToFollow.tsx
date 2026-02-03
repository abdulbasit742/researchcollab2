import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, ArrowRight, Plus, Users, Briefcase } from "lucide-react";

export function InstitutionsToFollow() {
  const { user } = useAuth();

  // Mock institutions - in production would come from recommendation engine
  const institutions = [
    {
      id: "1",
      name: "LUMS Research Hub",
      type: "University",
      members: 156,
      activeProjects: 23,
      logo: null,
    },
    {
      id: "2",
      name: "NUST Innovation Lab",
      type: "Research Lab",
      members: 89,
      activeProjects: 15,
      logo: null,
    },
    {
      id: "3",
      name: "Punjab IT Board",
      type: "Government",
      members: 45,
      activeProjects: 8,
      logo: null,
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          Institutions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {institutions.map((inst) => (
          <div
            key={inst.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <Avatar className="h-10 w-10 rounded-lg">
              <AvatarImage src={inst.logo || undefined} />
              <AvatarFallback className="rounded-lg text-xs bg-primary/10 text-primary">
                {inst.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link
                to={`/org/${inst.id}/dashboard`}
                className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
              >
                {inst.name}
              </Link>
              <p className="text-[11px] text-muted-foreground">{inst.type}</p>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-2.5 w-2.5" />
                  {inst.members}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-2.5 w-2.5" />
                  {inst.activeProjects} projects
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 shrink-0">
              <Plus className="h-3 w-3" />
              Follow
            </Button>
          </div>
        ))}

        <Button asChild variant="ghost" size="sm" className="w-full gap-1">
          <Link to="/org">
            Browse Organizations
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
