/**
 * PageHeader — Consistent page header across all platform pages.
 * Title, description, breadcrumbs, primary + secondary actions.
 */

import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("border-b bg-card/50", className)}>
      <div className="container px-4 py-4 max-w-6xl">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex items-center gap-1 text-xs text-muted-foreground">
              {breadcrumbs.map((item, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  {idx > 0 && <ChevronRight className="h-3 w-3" />}
                  {item.href ? (
                    <Link
                      to={item.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{item.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Title Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight truncate">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>

          {/* Actions slot */}
          {children && (
            <div className="flex items-center gap-2 shrink-0">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
