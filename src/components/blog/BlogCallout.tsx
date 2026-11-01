import * as React from "react";
import { Info, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BlogCalloutProps {
  variant?: "default" | "info" | "warning" | "success";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BlogCallout({
  variant = "default",
  title,
  children,
  className,
}: BlogCalloutProps) {
  const getIcon = () => {
    switch (variant) {
      case "info":
        return <Info className="w-4 h-4 text-foreground shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-foreground shrink-0 mt-0.5" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-foreground shrink-0 mt-0.5" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />;
    }
  };

  return (
    <div
      className={cn(
        "my-6 rounded-lg border border-border bg-muted/30 p-4 sm:p-5 text-xs sm:text-sm text-foreground space-y-2",
        className
      )}
    >
      <div className="flex items-start gap-2.5">
        {getIcon()}
        <div className="space-y-1.5 flex-1 min-w-0">
          {title && (
            <h4 className="font-semibold text-foreground text-sm tracking-tight">
              {title}
            </h4>
          )}
          <div className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogCallout;

