import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface TraumaHistoryItem {
  body_part: string;
  frequency: "Single event" | "Multiple events";
  severity: "Mild" | "Moderate" | "Severe";
}

interface TraumaHistoryCardProps {
  hasTraumaHistory: "No" | "Yes" | "Not sure" | null | undefined;
  traumaHistoryItems: TraumaHistoryItem[] | null | undefined;
}

export function TraumaHistoryCard({ hasTraumaHistory, traumaHistoryItems }: TraumaHistoryCardProps) {
  // Don't render if no trauma data at all
  if (!hasTraumaHistory) {
    return null;
  }

  const renderContent = () => {
    // Case A: No trauma history
    if (hasTraumaHistory === "No") {
      return (
        <p className="text-sm text-muted-foreground">
          Trauma History: None reported
        </p>
      );
    }

    // Case B: Yes or Not sure
    if (hasTraumaHistory === "Yes" || hasTraumaHistory === "Not sure") {
      // No items specified
      if (!traumaHistoryItems || traumaHistoryItems.length === 0) {
        return (
          <p className="text-sm text-muted-foreground">
            Trauma History: Reported, details not specified
          </p>
        );
      }

      // Items exist - render list
      return (
        <div className="space-y-2">
          {traumaHistoryItems.map((item, index) => (
            <div 
              key={index} 
              className="text-sm text-foreground py-1.5 border-b border-border/50 last:border-b-0"
            >
              {item.body_part} — {item.frequency === "Single event" ? "Single event" : "Multiple events"} · {item.severity}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">Trauma History</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
