import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  description: string;
  preLabel: string;
  postLabel: string;
  preValue: number | null;
  postValue: number | null;
  onPreChange?: (value: number | null) => void;
  onPostChange?: (value: number | null) => void;
  isIntake: boolean;
  deltaInverted?: boolean; // true for pain (reduction is good), false for CIS (increase is good)
  icon?: "activity" | "alert"; // Icon type for the card
}

export function MetricCard({
  title,
  description,
  preLabel,
  postLabel,
  preValue,
  postValue,
  onPreChange,
  onPostChange,
  isIntake,
  deltaInverted = false,
  icon = "activity",
}: MetricCardProps) {
  const [localPre, setLocalPre] = useState<string>(preValue?.toString() || "");
  const [localPost, setLocalPost] = useState<string>(postValue?.toString() || "");

  useEffect(() => {
    setLocalPre(preValue?.toString() || "");
  }, [preValue]);

  useEffect(() => {
    setLocalPost(postValue?.toString() || "");
  }, [postValue]);

  const handlePreInputChange = (value: string) => {
    setLocalPre(value);
    const num = parseFloat(value);
    if (value === "" || value === null) {
      onPreChange?.(null);
    } else if (!isNaN(num) && num >= 0 && num <= 10) {
      onPreChange?.(num);
    }
  };

  const handlePostInputChange = (value: string) => {
    setLocalPost(value);
    const num = parseFloat(value);
    if (value === "" || value === null) {
      onPostChange?.(null);
    } else if (!isNaN(num) && num >= 0 && num <= 10) {
      onPostChange?.(num);
    }
  };

  const handlePreSliderChange = (values: number[]) => {
    const value = values[0];
    setLocalPre(value.toString());
    onPreChange?.(value);
  };

  const handlePostSliderChange = (values: number[]) => {
    const value = values[0];
    setLocalPost(value.toString());
    onPostChange?.(value);
  };

  // Calculate delta
  let delta: number | null = null;
  let deltaText = "—";
  let deltaStatus: "good" | "neutral" | "bad" = "neutral";

  if (preValue != null && postValue != null) {
    // For CIS: delta = post - pre (increase is good)
    // For Pain: delta = pre - post (reduction is good)
    delta = deltaInverted ? preValue - postValue : postValue - preValue;
    deltaText = delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
    deltaStatus = delta >= 0 ? "good" : "bad";
  }

  const preDisabled = false;
  const postDisabled = false;

  const Icon = icon === "activity" ? Activity : AlertCircle;
  
  // Border color based on delta status
  const borderAccentClass = 
    deltaStatus === "good" ? "border-l-4 border-l-success" :
    deltaStatus === "bad" ? "border-l-4 border-l-warning" :
    "border-l-4 border-l-muted";

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-md",
      "bg-gradient-to-br from-card to-card/80",
      borderAccentClass
    )}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pre Value */}
        <div className={cn(
          "space-y-3 p-3 rounded-lg transition-colors",
          preDisabled && "bg-muted/30"
        )}>
          <Label htmlFor={`${title}-pre`} className="text-sm font-medium">
            {preLabel}
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id={`${title}-pre`}
              min={0}
              max={10}
              step={1}
              value={[preValue ?? 0]}
              onValueChange={handlePreSliderChange}
              disabled={preDisabled}
              className="flex-1 hover:opacity-90 transition-opacity"
            />
            <Input
              type="number"
              min={0}
              max={10}
              step={1}
              value={localPre}
              onChange={(e) => handlePreInputChange(e.target.value)}
              disabled={preDisabled}
              className="w-20"
            />
          </div>
        </div>

        {/* Post Value */}
        <div className={cn(
          "space-y-3 p-3 rounded-lg transition-colors",
          postDisabled && "bg-muted/30"
        )}>
          <Label htmlFor={`${title}-post`} className="text-sm font-medium">
            {postLabel}
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              id={`${title}-post`}
              min={0}
              max={10}
              step={1}
              value={[postValue ?? 0]}
              onValueChange={handlePostSliderChange}
              disabled={postDisabled}
              className="flex-1 hover:opacity-90 transition-opacity"
            />
            <Input
              type="number"
              min={0}
              max={10}
              step={1}
              value={localPost}
              onChange={(e) => handlePostInputChange(e.target.value)}
              disabled={postDisabled}
              className="w-20"
            />
          </div>
        </div>

        {/* Delta */}
        <div className="flex items-center justify-between border-t pt-4 mt-2">
          <Label className="text-base font-semibold">Change (Δ)</Label>
          <Badge
            className={cn(
              "text-lg font-bold px-4 py-1.5 transition-all duration-300",
              deltaStatus === "good" && "bg-success/15 text-success border-success/30 animate-in zoom-in-50",
              deltaStatus === "bad" && "bg-warning/15 text-warning border-warning/30 animate-in zoom-in-50",
              deltaStatus === "neutral" && "bg-secondary text-secondary-foreground",
              deltaStatus === "good" && delta !== null && delta > 0 && "animate-pulse"
            )}
            variant="outline"
          >
            {deltaText}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
