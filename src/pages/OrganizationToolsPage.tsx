import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Plus, Users, Calendar, CreditCard, RefreshCw,
  Sparkles, Brain, Search as SearchIcon, Wand2
} from "lucide-react";
import { 
  getOrganizationById, getOrgLicenses, getOrgMembers,
  BulkToolLicense
} from "@/data/organizations";
import { tools } from "@/data/tools";

const seatOptions = [
  { seats: 10, discount: 0 },
  { seats: 25, discount: 5 },
  { seats: 50, discount: 10 },
  { seats: 100, discount: 15 },
];

const OrganizationToolsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [selectedSeats, setSelectedSeats] = useState<number>(10);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<BulkToolLicense | null>(null);
  
  const org = getOrganizationById(id || '');
  const licenses = org ? getOrgLicenses(org.id) : [];
  const members = org ? getOrgMembers(org.id) : [];

  if (!org) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Organization Not Found</h1>
          <Button onClick={() => navigate('/org')}>Browse Organizations</Button>
        </div>
      </MainLayout>
    );
  }

  const getToolIcon = (toolId: string) => {
    const icons: Record<string, any> = {
      'chatgpt-5-3': Sparkles,
      'perplexity-pro': SearchIcon,
      'gemini-4': Brain,
      'default': Wand2
    };
    return icons[toolId] || icons.default;
  };

  const handlePurchase = () => {
    const tool = tools.find(t => t.id === selectedTool);
    if (!tool) return;
    
    const option = seatOptions.find(o => o.seats === selectedSeats);
    const basePrice = tool.price * selectedSeats;
    const discount = option?.discount || 0;
    const finalPrice = basePrice * (1 - discount / 100);
    
    toast({
      title: "License Purchased",
      description: `${selectedSeats} seats of ${tool.name} added for $${finalPrice.toFixed(2)}/month`
    });
    setPurchaseOpen(false);
  };

  const handleAssignSeat = (memberName: string) => {
    toast({
      title: "Seat Assigned",
      description: `${memberName} now has access to ${selectedLicense?.toolName}`
    });
  };

  const handleRevokeSeat = (memberName: string) => {
    toast({
      title: "Seat Revoked",
      description: `${memberName}'s access to ${selectedLicense?.toolName} has been revoked`
    });
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/org/${id}/dashboard`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Bulk Tool Licenses</h1>
            <p className="text-muted-foreground">{org.name}</p>
          </div>
          <Dialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Purchase License
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Purchase Bulk License</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Select Tool</Label>
                  <Select value={selectedTool} onValueChange={setSelectedTool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a tool" />
                    </SelectTrigger>
                    <SelectContent>
                      {tools.slice(0, 6).map(tool => (
                        <SelectItem key={tool.id} value={tool.id}>
                          {tool.name} - ${tool.price}/seat/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Seats</Label>
                  <Select 
                    value={selectedSeats.toString()} 
                    onValueChange={(v) => setSelectedSeats(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {seatOptions.map(option => (
                        <SelectItem key={option.seats} value={option.seats.toString()}>
                          {option.seats} seats {option.discount > 0 && `(${option.discount}% off)`}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom (Contact Sales)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {selectedTool && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between mb-2">
                        <span>Base Price</span>
                        <span>${(tools.find(t => t.id === selectedTool)?.price || 0) * selectedSeats}/mo</span>
                      </div>
                      {seatOptions.find(o => o.seats === selectedSeats)?.discount > 0 && (
                        <div className="flex justify-between text-green-600 mb-2">
                          <span>Bulk Discount</span>
                          <span>-{seatOptions.find(o => o.seats === selectedSeats)?.discount}%</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total</span>
                        <span>
                          ${((tools.find(t => t.id === selectedTool)?.price || 0) * selectedSeats * 
                            (1 - (seatOptions.find(o => o.seats === selectedSeats)?.discount || 0) / 100)).toFixed(2)}/mo
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Button onClick={handlePurchase} className="w-full" disabled={!selectedTool}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase License
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active Licenses</p>
              <p className="text-2xl font-bold">{licenses.filter(l => l.status === 'active').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Seats</p>
              <p className="text-2xl font-bold">{licenses.reduce((sum, l) => sum + l.totalSeats, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Seats Used</p>
              <p className="text-2xl font-bold">{licenses.reduce((sum, l) => sum + l.usedSeats, 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Monthly Cost</p>
              <p className="text-2xl font-bold">${licenses.reduce((sum, l) => sum + l.totalPrice, 0)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Licenses */}
        <div className="grid md:grid-cols-2 gap-6">
          {licenses.map(license => {
            const IconComponent = getToolIcon(license.toolId);
            const usagePercent = (license.usedSeats / license.totalSeats) * 100;
            
            return (
              <Card key={license.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{license.toolName}</CardTitle>
                        <CardDescription>
                          ${license.pricePerSeat}/seat/mo • {license.totalSeats} seats
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={license.status === 'active' ? 'default' : 'secondary'}>
                      {license.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Usage */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Seat Usage</span>
                        <span className="font-medium">{license.usedSeats}/{license.totalSeats}</span>
                      </div>
                      <Progress value={usagePercent} className="h-2" />
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Expires: {license.endDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>${license.totalPrice}/mo</span>
                      </div>
                    </div>

                    {/* Auto-renew */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Auto-renew</span>
                      </div>
                      <Switch checked={license.autoRenew} />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Dialog open={assignOpen && selectedLicense?.id === license.id} onOpenChange={(open) => {
                        setAssignOpen(open);
                        if (open) setSelectedLicense(license);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            <Users className="h-4 w-4 mr-2" />
                            Manage Seats
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Manage Seats - {license.toolName}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4 max-h-96 overflow-y-auto">
                            {members.filter(m => m.status === 'active').map(member => {
                              const hasAccess = member.toolAccess.includes(license.toolId);
                              return (
                                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div>
                                    <p className="font-medium">{member.userName}</p>
                                    <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                                  </div>
                                  {hasAccess ? (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleRevokeSeat(member.userName)}
                                    >
                                      Revoke
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm"
                                      onClick={() => handleAssignSeat(member.userName)}
                                      disabled={license.usedSeats >= license.totalSeats}
                                    >
                                      Assign
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Seats
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {licenses.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Tool Licenses Yet</h3>
              <p className="text-muted-foreground mb-4">
                Purchase bulk licenses for AI tools to provide your members with discounted access.
              </p>
              <Button onClick={() => setPurchaseOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Purchase First License
              </Button>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default OrganizationToolsPage;
