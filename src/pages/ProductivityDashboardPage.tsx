import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDocuments } from "@/hooks/useDocuments";
import { useSpreadsheets } from "@/hooks/useSpreadsheets";
import { usePresentations } from "@/hooks/usePresentations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText, Table2, Presentation, Plus, Search, Clock,
  MoreHorizontal, Trash2, Archive, Sparkles
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { MainLayout } from "@/components/layout/MainLayout";

const ProductivityDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { documents, fetchDocuments, createDocument, deleteDocument, loading: docsLoading } = useDocuments();
  const { spreadsheets, fetchSpreadsheets, createSpreadsheet, deleteSpreadsheet, loading: sheetsLoading } = useSpreadsheets();
  const { presentations, fetchPresentations, createPresentation, deletePresentation, loading: slidesLoading } = usePresentations();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchSpreadsheets();
      fetchPresentations();
    }
  }, [user]);

  const handleNewDoc = async () => {
    const doc = await createDocument();
    if (doc) navigate(`/documents/${doc.id}`);
  };

  const handleNewSheet = async () => {
    const sheet = await createSpreadsheet();
    if (sheet) navigate(`/sheets/${sheet.id}`);
  };

  const handleNewSlides = async () => {
    const pres = await createPresentation();
    if (pres) navigate(`/slides/${pres.id}`);
  };

  const filteredDocs = documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
  const filteredSheets = spreadsheets.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));
  const filteredSlides = presentations.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const totalItems = documents.length + spreadsheets.length + presentations.length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Research Productivity Suite</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {totalItems} files · Academic-optimized documents, data, and presentations
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNewDoc} size="sm" className="gap-1.5">
              <FileText className="h-4 w-4" /> New Doc
            </Button>
            <Button onClick={handleNewSheet} size="sm" variant="outline" className="gap-1.5">
              <Table2 className="h-4 w-4" /> New Sheet
            </Button>
            <Button onClick={handleNewSlides} size="sm" variant="outline" className="gap-1.5">
              <Presentation className="h-4 w-4" /> New Slides
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents, sheets, slides..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({totalItems})</TabsTrigger>
            <TabsTrigger value="docs" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Docs ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="sheets" className="gap-1.5">
              <Table2 className="h-3.5 w-3.5" /> Sheets ({spreadsheets.length})
            </TabsTrigger>
            <TabsTrigger value="slides" className="gap-1.5">
              <Presentation className="h-3.5 w-3.5" /> Slides ({presentations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredDocs.length > 0 && <FileSection title="Documents" icon={<FileText className="h-4 w-4 text-blue-500" />} items={filteredDocs} type="doc" onDelete={deleteDocument} navigate={navigate} />}
            {filteredSheets.length > 0 && <FileSection title="Spreadsheets" icon={<Table2 className="h-4 w-4 text-emerald-500" />} items={filteredSheets} type="sheet" onDelete={deleteSpreadsheet} navigate={navigate} />}
            {filteredSlides.length > 0 && <FileSection title="Presentations" icon={<Presentation className="h-4 w-4 text-amber-500" />} items={filteredSlides} type="slides" onDelete={deletePresentation} navigate={navigate} />}
            {totalItems === 0 && !docsLoading && !sheetsLoading && !slidesLoading && (
              <EmptyState onNewDoc={handleNewDoc} onNewSheet={handleNewSheet} onNewSlides={handleNewSlides} />
            )}
          </TabsContent>

          <TabsContent value="docs">
            <FileSection title="Documents" icon={<FileText className="h-4 w-4 text-blue-500" />} items={filteredDocs} type="doc" onDelete={deleteDocument} navigate={navigate} />
            {filteredDocs.length === 0 && <EmptySingle type="document" onCreate={handleNewDoc} />}
          </TabsContent>

          <TabsContent value="sheets">
            <FileSection title="Spreadsheets" icon={<Table2 className="h-4 w-4 text-emerald-500" />} items={filteredSheets} type="sheet" onDelete={deleteSpreadsheet} navigate={navigate} />
            {filteredSheets.length === 0 && <EmptySingle type="spreadsheet" onCreate={handleNewSheet} />}
          </TabsContent>

          <TabsContent value="slides">
            <FileSection title="Presentations" icon={<Presentation className="h-4 w-4 text-amber-500" />} items={filteredSlides} type="slides" onDelete={deletePresentation} navigate={navigate} />
            {filteredSlides.length === 0 && <EmptySingle type="presentation" onCreate={handleNewSlides} />}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

const FileSection = ({ title, icon, items, type, onDelete, navigate }: any) => {
  const getPath = (id: string) => {
    if (type === "doc") return `/documents/${id}`;
    if (type === "sheet") return `/sheets/${id}`;
    return `/slides/${id}`;
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <Badge variant="secondary" className="text-xs">{items.length}</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item: any) => (
          <Card key={item.id} className="cursor-pointer hover:border-primary/40 transition-colors group" onClick={() => navigate(getPath(item.id))}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(item.updated_at), "MMM d, yyyy")}
                    {item.ai_assisted && <Badge variant="outline" className="text-[10px] px-1 py-0 gap-0.5"><Sparkles className="h-2.5 w-2.5" />AI</Badge>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={e => { e.stopPropagation(); onDelete(item.id); }} className="text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const EmptyState = ({ onNewDoc, onNewSheet, onNewSlides }: any) => (
  <div className="text-center py-16">
    <div className="flex justify-center gap-3 mb-4">
      <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center"><FileText className="h-6 w-6 text-blue-500" /></div>
      <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Table2 className="h-6 w-6 text-emerald-500" /></div>
      <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center"><Presentation className="h-6 w-6 text-amber-500" /></div>
    </div>
    <h3 className="text-lg font-semibold mb-1">Research Productivity Suite</h3>
    <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
      Create academic documents, research data sheets, and presentation slides — all optimized for researchers.
    </p>
    <div className="flex justify-center gap-2">
      <Button onClick={onNewDoc} size="sm"><FileText className="h-4 w-4 mr-1.5" /> New Document</Button>
      <Button onClick={onNewSheet} size="sm" variant="outline"><Table2 className="h-4 w-4 mr-1.5" /> New Sheet</Button>
      <Button onClick={onNewSlides} size="sm" variant="outline"><Presentation className="h-4 w-4 mr-1.5" /> New Slides</Button>
    </div>
  </div>
);

const EmptySingle = ({ type, onCreate }: { type: string; onCreate: () => void }) => (
  <div className="text-center py-12">
    <p className="text-muted-foreground text-sm mb-3">No {type}s yet</p>
    <Button onClick={onCreate} size="sm"><Plus className="h-4 w-4 mr-1.5" /> Create {type}</Button>
  </div>
);

export default ProductivityDashboardPage;
