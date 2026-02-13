 import { useState, useRef, useEffect } from "react";
 import { useCareerCopilot, CareerInsight } from "@/hooks/useCareerCopilot";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { VoiceSearchButton } from "@/components/search/VoiceSearchButton";
 import {
 Sparkles,
 Send,
 Mic,
 User,
 Bot,
 Target,
 TrendingUp,
 AlertTriangle,
 Briefcase,
 ArrowRight,
 Loader2,
 RefreshCw,
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface Message {
 id: string;
 role: "user" | "assistant";
 content: string;
 nextSteps?: string[];
 insights?: CareerInsight[];
 timestamp: Date;
 }
 
 const quickActions = [
 { label: "What should I work on next?", icon: Target },
 { label: "Analyze my trust score", icon: TrendingUp },
 { label: "Find matching opportunities", icon: Briefcase },
 { label: "How can I recover from setbacks?", icon: RefreshCw },
 ];
 
 export default function CareerPage() {
 const { askCopilot, loading } = useCareerCopilot();
 const [messages, setMessages] = useState<Message[]>([]);
 const [input, setInput] = useState("");
 const scrollRef = useRef<HTMLDivElement>(null);
 
 useEffect(() => {
   if (scrollRef.current) {
     scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
   }
 }, [messages]);
 
 const handleSend = async (text?: string) => {
   const question = text || input.trim();
   if (!question) return;
 
   const userMessage: Message = {
     id: Date.now().toString(),
     role: "user",
     content: question,
     timestamp: new Date(),
   };
 
   setMessages((prev) => [...prev, userMessage]);
   setInput("");
 
   const response = await askCopilot(question);
 
   const assistantMessage: Message = {
     id: (Date.now() + 1).toString(),
     role: "assistant",
     content: response?.answer || "I couldn't process that request. Please try again.",
     nextSteps: response?.nextSteps,
     insights: response?.insights,
     timestamp: new Date(),
   };
 
   setMessages((prev) => [...prev, assistantMessage]);
 };
 
 const handleVoiceTranscript = (transcript: string) => {
   setInput(transcript);
   handleSend(transcript);
 };
 
 return (
   <div className="min-h-screen bg-background flex flex-col">
     <Navbar />
     <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
       <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
         {/* Header */}
         <div className="flex items-center gap-3 mb-4">
           <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
             <Sparkles className="h-5 w-5 text-primary" />
           </div>
           <div>
             <h1 className="text-xl font-bold">Career Co-pilot</h1>
             <p className="text-sm text-muted-foreground">
               AI-powered career guidance based on your work history
             </p>
           </div>
         </div>
 
         {/* Chat Area */}
         <Card className="flex-1 flex flex-col overflow-hidden">
           <ScrollArea ref={scrollRef} className="flex-1 p-4">
             {messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-8">
                 <Bot className="h-16 w-16 text-muted-foreground/30 mb-4" />
                 <h3 className="text-lg font-medium mb-2">
                   Welcome to Career Co-pilot
                 </h3>
                 <p className="text-sm text-muted-foreground mb-6 max-w-md">
                   I analyze your work history, trust score, and outcomes to provide
                   personalized career guidance. Ask me anything!
                 </p>
                 <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                   {quickActions.map((action) => (
                     <Button
                       key={action.label}
                       variant="outline"
                       className="justify-start gap-2 h-auto py-3 text-left"
                       onClick={() => handleSend(action.label)}
                     >
                       <action.icon className="h-4 w-4 shrink-0" />
                       <span className="text-xs">{action.label}</span>
                     </Button>
                   ))}
                 </div>
               </div>
             ) : (
               <div className="space-y-4">
                 {messages.map((message) => (
                   <div
                     key={message.id}
                     className={cn(
                       "flex gap-3",
                       message.role === "user" ? "justify-end" : "justify-start"
                     )}
                   >
                     {message.role === "assistant" && (
                       <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                         <Bot className="h-4 w-4 text-primary" />
                       </div>
                     )}
                     <div
                       className={cn(
                         "max-w-[80%] rounded-lg p-3",
                         message.role === "user"
                           ? "bg-primary text-primary-foreground"
                           : "bg-muted"
                       )}
                     >
                       <p className="text-sm">{message.content}</p>
 
                       {message.nextSteps && message.nextSteps.length > 0 && (
                         <div className="mt-3 pt-3 border-t border-border/50">
                           <p className="text-xs font-medium mb-2">Next Steps:</p>
                           <ul className="space-y-1">
                             {message.nextSteps.map((step, i) => (
                               <li
                                 key={i}
                                 className="text-xs flex items-start gap-2"
                               >
                                 <ArrowRight className="h-3 w-3 shrink-0 mt-0.5" />
                                 {step}
                               </li>
                             ))}
                           </ul>
                         </div>
                       )}
 
                       {message.insights && message.insights.length > 0 && (
                         <div className="mt-3 flex flex-wrap gap-1">
                           {message.insights.map((insight, i) => (
                             <Badge
                               key={i}
                               variant={
                                 insight.priority === "high"
                                   ? "destructive"
                                   : "secondary"
                               }
                               className="text-xs"
                             >
                               {insight.title}
                             </Badge>
                           ))}
                         </div>
                       )}
                     </div>
                     {message.role === "user" && (
                       <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                         <User className="h-4 w-4" />
                       </div>
                     )}
                   </div>
                 ))}
                 {loading && (
                   <div className="flex gap-3">
                     <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                       <Bot className="h-4 w-4 text-primary" />
                     </div>
                     <div className="bg-muted rounded-lg p-3">
                       <Loader2 className="h-4 w-4 animate-spin" />
                     </div>
                   </div>
                 )}
               </div>
             )}
           </ScrollArea>
 
           {/* Input Area */}
           <div className="p-4 border-t">
             <div className="flex gap-2">
               <Input
                 placeholder="Ask about your career, opportunities, or trust score..."
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
                 disabled={loading}
                 className="flex-1"
               />
               <VoiceSearchButton
                 onTranscript={handleVoiceTranscript}
                 className="shrink-0"
               />
               <Button
                 onClick={() => handleSend()}
                 disabled={loading || !input.trim()}
                 size="icon"
               >
                 {loading ? (
                   <Loader2 className="h-4 w-4 animate-spin" />
                 ) : (
                   <Send className="h-4 w-4" />
                 )}
               </Button>
             </div>
           </div>
         </Card>
       </div>
     </main>
     <Footer />
   </div>
 );
 }