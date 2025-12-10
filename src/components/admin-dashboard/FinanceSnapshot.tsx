import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface FinanceStats {
  dischargesToday: number;
  dischargesThisWeek: number;
}

interface FinanceSnapshotProps {
  stats: FinanceStats;
  loading: boolean;
}

export function FinanceSnapshot({ stats, loading }: FinanceSnapshotProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          Finance / Discharge Snapshot
        </h2>
        <p className="text-sm text-muted-foreground">Discharge activity for billing workflows</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/admin-shell/episodes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{loading ? "—" : stats.dischargesToday}</p>
                  <p className="text-sm font-medium">Discharges Today</p>
                  <p className="text-xs text-muted-foreground">For billing processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin-shell/episodes">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="pt-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{loading ? "—" : stats.dischargesThisWeek}</p>
                  <p className="text-sm font-medium">Discharges This Week</p>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
