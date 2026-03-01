import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Sanitize stack trace — remove file paths and internal details.
 */
function sanitizeStack(stack?: string): string {
  if (!stack) return "";
  return stack
    .split("\n")
    .slice(0, 5)
    .map((line) => line.replace(/https?:\/\/[^\s]+/g, "[url]"))
    .join("\n");
}

/**
 * Log error to frontend_error_logs table (fire-and-forget).
 */
async function logErrorToDb(error: Error, componentStack?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await (supabase as any).from("frontend_error_logs").insert({
      user_id: user?.id || null,
      route: window.location.pathname,
      error_message: error.message?.slice(0, 500) || "Unknown error",
      stack_trace: sanitizeStack(error.stack),
      component_stack: componentStack?.slice(0, 1000) || null,
    });
  } catch {
    // Silent — logging must never crash the app
  }
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    logErrorToDb(error, errorInfo.componentStack || undefined);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-foreground">An error has occurred</h1>
              <p className="text-muted-foreground text-sm">
                The system encountered an unexpected issue. Refreshing the page typically resolves this.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-xs text-left bg-muted p-3 rounded-lg overflow-auto max-h-32 text-muted-foreground">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
              <Button onClick={this.handleReload} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
