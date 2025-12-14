import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ppc_clinical_outcomes_welcome_seen";

interface ClinicalOutcomesWelcomeProps {
  onContinue?: () => void;
}

export function ClinicalOutcomesWelcome({ onContinue }: ClinicalOutcomesWelcomeProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(STORAGE_KEY);
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  const handleContinue = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
    onContinue?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            Clinical Outcomes Review
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <p>
            This Clinical Outcomes Review is provided to support coordinated care for shared patients. It offers a concise, longitudinal view of patient progress, clinical trajectory, and readiness indicators across the current episode of care.
          </p>
          
          <p>
            Information presented reflects validated outcome measures tracked over time and is intended to support informed clinical decision making. This review summarizes observed progress and does not replace independent clinical judgment.
          </p>
          
          <p className="text-slate-500 text-xs">
            Access to this review is provided automatically for shared patients as part of Pittsford Performance Care's collaborative care model.
          </p>
        </div>

        <div className="mt-4">
          <Button
            onClick={handleContinue}
            className="w-full bg-slate-900 text-white hover:bg-slate-800"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
