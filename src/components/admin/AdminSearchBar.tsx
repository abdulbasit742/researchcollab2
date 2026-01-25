import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import {
  Search,
  Users,
  Package,
  Briefcase,
  FileText,
  Building2,
  UserCheck,
  Settings,
  BarChart3,
  History,
  CreditCard,
  Headphones,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  type: "user" | "tool" | "project" | "organization" | "report";
  title: string;
  subtitle?: string;
}

export function AdminSearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const searchTerm = `%${searchQuery}%`;

      // Search in parallel
      const [usersRes, toolsRes, projectsRes, orgsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, first_name, last_name, role")
          .or(`full_name.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from("tools")
          .select("id, name, category")
          .ilike("name", searchTerm)
          .limit(5),
        supabase
          .from("earning_projects")
          .select("id, title, status")
          .ilike("title", searchTerm)
          .limit(5),
        supabase
          .from("organizations")
          .select("id, name, type")
          .ilike("name", searchTerm)
          .limit(5),
      ]);

      const searchResults: SearchResult[] = [];

      // Users
      usersRes.data?.forEach((user) => {
        searchResults.push({
          id: user.id,
          type: "user",
          title: user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Unknown",
          subtitle: user.role || "User",
        });
      });

      // Tools
      toolsRes.data?.forEach((tool) => {
        searchResults.push({
          id: tool.id,
          type: "tool",
          title: tool.name,
          subtitle: tool.category,
        });
      });

      // Projects
      projectsRes.data?.forEach((project) => {
        searchResults.push({
          id: project.id,
          type: "project",
          title: project.title,
          subtitle: project.status,
        });
      });

      // Organizations
      orgsRes.data?.forEach((org) => {
        searchResults.push({
          id: org.id,
          type: "organization",
          title: org.name,
          subtitle: org.type,
        });
      });

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, search]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");

    switch (result.type) {
      case "user":
        navigate(`/admin/users?search=${encodeURIComponent(result.title)}`);
        break;
      case "tool":
        navigate(`/admin/tools?search=${encodeURIComponent(result.title)}`);
        break;
      case "project":
        navigate(`/admin/projects?search=${encodeURIComponent(result.title)}`);
        break;
      case "organization":
        navigate(`/admin/enterprise?search=${encodeURIComponent(result.title)}`);
        break;
      default:
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="h-4 w-4" />;
      case "tool":
        return <Package className="h-4 w-4" />;
      case "project":
        return <Briefcase className="h-4 w-4" />;
      case "organization":
        return <Building2 className="h-4 w-4" />;
      case "report":
        return <FileText className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const quickLinks = [
    { label: "Users", icon: Users, href: "/admin/users" },
    { label: "Tools", icon: Package, href: "/admin/tools" },
    { label: "Projects", icon: Briefcase, href: "/admin/projects" },
    { label: "Finance", icon: CreditCard, href: "/admin/finance" },
    { label: "Verifications", icon: UserCheck, href: "/admin/verifications" },
    { label: "Reports", icon: FileText, href: "/admin/reports" },
    { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    { label: "Activity Log", icon: History, href: "/admin/audit-log" },
    { label: "Support", icon: Headphones, href: "/admin/support" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search users, tools, projects, organizations..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching..." : "No results found."}
          </CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading="Search Results">
              {results.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  value={`${result.type}-${result.title}`}
                  onSelect={() => handleSelect(result)}
                  className="cursor-pointer"
                >
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md border bg-background">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex flex-col">
                    <span>{result.title}</span>
                    {result.subtitle && (
                      <span className="text-xs text-muted-foreground capitalize">
                        {result.type} • {result.subtitle}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!query && (
            <CommandGroup heading="Quick Links">
              {quickLinks.map((link) => (
                <CommandItem
                  key={link.href}
                  value={link.label}
                  onSelect={() => {
                    setOpen(false);
                    navigate(link.href);
                  }}
                  className="cursor-pointer"
                >
                  <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-md border bg-background">
                    <link.icon className="h-4 w-4" />
                  </div>
                  {link.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
