import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  const completedCount = completedSteps.size;
  
  return (
    <div className="w-full py-4">
      {/* Mobile: Enhanced compact step indicator */}
      <div className="block md:hidden space-y-3">
        {/* Progress header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {currentStep + 1}
            </span>
            <span className="text-sm font-medium text-foreground">
              of {steps.length}
            </span>
          </div>
          <span className="text-sm font-medium text-primary">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        
        {/* Animated progress bar */}
        <div className="relative">
          <Progress 
            value={progressPercentage} 
            className="h-2.5 bg-muted"
          />
          {/* Step markers on progress bar */}
          <div className="absolute inset-0 flex justify-between items-center px-0.5">
            {steps.map((_, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              const position = ((index) / (steps.length - 1)) * 100;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    isCompleted ? "bg-primary-foreground scale-100" : 
                    isCurrent ? "bg-primary-foreground/80 scale-110 animate-pulse" : 
                    "bg-muted-foreground/30 scale-75"
                  )}
                  style={{ 
                    position: 'absolute',
                    left: `${position}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              );
            })}
          </div>
        </div>
        
        {/* Current step info */}
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
          <p className="text-sm font-semibold text-foreground">{steps[currentStep].title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{steps[currentStep].description}</p>
        </div>
        
        {/* Step dots indicator */}
        <div className="flex justify-center gap-1.5">
          {steps.map((_, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            
            return (
              <div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  isCurrent ? "w-6 bg-primary" : 
                  isCompleted ? "w-2 bg-primary/60" : 
                  "w-2 bg-muted-foreground/30"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop: Full step indicator */}
      <div className="hidden md:block">
        {/* Top progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStep;

              return (
                <li key={step.id} className="relative flex-1">
                  {index !== 0 && (
                    <div
                      className={cn(
                        "absolute left-0 top-4 -ml-px h-0.5 w-full transition-colors duration-300",
                        isCompleted || isCurrent ? "bg-primary" : "bg-muted"
                      )}
                      style={{ transform: "translateX(-50%)" }}
                    />
                  )}
                  <div className="group relative flex flex-col items-center">
                    <span className="flex h-9 w-9 items-center justify-center">
                      {isCompleted ? (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-md transition-transform duration-200 hover:scale-110">
                          <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                        </span>
                      ) : isCurrent ? (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background shadow-md ring-4 ring-primary/20 animate-pulse">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background transition-colors duration-200 group-hover:border-muted-foreground">
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        </span>
                      )}
                    </span>
                    <span className="mt-2 text-center">
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors duration-200",
                          isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                      <span
                        className={cn(
                          "mt-1 block text-xs transition-colors duration-200",
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
