import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Pin, Trash2, Flag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/hooks/useMessaging";

interface MessageContextMenuProps {
  message: Message;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  isMine: boolean;
  isPinned: boolean;
  onCopy: () => void;
  onPin: () => void;
  onDelete: () => void;
  onReport: () => void;
}

export function MessageContextMenu({
  message,
  isOpen,
  onClose,
  position,
  isMine,
  isPinned,
  onCopy,
  onPin,
  onDelete,
  onReport
}: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.body);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1000);
  };

  const msgType = (message as any).type || 'text';
  const canDelete = isMine && (msgType === 'text' || msgType === 'attachment') && !(message as any).deleted_at;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-50" onClick={onClose} />
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            style={{
              position: "fixed",
              left: Math.min(position.x, window.innerWidth - 160),
              top: Math.min(position.y, window.innerHeight - 200),
            }}
            className={cn(
              "z-50 min-w-[150px]",
              "bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
            )}
          >
            <button
              onClick={handleCopy}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-sm"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </button>

            <button
              onClick={() => { onPin(); onClose(); }}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-sm"
            >
              <Pin className={cn("h-4 w-4", isPinned && "text-primary")} />
              {isPinned ? "Unpin" : "Pin"}
            </button>

            {canDelete && (
              <button
                onClick={() => { onDelete(); onClose(); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-sm text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            )}

            {!isMine && (
              <button
                onClick={() => { onReport(); onClose(); }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-sm text-destructive"
              >
                <Flag className="h-4 w-4" />
                Report
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
