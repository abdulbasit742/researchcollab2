import { useState, useCallback, useRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * GuardedButton — Prevents double-click, shows loading state,
 * and disables while async action is processing.
 */
interface GuardedButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick: () => Promise<void> | void;
  loadingText?: string;
}

export function GuardedButton({
  onClick,
  children,
  loadingText,
  disabled,
  className,
  ...props
}: GuardedButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const guardRef = useRef(false);

  const handleClick = useCallback(async () => {
    if (guardRef.current || disabled) return;
    guardRef.current = true;
    setIsProcessing(true);
    try {
      await onClick();
    } finally {
      setIsProcessing(false);
      guardRef.current = false;
    }
  }, [onClick, disabled]);

  return (
    <Button
      {...props}
      disabled={disabled || isProcessing}
      onClick={handleClick}
      className={cn(className)}
      aria-busy={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
