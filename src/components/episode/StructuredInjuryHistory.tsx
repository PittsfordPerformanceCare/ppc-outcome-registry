import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const BODY_AREAS = [
  "Concussion",
  "Neck",
  "Shoulder",
  "Spine",
  "Hip",
  "Hamstring",
  "Quadriceps",
  "Knee",
  "Ankle / Foot",
  "Other",
] as const;

const INJURY_TYPES = [
  { value: "injury", label: "Injury" },
  { value: "surgery", label: "Surgery" },
  { value: "both", label: "Both" },
] as const;

const YEAR_OPTIONS = [
  "2025", "2024", "2023", "2022", "2021", "2020",
  "2019", "2018", "2017", "2016", "2015",
  "Before 2015", "Unknown"
] as const;

export interface StructuredInjuryItem {
  bodyArea: string;
  injuryType: "injury" | "surgery" | "both";
  year: string;
  stillActive: boolean;
}

interface StructuredInjuryHistoryProps {
  items: StructuredInjuryItem[];
  onChange: (items: StructuredInjuryItem[]) => void;
}

export function StructuredInjuryHistory({ items, onChange }: StructuredInjuryHistoryProps) {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    items.map(i => i.bodyArea)
  );

  const handleAreaToggle = (area: string, checked: boolean) => {
    if (checked) {
      setSelectedAreas([...selectedAreas, area]);
      onChange([
        ...items,
        { bodyArea: area, injuryType: "injury", year: "", stillActive: false }
      ]);
    } else {
      setSelectedAreas(selectedAreas.filter(a => a !== area));
      onChange(items.filter(i => i.bodyArea !== area));
    }
  };

  const handleItemUpdate = (bodyArea: string, field: keyof StructuredInjuryItem, value: any) => {
    onChange(
      items.map(item =>
        item.bodyArea === bodyArea ? { ...item, [field]: value } : item
      )
    );
  };

  const removeItem = (bodyArea: string) => {
    setSelectedAreas(selectedAreas.filter(a => a !== bodyArea));
    onChange(items.filter(i => i.bodyArea !== bodyArea));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Prior injuries or surgeries (select all that apply)</Label>
        <div className="flex flex-wrap gap-2">
          {BODY_AREAS.map((area) => {
            const isSelected = selectedAreas.includes(area);
            return (
              <button
                key={area}
                type="button"
                onClick={() => handleAreaToggle(area, !isSelected)}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border"
                }`}
              >
                {isSelected ? "✓ " : "+ "}
                {area}
              </button>
            );
          })}
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          <Label>Details for selected areas</Label>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.bodyArea}
                className="flex flex-wrap items-center gap-3 rounded-lg border p-3 bg-muted/30"
              >
                <Badge variant="secondary" className="gap-1">
                  {item.bodyArea}
                  <button
                    type="button"
                    onClick={() => removeItem(item.bodyArea)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>

                <Select
                  value={item.injuryType}
                  onValueChange={(v) => handleItemUpdate(item.bodyArea, "injuryType", v)}
                >
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INJURY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={item.year}
                  onValueChange={(v) => handleItemUpdate(item.bodyArea, "year", v)}
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={item.stillActive}
                    onCheckedChange={(v) => handleItemUpdate(item.bodyArea, "stillActive", v)}
                  />
                  Still active
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
