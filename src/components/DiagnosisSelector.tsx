import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { REGION_DIAGNOSES, type RegionKey, type DiagnosisItem } from "@/lib/regionDiagnoses";
import { ScrollArea } from "@/components/ui/scroll-area";

const FAVORITES_KEY = "orx:dxFavorites";
const RECENTS_KEY = "orx:dxRecents";
const MAX_RECENTS = 10;

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, val: T) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Silent fail
  }
}

function uniqKey(p: DiagnosisItem) {
  return `${p.region}::${p.diagnosis}`;
}

interface DiagnosisSelectorProps {
  region?: string;
  diagnosis?: string;
  onChange?: (value: { region: string; diagnosis: string }) => void;
}

export function DiagnosisSelector({ region: initialRegion, diagnosis: initialDiagnosis, onChange }: DiagnosisSelectorProps) {
  const [region, setRegion] = useState<string>(initialRegion || "");
  const [query, setQuery] = useState("");
  const [diagnosis, setDiagnosis] = useState<string>(initialDiagnosis || "");

  const [favorites, setFavorites] = useState<DiagnosisItem[]>(() => loadLS(FAVORITES_KEY, [] as DiagnosisItem[]));
  const [recents, setRecents] = useState<DiagnosisItem[]>(() => loadLS(RECENTS_KEY, [] as DiagnosisItem[]));

  useEffect(() => {
    onChange?.({ region, diagnosis });
  }, [region, diagnosis, onChange]);

  const baseList = useMemo(() => region ? (REGION_DIAGNOSES[region as RegionKey] || []) : [], [region]);
  const filtered = useMemo(() =>
    baseList.filter(d => d.toLowerCase().includes(query.trim().toLowerCase())),
    [baseList, query]
  );

  function toggleFavorite(item: DiagnosisItem) {
    const key = uniqKey(item);
    const exists = favorites.some(f => uniqKey(f) === key);
    const next = exists ? favorites.filter(f => uniqKey(f) !== key) : [...favorites, item];
    setFavorites(next);
    saveLS(FAVORITES_KEY, next);
  }

  function pushRecent(item: DiagnosisItem) {
    const key = uniqKey(item);
    const next = [item, ...recents.filter(r => uniqKey(r) !== key)].slice(0, MAX_RECENTS);
    setRecents(next);
    saveLS(RECENTS_KEY, next);
  }

  function pick(item: DiagnosisItem) {
    setRegion(item.region);
    setDiagnosis(item.diagnosis);
    setQuery("");
    pushRecent(item);
  }

  const regionOptions = Object.keys(REGION_DIAGNOSES);

  return (
    <Card className="border-l-4 border-l-primary/30 hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Diagnosis</CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">Intake & Discharge</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Region Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Anatomical Region</label>
          <Select
            value={region}
            onValueChange={(value) => {
              setRegion(value);
              setDiagnosis("");
              setQuery("");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select region…" />
            </SelectTrigger>
            <SelectContent>
              {regionOptions.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Favorites & Recents Chips */}
        {(favorites.length > 0 || recents.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {favorites
              .filter(f => !region || f.region === region)
              .map(f => (
                <Badge
                  key={`fav-${uniqKey(f)}`}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => pick(f)}
                  title={`${f.region}: ${f.diagnosis}`}
                >
                  ⭐ {f.diagnosis}
                </Badge>
              ))}
            {recents
              .filter(r => !region || r.region === region)
              .slice(0, 5)
              .map(r => (
                <Badge
                  key={`rec-${uniqKey(r)}`}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => pick(r)}
                  title={`${r.region}: ${r.diagnosis}`}
                >
                  ⟳ {r.diagnosis}
                </Badge>
              ))}
          </div>
        )}

        {/* Search & List */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Diagnosis (Top 12 + Search)</label>
          <Input
            placeholder={region ? "Type to filter within region…" : "Select a region first…"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!region}
          />
          <div className="border rounded-md bg-muted/30">
            {!region && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Choose a region to see suggestions.
              </div>
            )}
            {region && filtered.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No matches. Try a different term.
              </div>
            )}
            {region && filtered.length > 0 && (
              <ScrollArea className="h-56">
                <ul className="divide-y divide-border">
                  {filtered.map(dx => {
                    const item = { region: region as RegionKey, diagnosis: dx };
                    const isFav = favorites.some(f => uniqKey(f) === uniqKey(item));
                    return (
                      <li
                        key={dx}
                        className="flex items-center justify-between p-3 hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => pick(item)}
                      >
                        <span className="text-sm flex-1">{dx}</span>
                        <button
                          className="ml-3 p-1 hover:bg-background rounded transition-colors"
                          title={isFav ? "Remove favorite" : "Add favorite"}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item);
                          }}
                        >
                          <Star className={`h-4 w-4 ${isFav ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Selected Value Display */}
        {(region || diagnosis) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Selected:</span>
            {region && <Badge variant="default">{region}</Badge>}
            {diagnosis && <Badge variant="secondary" className="max-w-xs truncate">{diagnosis}</Badge>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
