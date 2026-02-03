import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Advanced Scheduling System
interface TimeSlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: "available" | "busy" | "tentative" | "blocked";
  recurring: boolean;
  label?: string;
}

interface SchedulingPreferences {
  timezone: string;
  workingHours: { start: string; end: string };
  workingDays: number[];
  bufferTime: number;
  maxMeetingsPerDay: number;
  preferredMeetingDuration: number;
}

interface MeetingRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  purpose: string;
  proposedTimes: Date[];
  duration: number;
  status: "pending" | "accepted" | "declined" | "rescheduled";
  message?: string;
}

export function useAdvancedScheduling() {
  const [slots, setSlots] = useState<TimeSlot[]>([
    { id: "1", date: new Date(), startTime: "09:00", endTime: "12:00", type: "available", recurring: true, label: "Morning focus" },
    { id: "2", date: new Date(), startTime: "14:00", endTime: "17:00", type: "available", recurring: true, label: "Collaboration hours" },
    { id: "3", date: new Date(), startTime: "12:00", endTime: "14:00", type: "blocked", recurring: true, label: "Lunch" },
  ]);

  const [preferences, setPreferences] = useState<SchedulingPreferences>({
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    workingHours: { start: "09:00", end: "18:00" },
    workingDays: [1, 2, 3, 4, 5],
    bufferTime: 15,
    maxMeetingsPerDay: 5,
    preferredMeetingDuration: 30,
  });

  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([
    {
      id: "1", requesterId: "u1", requesterName: "Dr. Sarah Chen",
      purpose: "Project kickoff discussion", proposedTimes: [new Date()],
      duration: 30, status: "pending", message: "Would love to discuss the research collaboration",
    },
  ]);

  const addSlot = useCallback((slot: Omit<TimeSlot, "id">) => {
    setSlots(prev => [...prev, { ...slot, id: crypto.randomUUID() }]);
  }, []);

  const respondToRequest = useCallback((requestId: string, response: "accepted" | "declined", alternativeTime?: Date) => {
    setMeetingRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: response } : r
    ));
  }, []);

  const availableSlots = useMemo(() => 
    slots.filter(s => s.type === "available"),
    [slots]
  );

  return { slots, preferences, setPreferences, meetingRequests, addSlot, respondToRequest, availableSlots };
}

// Invoice & Billing System
interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
  dueDate: Date;
  createdAt: Date;
  paidAt?: Date;
  paymentMethod?: string;
  notes?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  milestone?: string;
}

interface BillingSettings {
  defaultCurrency: string;
  taxRate: number;
  paymentTerms: number;
  bankDetails: string;
  invoicePrefix: string;
  autoReminders: boolean;
  reminderDays: number[];
}

export function useInvoicing() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "1", number: "INV-2024-001", clientId: "c1", clientName: "Stanford Research Lab",
      projectId: "p1", projectName: "AI Research Collaboration",
      items: [
        { id: "i1", description: "Data analysis - Phase 1", quantity: 40, rate: 125, amount: 5000, milestone: "M1" },
        { id: "i2", description: "Model development", quantity: 60, rate: 150, amount: 9000, milestone: "M2" },
      ],
      subtotal: 14000, tax: 0, total: 14000, currency: "USD",
      status: "paid", dueDate: new Date("2024-02-15"), createdAt: new Date("2024-01-15"), paidAt: new Date("2024-02-10"),
    },
    {
      id: "2", number: "INV-2024-002", clientId: "c2", clientName: "TechCorp Inc",
      projectId: "p2", projectName: "Consulting Engagement",
      items: [
        { id: "i3", description: "Strategic consulting", quantity: 20, rate: 200, amount: 4000 },
      ],
      subtotal: 4000, tax: 320, total: 4320, currency: "USD",
      status: "sent", dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), createdAt: new Date(),
    },
  ]);

  const [settings, setSettings] = useState<BillingSettings>({
    defaultCurrency: "USD",
    taxRate: 0,
    paymentTerms: 30,
    bankDetails: "Bank: Example Bank\nAccount: 1234567890\nRouting: 987654321",
    invoicePrefix: "INV",
    autoReminders: true,
    reminderDays: [7, 3, 1],
  });

  const createInvoice = useCallback((invoice: Omit<Invoice, "id" | "number" | "createdAt">) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      number: `${settings.invoicePrefix}-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`,
      createdAt: new Date(),
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  }, [invoices.length, settings.invoicePrefix]);

  const markAsPaid = useCallback((invoiceId: string, paymentMethod: string) => {
    setInvoices(prev => prev.map(i =>
      i.id === invoiceId ? { ...i, status: "paid", paidAt: new Date(), paymentMethod } : i
    ));
  }, []);

  const totalOutstanding = useMemo(() =>
    invoices
      .filter(i => ["sent", "viewed", "overdue"].includes(i.status))
      .reduce((sum, i) => sum + i.total, 0),
    [invoices]
  );

  const totalEarned = useMemo(() =>
    invoices
      .filter(i => i.status === "paid")
      .reduce((sum, i) => sum + i.total, 0),
    [invoices]
  );

  return { invoices, settings, setSettings, createInvoice, markAsPaid, totalOutstanding, totalEarned };
}

// Contract Management System
interface Contract {
  id: string;
  title: string;
  type: "service" | "nda" | "consulting" | "research" | "employment" | "partnership";
  parties: ContractParty[];
  terms: ContractTerm[];
  status: "draft" | "pending_signatures" | "active" | "completed" | "terminated" | "expired";
  startDate: Date;
  endDate?: Date;
  value: number;
  currency: string;
  signatures: Signature[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ContractParty {
  id: string;
  name: string;
  email: string;
  role: "client" | "contractor" | "partner" | "witness";
  hasSigned: boolean;
}

interface ContractTerm {
  id: string;
  section: string;
  content: string;
  isNegotiable: boolean;
}

interface Signature {
  partyId: string;
  signedAt: Date;
  ipAddress: string;
  signatureHash: string;
}

export function useContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: "1", title: "Research Collaboration Agreement", type: "research",
      parties: [
        { id: "p1", name: "You", email: "you@email.com", role: "contractor", hasSigned: true },
        { id: "p2", name: "Stanford Research Lab", email: "lab@stanford.edu", role: "client", hasSigned: true },
      ],
      terms: [
        { id: "t1", section: "Scope of Work", content: "Collaborative AI research project...", isNegotiable: false },
        { id: "t2", section: "Compensation", content: "$15,000 over 3 months...", isNegotiable: true },
        { id: "t3", section: "IP Rights", content: "50/50 shared ownership...", isNegotiable: true },
      ],
      status: "active", startDate: new Date("2024-01-01"), endDate: new Date("2024-04-01"),
      value: 15000, currency: "USD",
      signatures: [
        { partyId: "p1", signedAt: new Date("2024-01-01"), ipAddress: "192.168.1.1", signatureHash: "abc123" },
        { partyId: "p2", signedAt: new Date("2024-01-02"), ipAddress: "10.0.0.1", signatureHash: "def456" },
      ],
      attachments: ["sow.pdf", "budget.xlsx"],
      createdAt: new Date("2023-12-15"), updatedAt: new Date("2024-01-02"),
    },
  ]);

  const createContract = useCallback((contract: Omit<Contract, "id" | "createdAt" | "updatedAt" | "signatures">) => {
    const newContract: Contract = {
      ...contract,
      id: crypto.randomUUID(),
      signatures: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setContracts(prev => [newContract, ...prev]);
    return newContract;
  }, []);

  const signContract = useCallback((contractId: string, partyId: string) => {
    setContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c;
      const signature: Signature = {
        partyId,
        signedAt: new Date(),
        ipAddress: "client",
        signatureHash: crypto.randomUUID(),
      };
      const parties = c.parties.map(p =>
        p.id === partyId ? { ...p, hasSigned: true } : p
      );
      const allSigned = parties.every(p => p.hasSigned);
      return {
        ...c,
        parties,
        signatures: [...c.signatures, signature],
        status: allSigned ? "active" : c.status,
        updatedAt: new Date(),
      };
    }));
  }, []);

  return { contracts, createContract, signContract };
}

// Time Tracking System
interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  billable: boolean;
  billed: boolean;
  rate: number;
  tags: string[];
}

interface TimeReport {
  period: "day" | "week" | "month";
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  totalEarnings: number;
  projectBreakdown: { project: string; hours: number; earnings: number }[];
}

export function useTimeTracking() {
  const [entries, setEntries] = useState<TimeEntry[]>([
    {
      id: "1", projectId: "p1", projectName: "AI Research", taskName: "Data Analysis",
      description: "Analyzing dataset for patterns", startTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 60 * 60 * 1000), duration: 120,
      billable: true, billed: false, rate: 125, tags: ["research", "analysis"],
    },
    {
      id: "2", projectId: "p1", projectName: "AI Research", taskName: "Model Development",
      description: "Building ML model", startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      duration: 120, billable: true, billed: false, rate: 150, tags: ["development", "ml"],
    },
  ]);

  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);

  const startTimer = useCallback((projectId: string, projectName: string, description: string, rate: number) => {
    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      projectId, projectName, description,
      startTime: new Date(), duration: 0,
      billable: true, billed: false, rate, tags: [],
    };
    setActiveTimer(entry);
    return entry;
  }, []);

  const stopTimer = useCallback(() => {
    if (!activeTimer) return null;
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - activeTimer.startTime.getTime()) / 60000);
    const completedEntry = { ...activeTimer, endTime, duration };
    setEntries(prev => [completedEntry, ...prev]);
    setActiveTimer(null);
    return completedEntry;
  }, [activeTimer]);

  const report = useMemo<TimeReport>(() => {
    const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
    const billableMinutes = entries.filter(e => e.billable).reduce((sum, e) => sum + e.duration, 0);
    const totalEarnings = entries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration / 60) * e.rate, 0);
    
    const projectMap = new Map<string, { hours: number; earnings: number }>();
    entries.forEach(e => {
      const existing = projectMap.get(e.projectName) || { hours: 0, earnings: 0 };
      projectMap.set(e.projectName, {
        hours: existing.hours + e.duration / 60,
        earnings: existing.earnings + (e.billable ? (e.duration / 60) * e.rate : 0),
      });
    });

    return {
      period: "week",
      totalHours: totalMinutes / 60,
      billableHours: billableMinutes / 60,
      nonBillableHours: (totalMinutes - billableMinutes) / 60,
      totalEarnings,
      projectBreakdown: Array.from(projectMap.entries()).map(([project, data]) => ({ project, ...data })),
    };
  }, [entries]);

  return { entries, activeTimer, startTimer, stopTimer, report };
}

// Proposal Builder
interface Proposal {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";
  sections: ProposalSection[];
  totalValue: number;
  currency: string;
  validUntil: Date;
  createdAt: Date;
  sentAt?: Date;
  viewedAt?: Date;
  respondedAt?: Date;
}

interface ProposalSection {
  id: string;
  type: "cover" | "about" | "scope" | "timeline" | "pricing" | "terms" | "custom";
  title: string;
  content: string;
  order: number;
}

export function useProposalBuilder() {
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: "1", title: "AI Research Partnership Proposal", clientId: "c1", clientName: "TechCorp",
      status: "sent",
      sections: [
        { id: "s1", type: "cover", title: "Executive Summary", content: "Proposal for AI research collaboration...", order: 1 },
        { id: "s2", type: "scope", title: "Scope of Work", content: "Phase 1: Research...\nPhase 2: Development...", order: 2 },
        { id: "s3", type: "pricing", title: "Investment", content: "Total: $25,000\nPhase 1: $10,000\nPhase 2: $15,000", order: 3 },
      ],
      totalValue: 25000, currency: "USD",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(), sentAt: new Date(),
    },
  ]);

  const createProposal = useCallback((proposal: Omit<Proposal, "id" | "createdAt" | "status">) => {
    const newProposal: Proposal = {
      ...proposal,
      id: crypto.randomUUID(),
      status: "draft",
      createdAt: new Date(),
    };
    setProposals(prev => [newProposal, ...prev]);
    return newProposal;
  }, []);

  const sendProposal = useCallback((proposalId: string) => {
    setProposals(prev => prev.map(p =>
      p.id === proposalId ? { ...p, status: "sent", sentAt: new Date() } : p
    ));
  }, []);

  return { proposals, createProposal, sendProposal };
}

// Expense Tracking
interface Expense {
  id: string;
  projectId?: string;
  projectName?: string;
  category: "travel" | "software" | "equipment" | "services" | "other";
  description: string;
  amount: number;
  currency: string;
  date: Date;
  receipt?: string;
  reimbursable: boolean;
  reimbursed: boolean;
  status: "pending" | "approved" | "rejected";
  tags: string[];
}

export function useExpenseTracking() {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: "1", projectId: "p1", projectName: "AI Research",
      category: "software", description: "Cloud computing credits",
      amount: 250, currency: "USD", date: new Date(),
      reimbursable: true, reimbursed: false, status: "approved", tags: ["aws", "compute"],
    },
    {
      id: "2", projectId: "p1", projectName: "AI Research",
      category: "travel", description: "Conference attendance",
      amount: 800, currency: "USD", date: new Date(),
      reimbursable: true, reimbursed: false, status: "pending", tags: ["conference", "networking"],
    },
  ]);

  const addExpense = useCallback((expense: Omit<Expense, "id" | "status">) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      status: "pending",
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  }, []);

  const totalExpenses = useMemo(() =>
    expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const pendingReimbursement = useMemo(() =>
    expenses
      .filter(e => e.reimbursable && !e.reimbursed && e.status === "approved")
      .reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  return { expenses, addExpense, totalExpenses, pendingReimbursement };
}
