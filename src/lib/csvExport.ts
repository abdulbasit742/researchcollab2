export interface CSVColumn {
  key: string;
  header: string;
  formatter?: (value: any, row: any) => string;
}

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: CSVColumn[]
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create header row
  const headers = columns.map((col) => escapeCSVValue(col.header));

  // Create data rows
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = getNestedValue(row, col.key);
      const formattedValue = col.formatter ? col.formatter(value, row) : value;
      return escapeCSVValue(formattedValue);
    })
  );

  // Combine headers and rows
  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Check if value needs to be escaped
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r")
  ) {
    // Escape double quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

// Pre-defined column configurations for common exports
export const userColumns: CSVColumn[] = [
  { key: "id", header: "User ID" },
  { key: "full_name", header: "Full Name" },
  { key: "first_name", header: "First Name" },
  { key: "last_name", header: "Last Name" },
  { key: "role", header: "Profile Role" },
  { key: "user_role", header: "System Role" },
  { key: "university", header: "University" },
  { key: "department", header: "Department" },
  { key: "location", header: "Location" },
  { 
    key: "created_at", 
    header: "Created At",
    formatter: (value) => value ? new Date(value).toLocaleDateString() : ""
  },
  { 
    key: "onboarding_completed", 
    header: "Onboarding Completed",
    formatter: (value) => value ? "Yes" : "No"
  },
  {
    key: "is_blocked",
    header: "Blocked",
    formatter: (value) => value ? "Yes" : "No"
  }
];

export const transactionColumns: CSVColumn[] = [
  { key: "id", header: "Order ID" },
  { key: "user_name", header: "User" },
  { key: "tool_name", header: "Tool" },
  { key: "plan_name", header: "Plan" },
  { key: "amount", header: "Amount" },
  { key: "currency", header: "Currency" },
  { key: "status", header: "Status" },
  { key: "payment_method", header: "Payment Method" },
  { 
    key: "created_at", 
    header: "Date",
    formatter: (value) => value ? new Date(value).toLocaleDateString() : ""
  }
];

export const reportColumns: CSVColumn[] = [
  { key: "id", header: "Report ID" },
  { key: "reporter_name", header: "Reporter" },
  { key: "reported_user_name", header: "Reported User" },
  { key: "reason", header: "Reason" },
  { key: "description", header: "Description" },
  { key: "status", header: "Status" },
  { 
    key: "created_at", 
    header: "Created At",
    formatter: (value) => value ? new Date(value).toLocaleDateString() : ""
  },
  { 
    key: "resolved_at", 
    header: "Resolved At",
    formatter: (value) => value ? new Date(value).toLocaleDateString() : ""
  }
];

export const verificationColumns: CSVColumn[] = [
  { key: "id", header: "Submission ID" },
  { key: "user_name", header: "User" },
  { key: "verification_type", header: "Type" },
  { key: "status", header: "Status" },
  { 
    key: "created_at", 
    header: "Submitted At",
    formatter: (value) => value ? new Date(value).toLocaleDateString() : ""
  },
  { 
    key: "reviewed_at", 
    header: "Reviewed At",
    formatter: (value) => value ? new Date(value).toLocaleDateString() : ""
  },
  { key: "reviewer_notes", header: "Reviewer Notes" }
];

export const auditLogColumns: CSVColumn[] = [
  { key: "id", header: "Log ID" },
  { key: "admin_name", header: "Admin" },
  { key: "action", header: "Action" },
  { key: "entity_type", header: "Entity Type" },
  { key: "entity_id", header: "Entity ID" },
  { 
    key: "details", 
    header: "Details",
    formatter: (value) => value ? JSON.stringify(value) : ""
  },
  { 
    key: "created_at", 
    header: "Timestamp",
    formatter: (value) => value ? new Date(value).toLocaleString() : ""
  }
];
