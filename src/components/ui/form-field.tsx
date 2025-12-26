import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}

/**
 * FormField wrapper component that provides consistent styling for form fields
 * with error states and validation messages
 */
export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  touched = false,
  children,
  className,
  hint,
}: FormFieldProps) {
  const showError = touched && error;

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={htmlFor}
        className={cn(showError && "text-destructive")}
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {hint && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
      <div className="relative">
        {children}
        {showError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
        )}
      </div>
      {showError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}

interface FormErrorSummaryProps {
  errors: Array<{ field: string; message: string }>;
  fieldLabels?: Record<string, string>;
  onFieldClick?: (field: string) => void;
}

/**
 * Summary component showing all form errors at once
 * Useful for displaying at the top of a form on submit
 */
export function FormErrorSummary({
  errors,
  fieldLabels = {},
  onFieldClick,
}: FormErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium text-destructive">
            Please fix the following {errors.length === 1 ? "error" : "errors"}:
          </p>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-destructive">
                {onFieldClick ? (
                  <button
                    type="button"
                    onClick={() => onFieldClick(error.field)}
                    className="underline hover:no-underline text-left"
                  >
                    {fieldLabels[error.field] || error.field}: {error.message}
                  </button>
                ) : (
                  <span>
                    <strong>{fieldLabels[error.field] || error.field}:</strong> {error.message}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  touched?: boolean;
}

/**
 * Input with validation styling built in
 */
export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ error, touched, className, ...props }, ref) => {
    const showError = touched && error;

    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          showError && "border-destructive focus-visible:ring-destructive pr-10",
          className
        )}
        {...props}
      />
    );
  }
);
ValidatedInput.displayName = "ValidatedInput";
