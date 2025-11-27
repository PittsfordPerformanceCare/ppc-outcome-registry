import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { REGION_TREATMENTS } from "@/lib/regionTreatments";

export const PRIOR_TREATMENTS_12 = [
  "Rest / activity modification",
  "Ice / heat",
  "NSAIDs / OTC analgesics",
  "Muscle relaxant",
  "Oral steroid dose pack",
  "Corticosteroid injection",
  "Chiropractic care",
  "Chiropractic care",
  "Massage therapy",
  "Acupuncture",
  "Home exercise program (HEP)",
  "Bracing / taping"
];

export type PriorTreatment = {
  name: string;
  result?: "helped" | "no_change" | "worse";
};

interface PriorTreatmentSelectorProps {
  region?: string;
  initialTreatments?: PriorTreatment[];
  initialOther?: string;
  onChange?: (data: { prior_treatments: PriorTreatment[]; prior_treatments_other: string }) => void;
}

export function PriorTreatmentSelector({
  region,
  initialTreatments = [],
  initialOther = "",
  onChange,
}: PriorTreatmentSelectorProps) {
  const [selected, setSelected] = useState<PriorTreatment[]>(initialTreatments);
  const [query, setQuery] = useState("");
  const [otherText, setOtherText] = useState(initialOther);

  const baseList = useMemo(() => {
    if (!region) return PRIOR_TREATMENTS_12;
    return REGION_TREATMENTS[region] || PRIOR_TREATMENTS_12;
  }, [region]);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return baseList.filter((t) => t.toLowerCase().includes(q));
  }, [query, baseList]);

  useEffect(() => {
    if (onChange) {
      onChange({
        prior_treatments: selected,
        prior_treatments_other: otherText,
      });
    }
  }, [selected, otherText, onChange]);

  function toggle(name: string) {
    setSelected((prev) => {
      const i = prev.findIndex((p) => p.name === name);
      if (i >= 0) return prev.filter((p) => p.name !== name);
      return [...prev, { name }];
    });
  }

  function setResult(name: string, result: PriorTreatment["result"]) {
    setSelected((prev) =>
      prev.map((p) => (p.name === name ? { ...p, result } : p))
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Prior Treatment (Common 12)</CardTitle>
          <Badge variant="secondary">Intake & Final</Badge>
        </div>
        <CardDescription>
          {region ? `Select treatments the patient has already tried for ${region}` : "Select a region first to see relevant treatments"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="treatment-search">Filter Treatments</Label>
          <Input
            id="treatment-search"
            placeholder="Type to filter treatments..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!region}
          />
        </div>

        {region ? (
          <div className="space-y-2">
            <Label>Select Treatments</Label>
            <div className="flex flex-wrap gap-2">
              {options.map((name) => {
              const isOn = selected.some((p) => p.name === name);
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
        ) : (
          <div className="text-sm text-muted-foreground p-4 text-center border rounded-md">
            Please select a region first to see relevant prior treatment options
          </div>
        )}

        {selected.length > 0 && (
          <div className="space-y-2">
            <Label>Rate Effectiveness (Optional)</Label>
            <div className="rounded-md border divide-y">
              {selected.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-4 p-3"
                >
                  <div className="text-sm font-medium flex-1">{item.name}</div>
                  <div className="flex items-center gap-1">
                    {(["helped", "no_change", "worse"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          item.result === r
                            ? r === "helped"
                              ? "bg-green-500 text-white"
                              : r === "worse"
                              ? "bg-red-500 text-white"
                              : "bg-gray-500 text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        onClick={() => setResult(item.name, r)}
                      >
                        {r === "helped"
                          ? "Helped"
                          : r === "no_change"
                          ? "No change"
                          : "Worse"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="other-treatments">
            Other Prior Treatments (Optional)
          </Label>
          <Textarea
            id="other-treatments"
            rows={3}
            placeholder="Enter any other treatments not listed above..."
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
          />
        </div>

        {selected.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {selected.length} treatment{selected.length !== 1 ? "s" : ""} selected
          </div>
        )}
      </CardContent>
    </Card>
  );
}
