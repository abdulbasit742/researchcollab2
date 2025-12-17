import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MessageSquare, 
  Video,
  Upload,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Calendar
} from "lucide-react";
import { dummyOffers } from "@/data/offers";
import { useToast } from "@/hooks/use-toast";

interface Deliverable {
  id: string;
  title: string;
  completed: boolean;
}

export default function WorkRoomPage() {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const offer = dummyOffers.find((o) => o.id === offerId);

  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    { id: "1", title: "Initial requirements review", completed: true },
    { id: "2", title: "Data collection and preparation", completed: true },
    { id: "3", title: "Analysis implementation", completed: false },
    { id: "4", title: "Documentation", completed: false },
    { id: "5", title: "Final delivery and review", completed: false },
  ]);

  const completedCount = deliverables.filter(d => d.completed).length;
  const progress = (completedCount / deliverables.length) * 100;

  if (!offer) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold">Work Room not found</h1>
          <Link to="/offers">
            <Button className="mt-4">Back to Offers</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const toggleDeliverable = (id: string) => {
    setDeliverables(deliverables.map(d => 
      d.id === id ? { ...d, completed: !d.completed } : d
    ));
  };

  const handleMarkDelivered = () => {
    toast({
      title: "Marked as Delivered",
      description: "The client will be notified to review your work.",
    });
  };

  const handleMarkComplete = () => {
    toast({
      title: "Project Completed!",
      description: "The project has been marked as complete. Payment will be processed.",
    });
    navigate("/offers");
  };

  const statusTimeline = [
    { status: "Offer Accepted", date: "Jan 21, 2024", completed: true },
    { status: "Work Started", date: "Jan 22, 2024", completed: true },
    { status: "In Progress", date: "Current", completed: true, current: true },
    { status: "Delivered", date: "Pending", completed: false },
    { status: "Completed", date: "Pending", completed: false },
  ];

  return (
    <MainLayout>
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Badge variant="warning" className="mb-2">In Progress</Badge>
                      <CardTitle className="text-2xl">{offer.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Work Room for your project collaboration
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {completedCount}/{deliverables.length} tasks
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="font-semibold">${offer.budget}</p>
                      <p className="text-xs text-muted-foreground">Budget</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="font-semibold">
                        {new Date(offer.deadline).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                      <p className="font-semibold">8 days</p>
                      <p className="text-xs text-muted-foreground">Remaining</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Deliverables Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Deliverables Checklist
                </CardTitle>
                <CardDescription>
                  Track progress on project deliverables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deliverables.map((item) => (
                    <div 
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                    >
                      <Checkbox 
                        checked={item.completed}
                        onCheckedChange={() => toggleDeliverable(item.id)}
                      />
                      <span className={item.completed ? "line-through text-muted-foreground" : ""}>
                        {item.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* File Upload Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Files & Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-2">
                    Drag & drop files here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Support for documents, images, and archives
                  </p>
                  <Button variant="outline" className="mt-4">
                    Upload Files
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">requirements.pdf</p>
                        <p className="text-xs text-muted-foreground">Uploaded 2 days ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">data_sample.csv</p>
                        <p className="text-xs text-muted-foreground">Uploaded 1 day ago</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Download</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleMarkDelivered} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Mark as Delivered
              </Button>
              <Button variant="secondary" onClick={handleMarkComplete} className="gap-2">
                Complete Project
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Communication Shortcuts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Open Chat
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Video className="h-4 w-4" />
                  Schedule Meeting
                </Button>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Participants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={offer.senderAvatar} />
                    <AvatarFallback>{offer.senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-sm">{offer.senderName}</h4>
                    <p className="text-xs text-muted-foreground">Client</p>
                  </div>
                </div>
                {offer.receiverName && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={offer.receiverAvatar} />
                      <AvatarFallback>{offer.receiverName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm">{offer.receiverName}</h4>
                      <p className="text-xs text-muted-foreground">Provider</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusTimeline.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-3 w-3 rounded-full ${
                          item.current 
                            ? "bg-primary ring-4 ring-primary/20" 
                            : item.completed 
                              ? "bg-primary" 
                              : "bg-muted-foreground/30"
                        }`} />
                        {index < statusTimeline.length - 1 && (
                          <div className={`w-px h-8 ${
                            item.completed ? "bg-primary" : "bg-border"
                          }`} />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-medium ${
                          item.current ? "text-primary" : ""
                        }`}>
                          {item.status}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
