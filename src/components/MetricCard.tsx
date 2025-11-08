import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

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

  const preDisabled = !isIntake && preValue != null;
  const postDisabled = isIntake;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pre Value */}
        <div className="space-y-3">
          <Label htmlFor={`${title}-pre`}>{preLabel}</Label>
          <div className="flex items-center gap-4">
            <Slider
              id={`${title}-pre`}
              min={0}
              max={10}
              step={1}
              value={[preValue ?? 0]}
              onValueChange={handlePreSliderChange}
              disabled={preDisabled}
              className="flex-1"
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
        <div className="space-y-3">
          <Label htmlFor={`${title}-post`}>{postLabel}</Label>
          <div className="flex items-center gap-4">
            <Slider
              id={`${title}-post`}
              min={0}
              max={10}
              step={1}
              value={[postValue ?? 0]}
              onValueChange={handlePostSliderChange}
              disabled={postDisabled}
              className="flex-1"
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
        <div className="flex items-center justify-between border-t pt-4">
          <Label>Change (Δ)</Label>
          <Badge
            variant={deltaStatus === "good" ? "default" : deltaStatus === "bad" ? "destructive" : "secondary"}
            className="text-base font-semibold"
          >
            {deltaText}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
