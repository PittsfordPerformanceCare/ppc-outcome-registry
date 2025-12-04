import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardPlus, Activity } from "lucide-react";

interface DashboardHeroProps {
  onNeuroExamClick: () => void;
}

export function DashboardHero({ onNeuroExamClick }: DashboardHeroProps) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
      <h1 className="mb-2 text-3xl font-bold text-primary">Welcome to PPC Outcome Registry</h1>
      <p className="text-lg text-muted-foreground">
        Track patient progress and clinical outcomes with evidence-based MCID calculations
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link to="/patient-intake" className="group inline-block">
          <Button 
            size="lg" 
            className="gap-3 relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary hover:from-primary hover:via-primary/80 hover:to-primary/90 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in px-8 py-7 text-lg font-bold border-2 border-primary/20 hover:border-primary/40"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <ClipboardPlus className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative">Create New Patient</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
          </Button>
        </Link>
        
        <Button 
          size="lg"
          onClick={onNeuroExamClick}
          variant="outline"
          className="gap-3 relative overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in px-8 py-7 text-lg font-bold border-2 hover:bg-primary/5"
        >
          <Activity className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="relative">Neuro Exam</span>
        </Button>
      </div>
    </div>
  );
}