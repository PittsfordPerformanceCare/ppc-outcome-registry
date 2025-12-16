import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Body part options
const BODY_PART_OPTIONS = [
  "Concussion",
  "Head Injury or Surgery",
  "Neck Injury or Surgery",
  "Shoulder Injury or Surgery",
  "Thoracic Spine Injury or Surgery",
  "Low Spine Injury or Surgery",
  "Hip Injury or Surgery",
  "Knee Injury or Surgery",
  "Ankle/foot Injury or Surgery",
] as const;

const FREQUENCY_OPTIONS = ["Single event", "Multiple events"] as const;
const SEVERITY_OPTIONS = ["Mild", "Moderate", "Severe"] as const;
const HAS_TRAUMA_OPTIONS = ["No", "Yes", "Not sure"] as const;

export type TraumaHistoryItem = {
  body_part: string;
  frequency: "Single event" | "Multiple events" | "";
  severity: "Mild" | "Moderate" | "Severe" | "";
};

export type HasTraumaHistory = "No" | "Yes" | "Not sure" | "";

interface TraumaHistorySectionProps {
  hasTraumaHistory: HasTraumaHistory;
  traumaHistoryItems: TraumaHistoryItem[];
  onHasTraumaHistoryChange: (value: HasTraumaHistory) => void;
  onTraumaHistoryItemsChange: (items: TraumaHistoryItem[]) => void;
}

export function TraumaHistorySection({
  hasTraumaHistory,
  traumaHistoryItems,
  onHasTraumaHistoryChange,
  onTraumaHistoryItemsChange,
}: TraumaHistorySectionProps) {
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("");

  // Get available body parts (exclude already added ones)
  const availableBodyParts = useMemo(() => {
    const addedParts = new Set(traumaHistoryItems.map((item) => item.body_part));
    return BODY_PART_OPTIONS.filter((part) => !addedParts.has(part));
  }, [traumaHistoryItems]);

  const handleAddBodyPart = () => {
    if (!selectedBodyPart) return;

    const newItem: TraumaHistoryItem = {
      body_part: selectedBodyPart,
      frequency: "",
      severity: "",
    };

    onTraumaHistoryItemsChange([...traumaHistoryItems, newItem]);
    setSelectedBodyPart("");
  };

  const handleRemoveItem = (index: number) => {
    const updated = traumaHistoryItems.filter((_, i) => i !== index);
    onTraumaHistoryItemsChange(updated);
  };

  const handleUpdateItem = (
    index: number,
    field: "frequency" | "severity",
    value: string
  ) => {
    const updated = traumaHistoryItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onTraumaHistoryItemsChange(updated);
  };

  const showItemsSection = hasTraumaHistory === "Yes" || hasTraumaHistory === "Not sure";
  const showValidationPrompt =
    showItemsSection && traumaHistoryItems.length === 0;

  return (
    <Card className="p-4 bg-slate-50/50 border border-slate-200">
      <div className="space-y-4">
        {/* Section Header */}
        <div>
          <h3 className="font-medium text-slate-900">Trauma History</h3>
          <p className="text-sm text-muted-foreground">
            Help us understand your injury and surgery history
          </p>
        </div>

        {/* Gate Question */}
        <div className="space-y-2">
          <Label htmlFor="has_trauma_history">
            Any significant past injuries or surgeries?
          </Label>
          <Select
            value={hasTraumaHistory}
            onValueChange={(value) => {
              onHasTraumaHistoryChange(value as HasTraumaHistory);
              // Clear items if selecting "No"
              if (value === "No") {
                onTraumaHistoryItemsChange([]);
              }
            }}
          >
            <SelectTrigger id="has_trauma_history" className="w-full bg-white">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              {HAS_TRAUMA_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Part Selector (only if Yes or Not sure) */}
        {showItemsSection && (
          <div className="space-y-4 pt-2">
            {/* Add Body Part Control */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="add_body_part" className="sr-only">
                  Add an area
                </Label>
                <Select
                  value={selectedBodyPart}
                  onValueChange={setSelectedBodyPart}
                >
                  <SelectTrigger id="add_body_part" className="w-full bg-white">
                    <SelectValue placeholder="Add an area" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {availableBodyParts.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        All areas added
                      </div>
                    ) : (
                      availableBodyParts.map((part) => (
                        <SelectItem key={part} value={part}>
                          {part}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                onClick={handleAddBodyPart}
                disabled={!selectedBodyPart}
                size="default"
                className="shrink-0"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Validation Prompt */}
            {showValidationPrompt && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Please add at least one area, or select "No" above.
                </span>
              </div>
            )}

            {/* Added Items List */}
            {traumaHistoryItems.length > 0 && (
              <div className="space-y-3">
                {traumaHistoryItems.map((item, index) => (
                  <div
                    key={`${item.body_part}-${index}`}
                    className="p-3 bg-white rounded-lg border border-slate-200 space-y-3"
                  >
                    {/* Row Header */}
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        {item.body_part}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>

                    {/* Dropdowns Row */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Events Dropdown */}
                      <div className="space-y-1">
                        <Label
                          htmlFor={`frequency-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          Events *
                        </Label>
                        <Select
                          value={item.frequency}
                          onValueChange={(value) =>
                            handleUpdateItem(index, "frequency", value)
                          }
                        >
                          <SelectTrigger
                            id={`frequency-${index}`}
                            className={cn(
                              "bg-white",
                              !item.frequency && "text-muted-foreground"
                            )}
                          >
                            <SelectValue placeholder="Select events" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            {FREQUENCY_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Severity Dropdown */}
                      <div className="space-y-1">
                        <Label
                          htmlFor={`severity-${index}`}
                          className="text-xs text-muted-foreground"
                        >
                          Severity *
                        </Label>
                        <Select
                          value={item.severity}
                          onValueChange={(value) =>
                            handleUpdateItem(index, "severity", value)
                          }
                        >
                          <SelectTrigger
                            id={`severity-${index}`}
                            className={cn(
                              "bg-white",
                              !item.severity && "text-muted-foreground"
                            )}
                          >
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent className="bg-white z-50">
                            {SEVERITY_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Helper to validate trauma history before submission
export function validateTraumaHistory(
  hasTraumaHistory: HasTraumaHistory,
  items: TraumaHistoryItem[]
): { valid: boolean; message?: string } {
  if (hasTraumaHistory === "Yes" || hasTraumaHistory === "Not sure") {
    if (items.length === 0) {
      return {
        valid: false,
        message: "Please add at least one trauma history item, or select 'No'",
      };
    }
    for (const item of items) {
      if (!item.frequency || !item.severity) {
        return {
          valid: false,
          message: `Please complete all fields for ${item.body_part}`,
        };
      }
    }
  }
  return { valid: true };
}

// Format trauma history for display in summaries
export function formatTraumaHistorySummary(
  hasTraumaHistory: HasTraumaHistory,
  items: TraumaHistoryItem[]
): string {
  if (hasTraumaHistory === "No" || !hasTraumaHistory) {
    return "Trauma History: None reported";
  }
  if (items.length === 0) {
    return "Trauma History: Not specified";
  }
  const itemStrings = items.map(
    (item) => `${item.body_part} — ${item.frequency} — ${item.severity}`
  );
  return `Trauma History:\n${itemStrings.join("\n")}`;
}
