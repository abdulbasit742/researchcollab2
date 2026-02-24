import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = "rcollab_quick_note";

export function QuickNoteWidget() {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setNote(stored);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, note);
      if (note.trim()) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [note]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            Quick Note
          </span>
          {saved && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <Check className="h-3 w-3" />
              Saved
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Jot down a quick thought..."
          className="min-h-[80px] resize-none text-sm border-dashed"
          maxLength={500}
        />
        <p className="text-[10px] text-muted-foreground text-right mt-1">
          {note.length}/500
        </p>
      </CardContent>
    </Card>
  );
}
