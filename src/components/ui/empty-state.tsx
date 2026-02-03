import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  /** Guidance text explaining what the user should do next */
  guidance?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  compact?: boolean;
}

/**
 * EmptyState with professional, outcome-oriented messaging.
 * Every empty state teaches users what to do next.
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  guidance,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  compact = false,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className={`text-center ${compact ? "py-6 px-4" : "py-12 px-6"}`}>
        <div className={`mx-auto rounded-full bg-muted flex items-center justify-center mb-4 ${
          compact ? "w-12 h-12" : "w-14 h-14"
        }`}>
          <Icon className={`text-muted-foreground ${compact ? "h-6 w-6" : "h-7 w-7"}`} />
        </div>
        
        <h3 className={`font-semibold mb-2 ${compact ? "text-sm" : "text-base"}`}>
          {title}
        </h3>
        
        <p className={`text-muted-foreground max-w-sm mx-auto ${compact ? "text-xs" : "text-sm"}`}>
          {description}
        </p>
        
        {guidance && (
          <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto mt-2 italic">
            {guidance}
          </p>
        )}
        
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
            {actionLabel && (
              actionHref ? (
                <Button size={compact ? "sm" : "default"} asChild>
                  <Link to={actionHref}>{actionLabel}</Link>
                </Button>
              ) : onAction ? (
                <Button size={compact ? "sm" : "default"} onClick={onAction}>
                  {actionLabel}
                </Button>
              ) : null
            )}
            {secondaryActionLabel && secondaryActionHref && (
              <Button variant="outline" size={compact ? "sm" : "default"} asChild>
                <Link to={secondaryActionHref}>{secondaryActionLabel}</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Professional empty states with actionable guidance
export function EmptyOpportunities() {
  return (
    <EmptyState
      title="No opportunities match your profile yet"
      description="Opportunities appear here based on your skills and trust level."
      guidance="Complete your profile or improve your trust score to unlock more matches."
      actionLabel="Complete Profile"
      actionHref="/profile"
      secondaryActionLabel="Browse All"
      secondaryActionHref="/offers"
    />
  );
}

export function EmptyMessages() {
  return (
    <EmptyState
      title="No conversations yet"
      description="All conversations start from work — find a project or opportunity to begin."
      guidance="Messages are tied to outcomes, not social connections."
      actionLabel="Find Opportunities"
      actionHref="/offers"
    />
  );
}

export function EmptyProjects() {
  return (
    <EmptyState
      title="No projects on record"
      description="Your work history builds your professional identity."
      guidance="Complete projects to create a permanent, verified record of your outcomes."
      actionLabel="Find Projects"
      actionHref="/offers"
    />
  );
}

export function EmptyActivity() {
  return (
    <EmptyState
      title="No activity recorded"
      description="Your activity feed shows real outcomes — projects completed, milestones delivered, trust earned."
      guidance="This is not a social feed. Only work-related events appear here."
      actionLabel="Start Working"
      actionHref="/offers"
    />
  );
}

export function EmptyNetwork() {
  return (
    <EmptyState
      title="No work connections yet"
      description="Your network is built through collaboration, not social following."
      guidance="Connections form when you complete work with others. Quality over quantity."
      actionLabel="Find Collaborations"
      actionHref="/offers"
    />
  );
}

export function EmptyBids() {
  return (
    <EmptyState
      title="No proposals received"
      description="Professionals with matching skills will see your project."
      guidance="Ensure your scope is clear and budget is competitive for your requirements."
      actionLabel="Edit Project"
      actionHref="/earn"
    />
  );
}

export function EmptyGrants() {
  return (
    <EmptyState
      title="No grants match your profile"
      description="Grant opportunities are matched based on your research domain and qualifications."
      guidance="Complete your research profile to improve matching accuracy."
      actionLabel="Update Profile"
      actionHref="/profile"
    />
  );
}

export function EmptyDeals() {
  return (
    <EmptyState
      title="No active deals"
      description="Deals are created when you and another professional agree on a scope of work."
      guidance="Find an opportunity and submit a proposal to start a deal."
      actionLabel="Browse Opportunities"
      actionHref="/offers"
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      title={query ? `No results for "${query}"` : "No results found"}
      description="Try different keywords or adjust your filters."
      guidance="Search covers projects, people, and institutions."
    />
  );
}
