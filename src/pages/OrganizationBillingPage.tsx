import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Download, CreditCard, Calendar, FileText,
  CheckCircle2, AlertCircle, Clock, Search
} from "lucide-react";
import { getOrganizationById, getOrgInvoices, OrgInvoice } from "@/data/organizations";

const OrganizationBillingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const org = getOrganizationById(id || '');
  const invoices = org ? getOrgInvoices(org.id) : [];

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

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: OrgInvoice['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'overdue': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'sent': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: OrgInvoice['status']) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500">Paid</Badge>;
      case 'overdue': return <Badge variant="destructive">Overdue</Badge>;
      case 'sent': return <Badge variant="secondary">Sent</Badge>;
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      case 'cancelled': return <Badge variant="outline">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleDownload = (invoiceNumber: string) => {
    toast({
      title: "Downloading Invoice",
      description: `${invoiceNumber}.pdf will be downloaded shortly`
    });
  };

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/org/${id}/dashboard`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Billing & Invoices</h1>
            <p className="text-muted-foreground">{org.name}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs">Total Paid</span>
              </div>
              <p className="text-2xl font-bold text-green-600">${totalPaid}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-xs">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">${totalPending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-xs">Overdue</span>
              </div>
              <p className="text-2xl font-bold text-destructive">${totalOverdue}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <FileText className="h-4 w-4" />
                <span className="text-xs">Total Invoices</span>
              </div>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'sent', 'overdue'].map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map(invoice => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <span className="font-medium">{invoice.invoiceNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{invoice.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.items.length} item(s)
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${invoice.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {invoice.dueDate.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownload(invoice.invoiceNumber)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'sent' || invoice.status === 'overdue' ? (
                          <Button size="sm">
                            <CreditCard className="h-4 w-4 mr-1" />
                            Pay Now
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invoice Details Modal would go here */}
      </div>
    </MainLayout>
  );
};

export default OrganizationBillingPage;
