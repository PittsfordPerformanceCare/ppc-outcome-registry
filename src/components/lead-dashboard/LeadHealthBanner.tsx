import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Inbox, Activity } from "lucide-react";
import { Link } from "react-router-dom";

interface LeadHealthBannerProps {
  newLast24Hours: number;
  newLast24HoursPrior: number;
  inMotion: number;
  loading: boolean;
}

export function LeadHealthBanner({ 
  newLast24Hours, 
  newLast24HoursPrior, 
  inMotion,
  loading 
}: LeadHealthBannerProps) {
  const trend = newLast24Hours - newLast24HoursPrior;
  
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "text-muted-foreground";
  const trendText = trend > 0 ? `+${trend}` : trend < 0 ? `${trend}` : "0";

  return (
    <div className="grid grid-cols-2 gap-4">
      <Link to="/intake-review?status=SUBMITTED" className="block">
        <Card className="h-full hover:shadow-md transition-shadow border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  New Care Requests
                </p>
                <p className="text-xs text-muted-foreground">Last 24 Hours</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Inbox className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-4xl font-bold tracking-tight">
                {loading ? "—" : newLast24Hours}
              </span>
              {!loading && (
                <div className={`flex items-center gap-1 pb-1 ${trendColor}`}>
                  <TrendIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{trendText} vs prior day</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link to="/intake-review?status=IN_MOTION" className="block">
        <Card className="h-full hover:shadow-md transition-shadow border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Care Requests In Motion
                </p>
                <p className="text-xs text-muted-foreground">Approved · Clarification · Assignment</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-bold tracking-tight">
                {loading ? "—" : inMotion}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
