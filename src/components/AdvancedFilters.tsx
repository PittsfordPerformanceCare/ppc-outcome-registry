import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdvancedFiltersProps {
  availableDiagnoses: string[];
  availableRegions: string[];
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  statuses: string[];
  diagnoses: string[];
  regions: string[];
  scoreRange: [number, number];
  hasOutcomeScores: boolean | null;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "pending_followup", label: "Pending Follow-up" },
];

export function AdvancedFilters({
  availableDiagnoses,
  availableRegions,
  onFiltersChange,
  initialFilters,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(
    initialFilters || {
      statuses: [],
      diagnoses: [],
      regions: [],
      scoreRange: [0, 100],
      hasOutcomeScores: null,
    }
  );

  const activeFilterCount = 
    filters.statuses.length +
    filters.diagnoses.length +
    filters.regions.length +
    (filters.hasOutcomeScores !== null ? 1 : 0) +
    (filters.scoreRange[0] !== 0 || filters.scoreRange[1] !== 100 ? 1 : 0);

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    
    const newFilters = { ...filters, statuses: newStatuses };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDiagnosisToggle = (diagnosis: string) => {
    const newDiagnoses = filters.diagnoses.includes(diagnosis)
      ? filters.diagnoses.filter((d) => d !== diagnosis)
      : [...filters.diagnoses, diagnosis];
    
    const newFilters = { ...filters, diagnoses: newDiagnoses };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleRegionToggle = (region: string) => {
    const newRegions = filters.regions.includes(region)
      ? filters.regions.filter((r) => r !== region)
      : [...filters.regions, region];
    
    const newFilters = { ...filters, regions: newRegions };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleScoreRangeChange = (range: [number, number]) => {
    const newFilters = { ...filters, scoreRange: range };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleOutcomeScoreFilter = (value: boolean | null) => {
    const newFilters = { ...filters, hasOutcomeScores: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      statuses: [],
      diagnoses: [],
      regions: [],
      scoreRange: [0, 100],
      hasOutcomeScores: null,
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Advanced Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount} active</Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
        <CardDescription>
          Apply multiple filters to refine your data view
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Episode Status Filter */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="space-y-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                <Label className="text-base font-semibold cursor-pointer">Episode Status</Label>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2">
              {STATUS_OPTIONS.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status.value}`}
                    checked={filters.statuses.includes(status.value)}
                    onCheckedChange={() => handleStatusToggle(status.value)}
                  />
                  <Label
                    htmlFor={`status-${status.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {status.label}
                  </Label>
                </div>
              ))}
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Diagnosis Filter */}
        {availableDiagnoses.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Diagnosis</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableDiagnoses.map((diagnosis) => (
                <div key={diagnosis} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diagnosis-${diagnosis}`}
                    checked={filters.diagnoses.includes(diagnosis)}
                    onCheckedChange={() => handleDiagnosisToggle(diagnosis)}
                  />
                  <Label
                    htmlFor={`diagnosis-${diagnosis}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {diagnosis}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Region Filter */}
        {availableRegions.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Region</Label>
            <div className="space-y-2">
              {availableRegions.map((region) => (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox
                    id={`region-${region}`}
                    checked={filters.regions.includes(region)}
                    onCheckedChange={() => handleRegionToggle(region)}
                  />
                  <Label
                    htmlFor={`region-${region}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {region}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outcome Score Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Improvement Score Range</Label>
            <span className="text-sm text-muted-foreground">
              {filters.scoreRange[0]}% - {filters.scoreRange[1]}%
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={5}
            value={filters.scoreRange}
            onValueChange={(value) => handleScoreRangeChange(value as [number, number])}
            className="w-full"
          />
        </div>

        {/* Has Outcome Scores Filter */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Outcome Scores</Label>
          <div className="flex gap-2">
            <Button
              variant={filters.hasOutcomeScores === true ? "default" : "outline"}
              size="sm"
              onClick={() => handleOutcomeScoreFilter(filters.hasOutcomeScores === true ? null : true)}
            >
              Has Scores
            </Button>
            <Button
              variant={filters.hasOutcomeScores === false ? "default" : "outline"}
              size="sm"
              onClick={() => handleOutcomeScoreFilter(filters.hasOutcomeScores === false ? null : false)}
            >
              Missing Scores
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
