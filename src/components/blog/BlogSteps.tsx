import * as React from "react";
import { cn } from "@/lib/utils";

export interface BlogStepItem {
  number?: number;
  title: string;
  description: React.ReactNode;
  tip?: React.ReactNode;
}

export interface BlogStepsProps {
  steps: BlogStepItem[];
  className?: string;
}

export function BlogSteps({ steps, className }: BlogStepsProps) {
  return (
    <div className={cn("my-6 space-y-4", className)}>
      {steps.map((step, index) => {
        const stepNum = step.number ?? index + 1;
        return (
          <div
            key={stepNum}
            className="flex items-start gap-3.5 rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground border border-border/80">
              {stepNum}
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                {step.title}
              </h3>
              <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </div>
              {step.tip && (
                <div className="mt-2 rounded border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Tips: </span>
                  {step.tip}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BlogSteps;

