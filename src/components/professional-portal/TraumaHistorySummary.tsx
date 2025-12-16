interface TraumaHistoryItem {
  body_part: string;
  frequency: "Single event" | "Multiple events";
  severity: "Mild" | "Moderate" | "Severe";
}

interface TraumaHistorySummaryProps {
  hasTraumaHistory: "No" | "Yes" | "Not sure" | null | undefined;
  traumaHistoryItems: TraumaHistoryItem[] | null | undefined;
}

/**
 * Generates a natural-language clinical summary of trauma history
 * for referring providers and care partners
 */
function generateTraumaSummary(items: TraumaHistoryItem[]): string {
  if (!items || items.length === 0) return "";

  const descriptions = items.map((item) => {
    const frequencyText = item.frequency === "Single event" 
      ? "prior single" 
      : "history of multiple";
    
    // Convert body part to lowercase clinical phrasing
    const bodyPartLower = item.body_part.toLowerCase();
    
    // Handle special cases
    if (bodyPartLower === "concussion") {
      return `${frequencyText} concussive event${item.frequency === "Multiple events" ? "s" : ""} (${item.severity.toLowerCase()} severity)`;
    }
    
    // For injury/surgery items
    const cleanBodyPart = bodyPartLower.replace(" injury or surgery", "");
    return `${frequencyText} ${item.severity.toLowerCase()} ${cleanBodyPart} injury/surgery`;
  });

  // Join descriptions naturally
  if (descriptions.length === 1) {
    return `History of ${descriptions[0]}.`;
  }
  
  if (descriptions.length === 2) {
    return `History of ${descriptions[0]} and ${descriptions[1]}.`;
  }
  
  const lastItem = descriptions.pop();
  return `History of ${descriptions.join(", ")}, and ${lastItem}.`;
}

export function TraumaHistorySummary({ hasTraumaHistory, traumaHistoryItems }: TraumaHistorySummaryProps) {
  // Don't render if no trauma data at all
  if (!hasTraumaHistory) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">
        Relevant Trauma History
      </h3>
      <div className="text-sm text-slate-700 leading-relaxed">
        {hasTraumaHistory === "No" && (
          <p>None reported</p>
        )}
        
        {hasTraumaHistory === "Not sure" && (!traumaHistoryItems || traumaHistoryItems.length === 0) && (
          <p>Patient reports possible prior injuries; details may be incomplete.</p>
        )}
        
        {hasTraumaHistory === "Yes" && (!traumaHistoryItems || traumaHistoryItems.length === 0) && (
          <p>Patient reports prior injuries; specific details not documented.</p>
        )}
        
        {(hasTraumaHistory === "Yes" || hasTraumaHistory === "Not sure") && 
          traumaHistoryItems && 
          traumaHistoryItems.length > 0 && (
          <p>
            {hasTraumaHistory === "Not sure" && "Patient reports possible prior injuries. "}
            {generateTraumaSummary(traumaHistoryItems)}
          </p>
        )}
      </div>
    </div>
  );
}
