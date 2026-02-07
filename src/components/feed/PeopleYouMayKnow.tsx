import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Users, ArrowRight, Shield, UserPlus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function PeopleYouMayKnow() {
  const { user } = useAuth();

  const { data: people = [], isLoading } = useQuery({
    queryKey: ["people-you-may-know", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, university, department")
        .neq("id", user.id)
        .not("full_name", "is", null)
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (people.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            People In Your Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground">
            No researchers found yet. Be one of the first to complete your profile!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          People In Your Domain
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {people.map((person) => (
          <div
            key={person.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-xs">
                {person.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Link
                to={`/u/${person.id}`}
                className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
              >
                {person.full_name}
              </Link>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                {person.role}
                {person.university && ` · ${person.university}`}
              </p>
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
