import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  compact = false,
}: EmptyStateProps) {
  const content = (
    <div className={`text-center ${compact ? "py-6" : "py-12"}`}>
      <div className={`mx-auto rounded-full bg-muted flex items-center justify-center mb-4 ${
        compact ? "w-12 h-12" : "w-16 h-16"
      }`}>
        <Icon className={`text-muted-foreground ${compact ? "h-6 w-6" : "h-8 w-8"}`} />
      </div>
      <h3 className={`font-semibold mb-2 ${compact ? "text-sm" : "text-lg"}`}>
        {title}
      </h3>
      <p className={`text-muted-foreground mb-4 max-w-sm mx-auto ${compact ? "text-xs" : "text-sm"}`}>
        {description}
      </p>
      {(actionLabel && actionHref) && (
        <Button size={compact ? "sm" : "default"} asChild>
          <Link to={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {(actionLabel && onAction && !actionHref) && (
        <Button size={compact ? "sm" : "default"} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );

  return (
    <Card className="border-dashed">
      <CardContent className="p-0">
        {content}
      </CardContent>
    </Card>
  );
}

// Pre-configured empty states for common scenarios
export function EmptyOpportunities() {
  return (
    <EmptyState
      title="No matching opportunities yet"
      description="Complete your profile to get personalized project matches, or browse all available opportunities."
      actionLabel="Browse All Projects"
      actionHref="/offers"
    />
  );
}

export function EmptyMessages() {
  return (
    <EmptyState
      title="No messages yet"
      description="Start a conversation by reaching out to someone on a project or through their profile."
      actionLabel="Find People"
      actionHref="/network"
    />
  );
}

export function EmptyProjects() {
  return (
    <EmptyState
      title="No projects yet"
      description="Post your first project to find collaborators, or browse existing opportunities to bid on."
      actionLabel="Post a Project"
      actionHref="/earn"
    />
  );
}

export function EmptyActivity() {
  return (
    <EmptyState
      title="No activity yet"
      description="Complete your first project to start building your permanent record of work."
      actionLabel="Find Projects"
      actionHref="/offers"
    />
  );
}

export function EmptyNetwork() {
  return (
    <EmptyState
      title="No connections yet"
      description="Build your professional network by collaborating on projects. All connections are work-based, not social."
      actionLabel="Browse Projects"
      actionHref="/offers"
    />
  );
}

export function EmptyBids() {
  return (
    <EmptyState
      title="No bids yet"
      description="Your project hasn't received any bids yet. Make sure your requirements are clear and the budget is competitive."
      actionLabel="Edit Project"
      actionHref="/earn"
    />
  );
}

export function EmptyGrants() {
  return (
    <EmptyState
      title="No grants available"
      description="Check back soon for new research funding opportunities. Make sure your profile is complete to match with relevant grants."
      actionLabel="Complete Profile"
      actionHref="/profile"
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      title={query ? `No results for "${query}"` : "No results found"}
      description="Try adjusting your search terms or filters to find what you're looking for."
    />
  );
}
