import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, X, Ban, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
}

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
  onAction: (actionId: string) => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  actions,
  onAction,
}: BulkActionsBarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  if (selectedCount === 0) return null;

  const handleAction = (action: BulkAction) => {
    if (action.requiresConfirmation) {
      setConfirmAction(action);
    } else {
      onAction(action.id);
    }
  };

  const confirmAndExecute = () => {
    if (confirmAction) {
      onAction(confirmAction.id);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary">{selectedCount} selected</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-7 px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {actions.slice(0, 2).map((action) => (
            <Button
              key={action.id}
              variant={action.variant === "destructive" ? "destructive" : "secondary"}
              size="sm"
              onClick={() => handleAction(action)}
              className="h-8"
            >
              {action.icon}
              <span className="ml-1">{action.label}</span>
            </Button>
          ))}

          {actions.length > 2 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  More Actions
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border">
                {actions.slice(2).map((action, index) => (
                  <div key={action.id}>
                    {index > 0 && action.variant === "destructive" && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => handleAction(action)}
                      className={action.variant === "destructive" ? "text-destructive" : ""}
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </DropdownMenuItem>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.confirmTitle || `Confirm ${confirmAction?.label}`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.confirmDescription ||
                `Are you sure you want to ${confirmAction?.label?.toLowerCase()} ${selectedCount} selected item(s)? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAndExecute}
              className={confirmAction?.variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Pre-defined common bulk actions
export const commonBulkActions = {
  block: {
    id: "block",
    label: "Block",
    icon: <Ban className="h-4 w-4" />,
    variant: "destructive" as const,
    requiresConfirmation: true,
    confirmTitle: "Block Selected Items",
    confirmDescription: "Are you sure you want to block the selected items? They will no longer be accessible.",
  },
  unblock: {
    id: "unblock",
    label: "Unblock",
    icon: <CheckCircle className="h-4 w-4" />,
    requiresConfirmation: true,
  },
  delete: {
    id: "delete",
    label: "Delete",
    icon: <Trash2 className="h-4 w-4" />,
    variant: "destructive" as const,
    requiresConfirmation: true,
    confirmTitle: "Delete Selected Items",
    confirmDescription: "Are you sure you want to permanently delete the selected items? This action cannot be undone.",
  },
  activate: {
    id: "activate",
    label: "Activate",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  deactivate: {
    id: "deactivate",
    label: "Deactivate",
    icon: <XCircle className="h-4 w-4" />,
    requiresConfirmation: true,
  },
};
