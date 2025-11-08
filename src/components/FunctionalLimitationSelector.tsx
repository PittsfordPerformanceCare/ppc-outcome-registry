import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { REGION_LIMITATIONS, type LimitationRegionKey } from "@/lib/regionLimitations";

interface FunctionalLimitationSelectorProps {
  region?: string;
  initialLimitation?: string;
  onChange?: (limitation: string) => void;
}

export function FunctionalLimitationSelector({
  region = "",
  initialLimitation = "",
  onChange,
}: FunctionalLimitationSelectorProps) {
  const [limitation, setLimitation] = useState(initialLimitation);
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
      onChange(limitation);
    }
  }, [limitation, onChange]);

  // Reset limitation when region changes
  useEffect(() => {
    if (region && !baseList.includes(limitation)) {
      setLimitation("");
      setQuery("");
    }
  }, [region, baseList, limitation]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Functional Limitation</CardTitle>
          <Badge variant="secondary">Intake & Final</Badge>
        </div>
        <CardDescription>
          Select the primary limitation related to the patient's complaint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="limitation-search">Search Limitations</Label>
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
            <Label htmlFor="limitation-select">Select Limitation *</Label>
            <Select value={limitation} onValueChange={setLimitation}>
              <SelectTrigger id="limitation-select">
                <SelectValue placeholder="Choose a functional limitation..." />
              </SelectTrigger>
              <SelectContent>
                {filtered.length > 0 ? (
                  filtered.map((item, i) => (
                    <SelectItem key={i} value={item}>
                      {item}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-4 text-sm text-muted-foreground">
                    No matches found. Try a different search term.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {!region && (
          <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            Please select an anatomical region to view functional limitations
          </div>
        )}

        {region && limitation && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Selected:</span>
            <Badge variant="outline">{region}</Badge>
            <span className="text-muted-foreground">→</span>
            <Badge>{limitation}</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
