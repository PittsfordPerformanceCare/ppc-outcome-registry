import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { REGION_LIMITATIONS, type LimitationRegionKey } from "@/lib/regionLimitations";

interface FunctionalLimitationSelectorProps {
  region?: string;
  initialLimitations?: string[];
  onChange?: (limitations: string[]) => void;
}

export function FunctionalLimitationSelector({
  region = "",
  initialLimitations = [],
  onChange,
}: FunctionalLimitationSelectorProps) {
  const [selected, setSelected] = useState<string[]>(initialLimitations);
  const [query, setQuery] = useState("");

  const baseList = useMemo(
    () => (region ? REGION_LIMITATIONS[region as LimitationRegionKey] || [] : []),
    [region]
  );

  const filtered = useMemo(
    () => baseList.filter((l) => l.toLowerCase().includes(query.trim().toLowerCase())),
    [baseList, query]
  );

  useEffect(() => {
    if (onChange) {
      onChange(selected);
    }
  }, [selected, onChange]);

  // Reset limitations when region changes
  useEffect(() => {
    if (region) {
      // Keep only limitations that are valid for the new region
      const validLimitations = selected.filter(l => baseList.includes(l));
      if (validLimitations.length !== selected.length) {
        setSelected(validLimitations);
      }
      setQuery("");
    }
  }, [region, baseList]);

  function toggle(name: string) {
    setSelected((prev) => {
      if (prev.includes(name)) {
        return prev.filter((l) => l !== name);
      }
      return [...prev, name];
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Functional Limitations (Multi-Select)</CardTitle>
          <Badge variant="secondary">Intake & Final</Badge>
        </div>
        <CardDescription>
          Select all limitations related to the patient's complaint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="limitation-search">Filter Limitations</Label>
          <Input
            id="limitation-search"
            placeholder={
              region
                ? "Type to filter limitations..."
                : "Select an anatomical region first..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!region}
          />
        </div>

        {region && (
          <div className="space-y-2">
            <Label>Select Limitations</Label>
            <div className="flex flex-wrap gap-2">
              {filtered.map((name) => {
                const isOn = selected.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                      isOn
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border"
                    }`}
                    onClick={() => toggle(name)}
                    title={isOn ? "Remove" : "Add"}
                  >
                    {isOn ? "✓ " : "+ "}
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!region && (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Please select an anatomical region to view functional limitations
          </div>
        )}

        {selected.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Limitations ({selected.length})</Label>
            <div className="flex flex-wrap gap-2">
              {selected.map((item) => (
                <Badge key={item} variant="outline" className="gap-1">
                  {item}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={() => toggle(item)}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
