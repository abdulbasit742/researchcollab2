import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";

interface HeadingItem {
  level: number;
  text: string;
  pos: number;
}

interface DocumentOutlineProps {
  editor: Editor | null;
}

export function DocumentOutline({ editor }: DocumentOutlineProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateHeadings = () => {
      const items: HeadingItem[] = [];
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          items.push({
            level: node.attrs.level,
            text: node.textContent,
            pos,
          });
        }
      });
      setHeadings(items);
    };

    updateHeadings();
    editor.on("update", updateHeadings);
    return () => { editor.off("update", updateHeadings); };
  }, [editor]);

  const scrollTo = (pos: number) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection(pos).run();
    // Scroll the editor to the position
    const domPos = editor.view.domAtPos(pos);
    if (domPos.node instanceof HTMLElement) {
      domPos.node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Outline
        </h4>
        {headings.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Add headings to see outline
          </p>
        ) : (
          <div className="space-y-0.5">
            {headings.map((h, i) => (
              <button
                key={i}
                onClick={() => scrollTo(h.pos)}
                className={cn(
                  "block w-full text-left text-xs py-1 px-2 rounded hover:bg-muted transition-colors truncate",
                  h.level === 1 && "font-semibold",
                  h.level === 2 && "pl-4",
                  h.level === 3 && "pl-6 text-muted-foreground",
                  h.level >= 4 && "pl-8 text-muted-foreground"
                )}
              >
                {h.text || "Untitled"}
              </button>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
