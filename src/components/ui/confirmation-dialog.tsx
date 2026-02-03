import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, DollarSign, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsequenceItem {
  type: "warning" | "money" | "time" | "trust";
  text: string;
}

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  consequences?: ConsequenceItem[];
  confirmText?: string;
  cancelText?: string;
  requireCheckbox?: boolean;
  checkboxLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
}

const consequenceIcons = {
  warning: AlertTriangle,
  money: DollarSign,
  time: Clock,
  trust: Shield,
};

const consequenceColors = {
  warning: "text-amber-600",
  money: "text-emerald-600",
  time: "text-blue-600",
  trust: "text-purple-600",
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  consequences = [],
  confirmText = "Confirm",
  cancelText = "Cancel",
  requireCheckbox = false,
  checkboxLabel = "I understand the consequences",
  variant = "default",
  onConfirm,
}: ConfirmationDialogProps) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
      setChecked(false);
    }
  };

  const canConfirm = !requireCheckbox || checked;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {variant === "destructive" && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Consequences List - THE FRICTION */}
        {consequences.length > 0 && (
          <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
            <p className="text-sm font-medium text-foreground">This action will:</p>
            <ul className="space-y-2">
              {consequences.map((consequence, index) => {
                const Icon = consequenceIcons[consequence.type];
                return (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", consequenceColors[consequence.type])} />
                    <span className="text-muted-foreground">{consequence.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Confirmation Checkbox */}
        {requireCheckbox && (
          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
            <Checkbox
              id="confirm-checkbox"
              checked={checked}
              onCheckedChange={(c) => setChecked(c === true)}
            />
            <Label
              htmlFor="confirm-checkbox"
              className="text-sm font-medium text-amber-700 dark:text-amber-400 cursor-pointer"
            >
              {checkboxLabel}
            </Label>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className={cn(
              variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {loading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Pre-configured dialogs for common actions
export function useConfirmationDialogs() {
  const [dialogState, setDialogState] = useState<{
    type: string | null;
    data: any;
    onConfirm: (() => void | Promise<void>) | null;
  }>({ type: null, data: null, onConfirm: null });

  const openDialog = (type: string, data: any, onConfirm: () => void | Promise<void>) => {
    setDialogState({ type, data, onConfirm });
  };

  const closeDialog = () => {
    setDialogState({ type: null, data: null, onConfirm: null });
  };

  return { dialogState, openDialog, closeDialog };
}
