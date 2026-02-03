import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar, Clock, DollarSign, FileText, Play, Pause, Timer, Receipt,
  TrendingUp, CheckCircle, AlertCircle, Send, Download, Plus, Eye,
  Briefcase, Edit, Trash2, MoreHorizontal, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdvancedScheduling, useInvoicing, useContractManagement, useTimeTracking, useProposalBuilder, useExpenseTracking } from "@/hooks/useProfessionalOperations";
import { format, formatDistanceToNow } from "date-fns";

// Availability Calendar
export function AvailabilityCalendar() {
  const { slots, preferences, meetingRequests, addSlot, respondToRequest, availableSlots } = useAdvancedScheduling();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Availability Calendar
        </CardTitle>
        <CardDescription>
          Manage your professional availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium">{preferences.timezone}</p>
            <p className="text-xs text-muted-foreground">
              {preferences.workingHours.start} - {preferences.workingHours.end}
            </p>
          </div>
          <Badge variant="outline">{availableSlots.length} slots open</Badge>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Today's Schedule</h4>
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                slot.type === "available" ? "border-emerald-500/30 bg-emerald-500/5" :
                slot.type === "blocked" ? "border-muted bg-muted/30" : "border-amber-500/30 bg-amber-500/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Clock className={cn(
                  "h-4 w-4",
                  slot.type === "available" ? "text-emerald-500" :
                  slot.type === "blocked" ? "text-muted-foreground" : "text-amber-500"
                )} />
                <div>
                  <p className="text-sm font-medium">{slot.startTime} - {slot.endTime}</p>
                  <p className="text-xs text-muted-foreground">{slot.label}</p>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">{slot.type}</Badge>
            </div>
          ))}
        </div>

        {meetingRequests.filter(r => r.status === "pending").length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Pending Requests</h4>
            {meetingRequests.filter(r => r.status === "pending").map((request) => (
              <div key={request.id} className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{request.requesterName}</span>
                  <Badge>{request.duration} min</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{request.purpose}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respondToRequest(request.id, "accepted")}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => respondToRequest(request.id, "declined")}>Decline</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Availability
        </Button>
      </CardContent>
    </Card>
  );
}

// Invoice Manager
export function InvoiceManager() {
  const { invoices, totalOutstanding, totalEarned, markAsPaid } = useInvoicing();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      case "sent": return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "overdue": return "bg-destructive/10 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Invoices
        </CardTitle>
        <CardDescription>
          Manage billing and payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <p className="text-xs text-muted-foreground">Total Earned</p>
            <p className="text-2xl font-bold text-emerald-600">${totalEarned.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-bold text-amber-600">${totalOutstanding.toLocaleString()}</p>
          </div>
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{invoice.number}</p>
                    <p className="text-xs text-muted-foreground">{invoice.clientName}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", getStatusColor(invoice.status))}>
                    {invoice.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">${invoice.total.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">
                    Due {format(invoice.dueDate, "MMM d, yyyy")}
                  </span>
                </div>
                {invoice.status === "sent" && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => markAsPaid(invoice.id, "bank")}>
                      Mark Paid
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs">
                      <Send className="h-3 w-3 mr-1" />
                      Remind
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </CardContent>
    </Card>
  );
}

// Contract Manager
export function ContractManager() {
  const { contracts, signContract } = useContractManagement();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Contracts
        </CardTitle>
        <CardDescription>
          Manage legal agreements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input placeholder="Search contracts..." className="flex-1" />
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div key={contract.id} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{contract.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize text-xs">{contract.type}</Badge>
                      <Badge variant={contract.status === "active" ? "default" : "secondary"} className="text-xs">
                        {contract.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${contract.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{contract.currency}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Parties</p>
                  <div className="flex flex-wrap gap-2">
                    {contract.parties.map((party) => (
                      <div key={party.id} className="flex items-center gap-1">
                        {party.hasSigned ? (
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-amber-500" />
                        )}
                        <span className="text-xs">{party.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    {format(contract.startDate, "MMM d")} - {contract.endDate ? format(contract.endDate, "MMM d, yyyy") : "Ongoing"}
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Time Tracker
export function TimeTracker() {
  const { entries, activeTimer, startTimer, stopTimer, report } = useTimeTracking();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          Time Tracker
        </CardTitle>
        <CardDescription>
          Track billable hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTimer ? (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium">{activeTimer.projectName}</p>
                <p className="text-sm text-muted-foreground">{activeTimer.description}</p>
              </div>
              <div className="text-2xl font-mono font-bold text-primary">
                {Math.floor((Date.now() - activeTimer.startTime.getTime()) / 60000)}:
                {String(Math.floor(((Date.now() - activeTimer.startTime.getTime()) % 60000) / 1000)).padStart(2, '0')}
              </div>
            </div>
            <Button onClick={stopTimer} variant="destructive" className="w-full gap-2">
              <Pause className="h-4 w-4" />
              Stop Timer
            </Button>
          </div>
        ) : (
          <Button 
            onClick={() => startTimer("p1", "Current Project", "Working on task", 125)}
            className="w-full gap-2"
          >
            <Play className="h-4 w-4" />
            Start Timer
          </Button>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">{report.totalHours.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-emerald-600">{report.billableHours.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground">Billable</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">${report.totalEarnings.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
        </div>

        <ScrollArea className="h-48">
          <div className="space-y-2">
            {entries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{entry.projectName}</p>
                  <p className="text-xs text-muted-foreground">{entry.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{Math.floor(entry.duration / 60)}h {entry.duration % 60}m</p>
                  <p className="text-xs text-muted-foreground">${((entry.duration / 60) * entry.rate).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Proposal Manager
export function ProposalManager() {
  const { proposals, sendProposal } = useProposalBuilder();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Proposals
        </CardTitle>
        <CardDescription>
          Create and track proposals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Proposal
        </Button>

        <ScrollArea className="h-64">
          <div className="space-y-3">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-sm">{proposal.title}</h4>
                    <p className="text-xs text-muted-foreground">{proposal.clientName}</p>
                  </div>
                  <Badge variant={
                    proposal.status === "accepted" ? "default" :
                    proposal.status === "declined" ? "destructive" : "secondary"
                  } className="text-xs">
                    {proposal.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">${proposal.totalValue.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">
                    Valid until {format(proposal.validUntil, "MMM d")}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  {proposal.status === "draft" && (
                    <Button 
                      size="sm" 
                      className="h-7 text-xs flex-1"
                      onClick={() => sendProposal(proposal.id)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Expense Tracker
export function ExpenseTracker() {
  const { expenses, addExpense, totalExpenses, pendingReimbursement } = useExpenseTracking();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Expenses
        </CardTitle>
        <CardDescription>
          Track project expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-xl font-bold">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <p className="text-xs text-muted-foreground">Pending Reimbursement</p>
            <p className="text-xl font-bold text-amber-600">${pendingReimbursement.toLocaleString()}</p>
          </div>
        </div>

        <ScrollArea className="h-48">
          <div className="space-y-2">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{expense.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize text-xs">{expense.category}</Badge>
                    <span className="text-xs text-muted-foreground">{expense.projectName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${expense.amount}</p>
                  <Badge variant={expense.status === "approved" ? "default" : "secondary"} className="text-xs">
                    {expense.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Button className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </CardContent>
    </Card>
  );
}

// Combined Professional Operations Dashboard
export function ProfessionalOperationsDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <TimeTracker />
        <AvailabilityCalendar />
        <InvoiceManager />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <ContractManager />
        <ProposalManager />
        <ExpenseTracker />
      </div>
    </div>
  );
}
