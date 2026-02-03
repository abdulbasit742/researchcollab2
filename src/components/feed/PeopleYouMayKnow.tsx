import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Users, ArrowRight, Shield, Building2, UserPlus } from "lucide-react";

export function PeopleYouMayKnow() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Mock data for now - in production this would come from the recommendation engine
  const mockPeople = [
    {
      id: "1",
      name: "Dr. Sarah Ahmed",
      role: "AI Researcher",
      institution: "LUMS",
      trustScore: 85,
      mutualConnections: 3,
      avatar: null,
    },
    {
      id: "2",
      name: "Ali Hassan",
      role: "Data Scientist",
      institution: "NUST",
      trustScore: 72,
      mutualConnections: 5,
      avatar: null,
    },
    {
      id: "3",
      name: "Fatima Khan",
      role: "ML Engineer",
      institution: "FAST",
      trustScore: 68,
      mutualConnections: 2,
      avatar: null,
    },
  ];

  const people = mockPeople;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          People In Your Domain
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {people.map((person: any) => (
          <div
            key={person.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={person.avatar} />
              <AvatarFallback className="text-xs">
                {person.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link
                to={`/u/${person.id}`}
                className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
              >
                {person.name}
              </Link>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {person.role}
                {person.institution && ` · ${person.institution}`}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-1">
                  <Shield className="h-2.5 w-2.5" />
                  {person.trustScore}
                </Badge>
                {person.mutualConnections > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    {person.mutualConnections} mutual
                  </span>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 shrink-0">
              <UserPlus className="h-3 w-3" />
              Connect
            </Button>
          </div>
        ))}

        <Button asChild variant="ghost" size="sm" className="w-full gap-1">
          <Link to="/network">
            View Network
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
