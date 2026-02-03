import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Briefcase, Building2, Wrench, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import type { SearchResult } from "@/hooks/useGlobalSearch";

interface SearchResultCardProps {
  result: SearchResult;
}

export function SearchResultCard({ result }: SearchResultCardProps) {
  const getLink = () => {
    switch (result.entity_type) {
      case "user": return `/u/${result.entity_id}`;
      case "project": return `/earn/projects/${result.entity_id}`;
      case "organization": return `/organizations/${result.entity_id}`;
      case "tool": return `/tools?id=${result.entity_id}`;
      case "post": return `/posts/${result.entity_id}`;
      default: return "#";
    }
  };
  
  const getIcon = () => {
    switch (result.entity_type) {
      case "user": return <User className="h-5 w-5" />;
      case "project": return <Briefcase className="h-5 w-5" />;
      case "organization": return <Building2 className="h-5 w-5" />;
      case "tool": return <Wrench className="h-5 w-5" />;
      case "post": return <FileText className="h-5 w-5" />;
      default: return null;
    }
  };
  
  const getTypeLabel = () => {
    switch (result.entity_type) {
      case "user": return "Person";
      case "project": return "Project";
      case "organization": return "Organization";
      case "tool": return "Tool";
      case "post": return "Post";
      default: return result.entity_type;
    }
  };
  
  return (
    <Link to={getLink()}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {result.entity_type === "user" ? (
              <Avatar className="h-12 w-12">
                <AvatarImage src={undefined} alt={result.title} />
                <AvatarFallback>
                  {result.title?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                {getIcon()}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm line-clamp-1">{result.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel()}
                </Badge>
              </div>
              
              {result.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {result.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {result.university && (
                  <span className="text-xs text-muted-foreground">
                    {result.university}
                  </span>
                )}
                
                {result.skills && result.skills.length > 0 && (
                  <div className="flex gap-1">
                    {result.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {result.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{result.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                {result.tags && result.tags.length > 0 && (
                  <div className="flex gap-1">
                    {result.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
