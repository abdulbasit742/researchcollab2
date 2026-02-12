import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, BookOpen, Code, FileText, BarChart3, DollarSign } from "lucide-react";

const taskTypeIcons: Record<string, any> = {
  literature_review: BookOpen, coding: Code, data_cleaning: FileText, survey_analysis: BarChart3, writing: FileText, other: FileText,
};

const mockTasks = [
  { id: "1", title: "Literature Review on Federated Learning", type: "literature_review", reward: 5000, trust_weight: 1.2, status: "open", institution: "FAST-NUCES", posted_by: "Dr. Ahmed Khan" },
  { id: "2", title: "Data Cleaning for IoT Sensor Dataset", type: "data_cleaning", reward: 3000, trust_weight: 1.0, status: "open", institution: "NUST", posted_by: "Prof. Sara Malik" },
  { id: "3", title: "Python Script for Sentiment Analysis", type: "coding", reward: 8000, trust_weight: 1.5, status: "assigned", institution: "LUMS", posted_by: "Dr. Usman Tariq" },
  { id: "4", title: "Survey Data Analysis for HCI Study", type: "survey_analysis", reward: 4000, trust_weight: 1.1, status: "open", institution: "FAST-NUCES", posted_by: "Dr. Amina Shah" },
  { id: "5", title: "Technical Writing for Research Paper", type: "writing", reward: 6000, trust_weight: 1.3, status: "completed", institution: "COMSATS", posted_by: "Prof. Bilal Ahmad" },
];

const statusColor: Record<string, string> = {
  open: "bg-green-500/10 text-green-600 border-green-500/20",
  assigned: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
};

export default function AcademicTaskMarketplacePage() {
  const [search, setSearch] = useState("");
  const filtered = mockTasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.type.includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Academic Task Marketplace</h1>
            <p className="text-muted-foreground mt-1">Quick tasks for trust growth and earnings</p>
          </div>
          <Button className="gap-2"><Plus className="h-4 w-4" /> Post Task</Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tasks..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="literature_review">Literature</TabsTrigger>
            <TabsTrigger value="coding">Coding</TabsTrigger>
            <TabsTrigger value="data_cleaning">Data</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-3 mt-4">
            {filtered.map(task => {
              const Icon = taskTypeIcons[task.type] || FileText;
              return (
                <Card key={task.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-muted-foreground">{task.institution} · {task.posted_by}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold flex items-center gap-1"><DollarSign className="h-3 w-3" /> PKR {task.reward.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Trust ×{task.trust_weight}</p>
                        </div>
                        <Badge variant="outline" className={statusColor[task.status]}>{task.status}</Badge>
                        {task.status === "open" && <Button size="sm">Apply</Button>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
          {["literature_review", "coding", "data_cleaning", "writing"].map(type => (
            <TabsContent key={type} value={type} className="space-y-3 mt-4">
              {filtered.filter(t => t.type === type).map(task => {
                const Icon = taskTypeIcons[task.type];
                return (
                  <Card key={task.id}><CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
                        <div><p className="font-medium">{task.title}</p><p className="text-sm text-muted-foreground">{task.institution}</p></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">PKR {task.reward.toLocaleString()}</p>
                        <Badge variant="outline" className={statusColor[task.status]}>{task.status}</Badge>
                        {task.status === "open" && <Button size="sm">Apply</Button>}
                      </div>
                    </div>
                  </CardContent></Card>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
