export type OrderWorkroomStatus = "active" | "waiting" | "review" | "complete";
export type OrderMessageRole = "buyer" | "seller" | "system";
export type OrderWorkroomItemStatus = "done" | "open" | "blocked" | "review";

export type OrderWorkroomMessage = {
  id: string;
  role: OrderMessageRole;
  author: string;
  timeLabel: string;
  message: string;
};

export type OrderWorkroomMilestone = {
  id: string;
  title: string;
  status: OrderWorkroomItemStatus;
  dueLabel: string;
  summary: string;
};

export type OrderWorkroomFile = {
  id: string;
  name: string;
  typeLabel: string;
  status: OrderWorkroomItemStatus;
  owner: string;
};

export type OrderWorkroom = {
  id: string;
  orderTitle: string;
  buyerName: string;
  sellerName: string;
  status: OrderWorkroomStatus;
  packageLabel: string;
  progress: number;
  nextAction: string;
  messages: OrderWorkroomMessage[];
  milestones: OrderWorkroomMilestone[];
  files: OrderWorkroomFile[];
  actionChecklist: string[];
};

export const DEMO_ORDER_WORKROOM: OrderWorkroom = {
  id: "workroom-proposal-review",
  orderTitle: "FYP Proposal Review and Improvement",
  buyerName: "Student Research Team",
  sellerName: "Dr. Amina Research Studio",
  status: "active",
  packageLabel: "Standard · PKR 8,000 demo · 5 days",
  progress: 46,
  nextAction: "Buyer should confirm university format and accept academic integrity note before seller starts final review.",
  messages: [
    {
      id: "msg-system-created",
      role: "system",
      author: "System",
      timeLabel: "Today, 13:25",
      message: "Demo workroom created after checkout preview. Real order creation is still locked.",
    },
    {
      id: "msg-buyer-files",
      role: "buyer",
      author: "Student Research Team",
      timeLabel: "Today, 13:35",
      message: "Proposal draft and topic notes are ready. University format file still needs confirmation.",
    },
    {
      id: "msg-seller-scope",
      role: "seller",
      author: "Dr. Amina Research Studio",
      timeLabel: "Today, 13:50",
      message: "I will review problem clarity, scope boundary, research gap notes, and methodology alignment after requirements are complete.",
    },
  ],
  milestones: [
    {
      id: "milestone-requirements",
      title: "Requirements Confirmation",
      status: "review",
      dueLabel: "Day 1",
      summary: "Confirm proposal file, topic, format, and project scope before review begins.",
    },
    {
      id: "milestone-first-review",
      title: "First Review Notes",
      status: "open",
      dueLabel: "Day 3",
      summary: "Seller prepares structured comments on proposal quality and missing sections.",
    },
    {
      id: "milestone-final-summary",
      title: "Final Improvement Summary",
      status: "blocked",
      dueLabel: "Day 5",
      summary: "Final readiness notes are blocked until first review and buyer confirmation are complete.",
    },
  ],
  files: [
    { id: "file-proposal", name: "FYP_Proposal_Draft.docx", typeLabel: "Proposal draft", status: "done", owner: "Buyer" },
    { id: "file-topic", name: "Research_Topic_Notes.pdf", typeLabel: "Topic notes", status: "done", owner: "Buyer" },
    { id: "file-format", name: "University_Format_Template", typeLabel: "Format guide", status: "review", owner: "Buyer" },
    { id: "file-summary", name: "Improvement_Summary", typeLabel: "Seller deliverable", status: "blocked", owner: "Seller" },
  ],
  actionChecklist: [
    "Confirm buyer requirements",
    "Keep all communication inside workroom",
    "Avoid off-platform payment or delivery claims",
    "Attach files before review starts",
    "Lock final delivery until demo policy checks pass",
  ],
};

export function getOrderWorkroomStatusLabel(status: OrderWorkroomStatus): string {
  if (status === "complete") return "Complete";
  if (status === "review") return "In Review";
  if (status === "waiting") return "Waiting";
  return "Active";
}

export function getOrderWorkroomStatusClass(status: OrderWorkroomStatus): string {
  if (status === "complete") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  if (status === "waiting") return "bg-blue-500/10 text-blue-600 border-blue-500/30";
  return "bg-primary/10 text-primary border-primary/30";
}

export function getOrderWorkroomItemStatusLabel(status: OrderWorkroomItemStatus): string {
  if (status === "done") return "Done";
  if (status === "blocked") return "Blocked";
  if (status === "review") return "Review";
  return "Open";
}

export function getOrderWorkroomItemStatusClass(status: OrderWorkroomItemStatus): string {
  if (status === "done") return "bg-green-500/10 text-green-600 border-green-500/30";
  if (status === "blocked") return "bg-red-500/10 text-red-600 border-red-500/30";
  if (status === "review") return "bg-amber-500/10 text-amber-600 border-amber-500/30";
  return "bg-blue-500/10 text-blue-600 border-blue-500/30";
}

export function getOrderWorkroomCounts(workroom: OrderWorkroom = DEMO_ORDER_WORKROOM) {
  return {
    messages: workroom.messages.length,
    milestones: workroom.milestones.length,
    openMilestones: workroom.milestones.filter((milestone) => milestone.status !== "done").length,
    files: workroom.files.length,
    blocked: [...workroom.milestones, ...workroom.files].filter((item) => item.status === "blocked").length,
  };
}
