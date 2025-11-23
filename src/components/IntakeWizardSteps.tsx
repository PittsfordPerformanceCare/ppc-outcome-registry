import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface IntakeWizardStepsProps {
  steps: Step[];
  currentStep: number;
  completedSteps: Set<number>;
}

export function IntakeWizardSteps({ steps, currentStep, completedSteps }: IntakeWizardStepsProps) {
  return (
    <div className="w-full py-6">
      {/* Mobile: Compact step indicator */}
      <div className="block md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-xs text-muted-foreground">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <p className="text-sm font-medium mt-2">{steps[currentStep].title}</p>
        <p className="text-xs text-muted-foreground">{steps[currentStep].description}</p>
      </div>

      {/* Desktop: Full step indicator */}
      <div className="hidden md:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStep;
              const isUpcoming = index > currentStep;

              return (
                <li key={step.id} className="relative flex-1">
                  {index !== 0 && (
                    <div
                      className={cn(
                        "absolute left-0 top-4 -ml-px h-0.5 w-full",
                        isCompleted || isCurrent ? "bg-primary" : "bg-muted"
                      )}
                      style={{ transform: "translateX(-50%)" }}
                    />
                  )}
                  <div className="group relative flex flex-col items-center">
                    <span className="flex h-9 w-9 items-center justify-center">
                      {isCompleted ? (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                          <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                        </span>
                      ) : isCurrent ? (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background">
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        </span>
                      )}
                    </span>
                    <span className="mt-2 text-center">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      <span
                        className={cn(
                          "mt-1 block text-xs",
                          isCurrent ? "text-primary/80" : "text-muted-foreground"
                        )}
                      >
                        {step.description}
                      </span>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
