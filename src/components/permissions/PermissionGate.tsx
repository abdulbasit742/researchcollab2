import { ReactNode } from "react";
import { usePermissionGuard } from "@/hooks/usePermissions";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PermissionGateProps {
  action: string;
  contextType?: string;
  contextId?: string;
  children: ReactNode;
  fallback?: ReactNode;
  showLocked?: boolean;
  lockedMessage?: string;
}

/**
 * PermissionGate - Frontend guard for permission-protected UI elements
 * 
 * Usage:
 * <PermissionGate action="wallet.withdraw">
 *   <WithdrawButton />
 * </PermissionGate>
 * 
 * With context:
 * <PermissionGate action="project.manage" contextType="project" contextId={projectId}>
 *   <ProjectSettings />
 * </PermissionGate>
 */
export function PermissionGate({
  action,
  contextType,
  contextId,
  children,
  fallback,
  showLocked = false,
  lockedMessage,
}: PermissionGateProps) {
  const { allowed, checking } = usePermissionGuard(action, contextType, contextId);

  if (checking) {
    return fallback || <Skeleton className="h-8 w-24" />;
  }

  if (!allowed) {
    if (showLocked) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1 text-muted-foreground cursor-not-allowed opacity-50">
                <Lock className="h-4 w-4" />
                <span className="text-sm">Restricted</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{lockedMessage || `You don't have permission to ${action.replace(".", " ")}`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return fallback || null;
  }

  return <>{children}</>;
}

interface PermissionButtonProps {
  action: string;
  contextType?: string;
  contextId?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

/**
 * PermissionButton - A button that is disabled when permission is denied
 * Shows a tooltip explaining why when hovered
 */
export function PermissionButton({
  action,
  contextType,
  contextId,
  children,
  className,
  onClick,
  disabled,
}: PermissionButtonProps) {
  const { allowed, checking } = usePermissionGuard(action, contextType, contextId);

  const isDisabled = disabled || checking || !allowed;

  if (isDisabled && !allowed && !checking) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`${className} opacity-50 cursor-not-allowed`}
              disabled
            >
              <Lock className="h-4 w-4 mr-2 inline" />
              {children}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>You don't have permission to perform this action</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={isDisabled}
    >
      {checking ? "Checking..." : children}
    </button>
  );
}
