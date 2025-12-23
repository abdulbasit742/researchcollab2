import { useState, useEffect, useCallback } from "react";
import { X, Save, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useThreadNotes } from "@/hooks/useChatFeatures";
import { cn } from "@/lib/utils";

interface ThreadNotesPanelProps {
  threadId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ThreadNotesPanel({ threadId, isOpen, onClose }: ThreadNotesPanelProps) {
  const { notes, setNotes, fetchNotes, saveNotes, isSaving } = useThreadNotes(threadId);
  const [localNotes, setLocalNotes] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, fetchNotes]);

  useEffect(() => {
    setLocalNotes(notes);
    setHasChanges(false);
  }, [notes]);

  const handleChange = (value: string) => {
    setLocalNotes(value);
    setHasChanges(value !== notes);
  };

  // Autosave with debounce
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      saveNotes(localNotes);
      setHasChanges(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [localNotes, hasChanges, saveNotes]);

  const handleManualSave = useCallback(() => {
    saveNotes(localNotes);
    setHasChanges(false);
  }, [localNotes, saveNotes]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed inset-y-0 right-0 w-full sm:w-80 z-50",
            "bg-background border-l border-border shadow-xl",
            "flex flex-col"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Private Notes</h3>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleManualSave}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? "Saving…" : "Save"}
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-hidden">
            <Textarea
              value={localNotes}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Add your private notes here... These are only visible to you."
              className="h-full resize-none border-0 focus-visible:ring-0 bg-transparent"
            />
          </div>

          <div className="p-4 border-t border-border text-xs text-muted-foreground">
            {isSaving ? (
              <span>Saving…</span>
            ) : hasChanges ? (
              <span>Unsaved changes</span>
            ) : (
              <span>Auto-saved • Only you can see these notes</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
