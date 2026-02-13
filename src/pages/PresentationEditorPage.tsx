import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePresentations } from "@/hooks/usePresentations";
import { useUniversalAI } from "@/hooks/useUniversalAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft, Save, Sparkles, Plus, Trash2, ChevronUp, ChevronDown,
  Loader2, Maximize2, Type, Image as ImageIcon
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SlideData {
  id: string;
  elements: { type: string; content: string; x?: number; y?: number; fontSize?: number }[];
  notes: string;
  background: string;
}

const PresentationEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPresentation, fetchPresentation, updatePresentation, loading } = usePresentations();
  const { ask, loading: aiLoading } = useUniversalAI();
  const [title, setTitle] = useState("");
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [templateType, setTemplateType] = useState("academic");
  const [saving, setSaving] = useState(false);
  const [presentMode, setPresentMode] = useState(false);

  useEffect(() => {
    if (id) fetchPresentation(id);
  }, [id]);

  useEffect(() => {
    if (currentPresentation) {
      setTitle(currentPresentation.title);
      setTemplateType(currentPresentation.template_type);
      const slidesData = currentPresentation.slides_data?.slides;
      if (Array.isArray(slidesData) && slidesData.length > 0) {
        setSlides(slidesData);
      } else {
        setSlides([{
          id: "1",
          elements: [{ type: "title", content: currentPresentation.title, fontSize: 36 }],
          notes: "",
          background: "#ffffff"
        }]);
      }
    }
  }, [currentPresentation]);

  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    await updatePresentation(id, {
      title,
      template_type: templateType,
      slides_data: { slides },
    });
    setSaving(false);
  }, [id, title, templateType, slides, updatePresentation]);

  const addSlide = () => {
    const newSlide: SlideData = {
      id: String(Date.now()),
      elements: [{ type: "title", content: "New Slide", fontSize: 28 }],
      notes: "",
      background: "#ffffff"
    };
    setSlides(prev => [...prev.slice(0, activeSlide + 1), newSlide, ...prev.slice(activeSlide + 1)]);
    setActiveSlide(prev => prev + 1);
  };

  const removeSlide = (idx: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== idx));
    setActiveSlide(prev => Math.min(prev, slides.length - 2));
  };

  const moveSlide = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= slides.length) return;
    setSlides(prev => {
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
    setActiveSlide(newIdx);
  };

  const updateSlideContent = (content: string) => {
    setSlides(prev => prev.map((s, i) =>
      i === activeSlide
        ? { ...s, elements: [{ ...s.elements[0], content }] }
        : s
    ));
  };

  const updateSlideNotes = (notes: string) => {
    setSlides(prev => prev.map((s, i) =>
      i === activeSlide ? { ...s, notes } : s
    ));
  };

  const handleAI = async (action: string) => {
    const slideContent = slides.map(s => s.elements[0]?.content || "").join("\n");
    const result = await ask("research", action, {
      content: slideContent.slice(0, 3000),
      template: templateType,
      currentSlide: slides[activeSlide]?.elements[0]?.content || ""
    });
    if (result?.slides && Array.isArray(result.slides)) {
      const newSlides: SlideData[] = result.slides.map((s: any, i: number) => ({
        id: String(Date.now() + i),
        elements: [{ type: "title", content: s.title || s.content || "", fontSize: 28 }],
        notes: s.notes || "",
        background: "#ffffff"
      }));
      setSlides(prev => [...prev, ...newSlides]);
    }
  };

  // Presentation mode
  if (presentMode) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-pointer"
        onClick={() => {
          if (activeSlide < slides.length - 1) setActiveSlide(prev => prev + 1);
          else setPresentMode(false);
        }}
        onKeyDown={e => {
          if (e.key === "Escape") setPresentMode(false);
          if (e.key === "ArrowRight" && activeSlide < slides.length - 1) setActiveSlide(prev => prev + 1);
          if (e.key === "ArrowLeft" && activeSlide > 0) setActiveSlide(prev => prev - 1);
        }}
        tabIndex={0}
      >
        <div className="w-full max-w-5xl aspect-video bg-white rounded-lg p-12 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-center text-gray-900">
            {slides[activeSlide]?.elements[0]?.content || ""}
          </h1>
        </div>
        <div className="absolute bottom-4 right-4 text-white/60 text-sm">
          {activeSlide + 1} / {slides.length} · Press ESC to exit
        </div>
      </div>
    );
  }

  if (loading && !currentPresentation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentSlideData = slides[activeSlide];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Toolbar */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex items-center gap-2 px-4 py-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/productivity")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border-0 text-lg font-semibold bg-transparent focus-visible:ring-0 max-w-md"
            placeholder="Presentation title"
          />
          <div className="flex-1" />
          <Select value={templateType} onValueChange={setTemplateType}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="thesis">Thesis Defense</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="research">Research</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-xs">{slides.length} slides</Badge>
          <Button variant="outline" size="sm" onClick={() => setPresentMode(true)} className="gap-1.5 text-xs">
            <Maximize2 className="h-3.5 w-3.5" /> Present
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                AI
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleAI("generate_outline_slides")}>Generate Outline Slides</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("expand_slide")}>Expand Current Slide</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAI("summarize_to_slides")}>Summarize to Slides</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex">
        {/* Slide thumbnails */}
        <div className="w-48 border-r bg-muted/30 p-2">
          <ScrollArea className="h-[calc(100vh-60px)]">
            <div className="space-y-2">
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  onClick={() => setActiveSlide(idx)}
                  className={`group relative cursor-pointer rounded-md border-2 transition-colors ${
                    idx === activeSlide ? "border-primary" : "border-transparent hover:border-muted-foreground/20"
                  }`}
                >
                  <div className="aspect-video bg-white rounded-sm p-2 flex items-center justify-center">
                    <p className="text-[8px] text-center text-gray-600 line-clamp-3">
                      {slide.elements[0]?.content || "Empty Slide"}
                    </p>
                  </div>
                  <span className="absolute top-1 left-1.5 text-[9px] text-muted-foreground">{idx + 1}</span>
                  <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 flex gap-0.5">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={e => { e.stopPropagation(); moveSlide(idx, -1); }}>
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={e => { e.stopPropagation(); moveSlide(idx, 1); }}>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={e => { e.stopPropagation(); removeSlide(idx); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addSlide} className="w-full text-xs gap-1">
                <Plus className="h-3 w-3" /> Add Slide
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Main canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/10">
          <div className="w-full max-w-4xl aspect-video bg-white rounded-xl shadow-lg border flex items-center justify-center p-12">
            <Textarea
              value={currentSlideData?.elements[0]?.content || ""}
              onChange={e => updateSlideContent(e.target.value)}
              placeholder="Slide content..."
              className="text-2xl font-semibold text-center border-0 resize-none bg-transparent focus-visible:ring-0 h-full w-full"
            />
          </div>

          {/* Notes */}
          <div className="w-full max-w-4xl mt-4">
            <p className="text-xs text-muted-foreground mb-1">Speaker Notes</p>
            <Textarea
              value={currentSlideData?.notes || ""}
              onChange={e => updateSlideNotes(e.target.value)}
              placeholder="Add speaker notes..."
              className="min-h-[60px] text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresentationEditorPage;
