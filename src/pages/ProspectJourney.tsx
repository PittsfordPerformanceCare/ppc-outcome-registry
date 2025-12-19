import { ProspectJourneyTracker } from "@/components/lead-dashboard";
import { Button } from "@/components/ui/button";
import { RefreshCw, Route } from "lucide-react";
import { useState } from "react";

export default function ProspectJourney() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Route className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Prospect Journey
            </h1>
            <p className="text-muted-foreground">
              Track patients through intake stages
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Prospect Journey Tracker */}
      <ProspectJourneyTracker key={refreshKey} className="border-2 border-primary/30 shadow-sm" />
    </div>
  );
}
