import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onMoveUp?: () => void;
  onMoveDown?: () => void;
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
  onMoveUp,
  onMoveDown,
  isDragging = false,
}: SortableComplaintItemProps) {
  const isMobile = useIsMobile();
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
          {/* Drag Handle - Hidden on mobile, show arrow buttons instead */}
          {!isMobile && (
            <div
              {...attributes}
              {...listeners}
              className="flex items-center justify-center h-11 w-11 min-h-[44px] min-w-[44px] rounded cursor-grab active:cursor-grabbing hover:bg-muted transition-colors shrink-0 touch-none"
              role="button"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          {/* Mobile: Up/Down Buttons */}
          {isMobile && fieldsLength > 1 && (
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                disabled={index === 0}
                className="h-11 w-11 p-0 min-h-[44px] min-w-[44px]"
                aria-label="Move concern up"
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                disabled={index === fieldsLength - 1}
                className="h-11 w-11 p-0 min-h-[44px] min-w-[44px]"
                aria-label="Move concern down"
              >
                <ChevronDown className="h-5 w-5" />
              </Button>
            </div>
          )}

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
              Primary
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
            className="shrink-0 h-11 w-11 min-h-[44px] min-w-[44px] sm:h-auto sm:w-auto"
            aria-label="Remove concern"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Basic Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name={`complaints.${index}.category`}
          render={({ field: categoryField, fieldState }) => {
            const isComplete = !!categoryField.value;
            return (
              <FormItem data-error={fieldState.error ? "true" : undefined}>
                <FormLabel className="flex items-center gap-2">
                  Body Region *
                  {isComplete && (
                    <CheckCircle2 className="h-4 w-4 text-success animate-scale-in" />
                  )}
                </FormLabel>
                <Select onValueChange={categoryField.onChange} value={categoryField.value}>
                  <FormControl>
                    <SelectTrigger className={isComplete ? 'border-success/50' : ''}>
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
            );
          }}
        />

        <FormField
          control={form.control}
          name={`complaints.${index}.severity`}
          render={({ field: severityField, fieldState }) => {
            const isComplete = !!severityField.value;
            return (
              <FormItem data-error={fieldState.error ? "true" : undefined}>
                <FormLabel className="flex items-center gap-2">
                  Severity *
                  {isComplete && (
                    <CheckCircle2 className="h-4 w-4 text-success animate-scale-in" />
                  )}
                </FormLabel>
                <Select onValueChange={severityField.onChange} value={severityField.value}>
                  <FormControl>
                    <SelectTrigger className={isComplete ? 'border-success/50' : ''}>
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
            );
          }}
        />
      </div>

      <FormField
        control={form.control}
        name={`complaints.${index}.duration`}
        render={({ field: durationField, fieldState }) => {
          const isComplete = !!durationField.value;
          return (
            <FormItem data-error={fieldState.error ? "true" : undefined}>
              <FormLabel className="flex items-center gap-2">
                How long have you had this issue? *
                {isComplete && (
                  <CheckCircle2 className="h-4 w-4 text-success animate-scale-in" />
                )}
              </FormLabel>
              <Select onValueChange={durationField.onChange} value={durationField.value}>
                <FormControl>
                  <SelectTrigger className={isComplete ? 'border-success/50' : ''}>
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
          );
        }}
      />

      <FormField
        control={form.control}
        name={`complaints.${index}.text`}
        render={({ field: textField, fieldState }) => {
          const charCount = textField.value?.length || 0;
          const minChars = 5;
          const isComplete = charCount >= minChars;
          
          return (
            <FormItem data-error={fieldState.error ? "true" : undefined}>
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  Describe This Concern *
                  {isComplete && (
                    <CheckCircle2 className="h-4 w-4 text-success animate-scale-in" />
                  )}
                </FormLabel>
                <span className={`text-xs transition-colors ${
                  charCount === 0 
                    ? 'text-muted-foreground' 
                    : isComplete 
                      ? 'text-success font-medium' 
                      : 'text-destructive font-medium'
                }`}>
                  {charCount}/{minChars} min
                </span>
              </div>
              <FormDescription>Be as detailed as possible about this specific issue</FormDescription>
              <FormControl>
                <Textarea
                  placeholder="Example: Sharp pain in left shoulder when reaching overhead, difficulty sleeping on that side, started after lifting heavy boxes at work..."
                  rows={4}
                  className={isComplete ? 'border-success/50 focus:border-success' : ''}
                  {...textField}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
