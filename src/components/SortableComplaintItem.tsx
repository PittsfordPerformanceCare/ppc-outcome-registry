import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface SortableComplaintItemProps {
  id: string;
  index: number;
  complaint: any;
  form: any;
  fieldsLength: number;
  categories: readonly string[];
  severityLevels: readonly string[];
  durationOptions: readonly string[];
  onRemove: () => void;
  isDragging?: boolean;
}

export function SortableComplaintItem({
  id,
  index,
  complaint,
  form,
  fieldsLength,
  categories,
  severityLevels,
  durationOptions,
  onRemove,
  isDragging = false,
}: SortableComplaintItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const priority = form.watch(`complaints.${index}.priority`);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`space-y-4 p-5 border-2 rounded-lg relative bg-card shadow-sm transition-all ${
        isSortableDragging ? "ring-2 ring-primary z-50" : "hover:shadow-md"
      }`}
    >
      {/* Header with Priority and Remove */}
      <div className="flex items-start justify-between gap-2 pb-3 border-b">
        <div className="flex items-center gap-3 flex-1">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center justify-center h-8 w-8 rounded cursor-grab active:cursor-grabbing hover:bg-muted transition-colors shrink-0 touch-none"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Complaint Number Badge */}
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
            {index + 1}
          </div>

          {/* Priority Display */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Priority:</span>
            <Badge variant="outline" className="font-semibold">
              #{priority || index + 1}
            </Badge>
          </div>

          {/* Primary Badge */}
          {priority === 1 && (
            <Badge variant="default" className="gap-1 animate-scale-in">
              <CheckCircle2 className="h-3 w-3" />
              Primary Concern
            </Badge>
          )}
        </div>

        {/* Remove Button */}
        {fieldsLength > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name={`complaints.${index}.category`}
          render={({ field: categoryField }) => (
            <FormItem>
              <FormLabel>Body Region *</FormLabel>
              <Select onValueChange={categoryField.onChange} value={categoryField.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select body region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`complaints.${index}.severity`}
          render={({ field: severityField }) => (
            <FormItem>
              <FormLabel>Severity *</FormLabel>
              <Select onValueChange={severityField.onChange} value={severityField.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  {severityLevels.map((severity) => (
                    <SelectItem key={severity} value={severity}>
                      {severity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`complaints.${index}.duration`}
        render={({ field: durationField }) => (
          <FormItem>
            <FormLabel>How long have you had this issue? *</FormLabel>
            <Select onValueChange={durationField.onChange} value={durationField.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background">
                {durationOptions.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`complaints.${index}.text`}
        render={({ field: textField }) => (
          <FormItem>
            <FormLabel>Describe This Concern *</FormLabel>
            <FormDescription>Be as detailed as possible about this specific issue</FormDescription>
            <FormControl>
              <Textarea
                placeholder="Example: Sharp pain in left shoulder when reaching overhead, difficulty sleeping on that side, started after lifting heavy boxes at work..."
                rows={4}
                {...textField}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
