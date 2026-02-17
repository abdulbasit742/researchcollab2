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
import { Shield, AlertTriangle } from "lucide-react";

interface FinancialConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  amount: string;
  onConfirm: () => void;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export function FinancialConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  amount,
  onConfirm,
  confirmLabel = "Confirm & Release",
  isDestructive = false,
}: FinancialConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDestructive ? "bg-critical/10" : "bg-primary/10"}`}>
              {isDestructive ? (
                <AlertTriangle className="h-5 w-5 text-critical" />
              ) : (
                <Shield className="h-5 w-5 text-primary" />
              )}
            </div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-muted rounded-lg p-4 my-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Amount</p>
          <p className="text-2xl font-bold text-foreground">{amount}</p>
          <p className="text-xs text-muted-foreground mt-1">This action is irreversible once confirmed.</p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={isDestructive ? "bg-critical text-critical-foreground hover:bg-critical/90" : ""}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
