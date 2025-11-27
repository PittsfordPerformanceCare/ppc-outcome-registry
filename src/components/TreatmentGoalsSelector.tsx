import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGION_GOALS } from "@/lib/regionGoals";

export const TREATMENT_GOALS_12 = [
  "Reduce pain to functional level",
  "Improve range of motion",
  "Increase strength/endurance",
  "Improve posture/ergonomics",
  "Increase walking/standing tolerance",
  "Return to work/school duties",
  "Return to sport/recreation",
  "Improve balance/gait stability",
  "Reduce headache/dizziness frequency",
  "Improve sleep quality",
  "Perform ADLs without assistance",
  "Independently complete HEP"
];

export type GoalResult = "achieved" | "partial" | "not_yet";

export type GoalItem = {
  name: string;
  priority?: 1 | 2 | 3; // 1 = High, 2 = Med, 3 = Low
  timeframe_weeks?: number; // target horizon
  notes?: string;
  result?: GoalResult; // set at Final
};

interface TreatmentGoalsSelectorProps {
  stage?: "Intake" | "FollowUp" | "Final";
  region?: string;
  initialGoals?: GoalItem[];
  initialOther?: string;
  onChange?: (data: { goals: GoalItem[]; goals_other: string }) => void;
}

export function TreatmentGoalsSelector({
  stage = "Intake",
  region,
  initialGoals = [],
  initialOther = "",
  onChange,
}: TreatmentGoalsSelectorProps) {
  const isFinal = stage === "Final";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GoalItem[]>(initialGoals);
  const [otherText, setOtherText] = useState(initialOther);

  const baseList = useMemo(() => {
    if (!region) return TREATMENT_GOALS_12;
    return REGION_GOALS[region] || TREATMENT_GOALS_12;
  }, [region]);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return baseList.filter((g) => g.toLowerCase().includes(q));
  }, [query, baseList]);

  useEffect(() => {
    if (onChange) {
      onChange({
        goals: selected,
        goals_other: otherText,
      });
    }
  }, [selected, otherText, onChange]);

  function toggle(name: string) {
    setSelected((prev) => {
      const i = prev.findIndex((g) => g.name === name);
      if (i >= 0) return prev.filter((g) => g.name !== name);
      return [...prev, { name, priority: 1, timeframe_weeks: 4 }];
    });
  }

  function update(name: string, patch: Partial<GoalItem>) {
    setSelected((prev) =>
      prev.map((g) => (g.name === name ? { ...g, ...patch } : g))
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Treatment Goals (Common 12)</CardTitle>
          <Badge variant="secondary">
            {isFinal ? "Final Review" : "Intake"}
          </Badge>
        </div>
        <CardDescription>
          {region ? `Select treatment goals and track progress for ${region}` : "Select a region first to see relevant treatment goals"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="goal-search">Filter Goals</Label>
          <Input
            id="goal-search"
            placeholder="Type to filter treatment goals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!region}
          />
        </div>

        {region ? (
          <div className="space-y-2">
            <Label>Select Goals</Label>
            <div className="flex flex-wrap gap-2">
              {options.map((name) => {
              const isOn = selected.some((g) => g.name === name);
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
                  title={isOn ? "Remove goal" : "Add goal"}
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
            Please select a region first to see relevant treatment goal options
          </div>
        )}

        {selected.length > 0 && (
          <div className="space-y-2">
            <Label>Goal Details & Tracking</Label>
            <div className="rounded-md border divide-y">
              {selected.map((item) => (
                <div key={item.name} className="p-3 space-y-3">
                  <div className="font-medium text-sm">{item.name}</div>

                  {/* Priority & Timeframe */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`priority-${item.name}`} className="text-xs">
                        Priority
                      </Label>
                      <Select
                        value={String(item.priority ?? 1)}
                        onValueChange={(value) =>
                          update(item.name, { priority: Number(value) as 1 | 2 | 3 })
                        }
                      >
                        <SelectTrigger id={`priority-${item.name}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">High</SelectItem>
                          <SelectItem value="2">Medium</SelectItem>
                          <SelectItem value="3">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`timeframe-${item.name}`} className="text-xs">
                        Timeframe (weeks)
                      </Label>
                      <Input
                        id={`timeframe-${item.name}`}
                        type="number"
                        min={1}
                        max={52}
                        value={item.timeframe_weeks ?? 4}
                        onChange={(e) =>
                          update(item.name, {
                            timeframe_weeks: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <Label htmlFor={`notes-${item.name}`} className="text-xs">
                      Notes (optional)
                    </Label>
                    <Textarea
                      id={`notes-${item.name}`}
                      rows={2}
                      placeholder="Additional details about this goal..."
                      value={item.notes ?? ""}
                      onChange={(e) =>
                        update(item.name, { notes: e.target.value })
                      }
                    />
                  </div>

                  {/* Result tracking (Final stage only) */}
                  {isFinal && (
                    <div className="space-y-1">
                      <Label className="text-xs">Outcome</Label>
                      <div className="flex items-center gap-1">
                        {(["achieved", "partial", "not_yet"] as GoalResult[]).map(
                          (r) => (
                            <button
                              key={r}
                              type="button"
                              className={`text-xs px-3 py-1.5 rounded transition-colors ${
                                item.result === r
                                  ? r === "achieved"
                                    ? "bg-green-500 text-white"
                                    : r === "partial"
                                    ? "bg-yellow-500 text-white"
                                    : "bg-gray-500 text-white"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                              onClick={() => update(item.name, { result: r })}
                            >
                              {r === "achieved"
                                ? "Achieved"
                                : r === "partial"
                                ? "Partial"
                                : "Not Yet"}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="other-goals">Other Goals (Optional)</Label>
          <Textarea
            id="other-goals"
            rows={3}
            placeholder="Enter any other treatment goals not listed above..."
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
          />
        </div>

        {selected.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {selected.length} goal{selected.length !== 1 ? "s" : ""} selected
            </span>
            {isFinal && selected.length > 0 && (
              <span>
                {selected.filter((g) => g.result === "achieved").length} /{" "}
                {selected.length} achieved (
                {Math.round(
                  (selected.filter((g) => g.result === "achieved").length /
                    selected.length) *
                    100
                )}
                %)
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
