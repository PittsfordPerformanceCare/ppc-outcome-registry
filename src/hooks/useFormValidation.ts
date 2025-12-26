import { useState, useCallback, useRef } from "react";
import { z } from "zod";

export interface FieldError {
  field: string;
  message: string;
}

export interface ValidationState {
  errors: FieldError[];
  touchedFields: Set<string>;
  isValid: boolean;
}

export interface UseFormValidationReturn<T> {
  errors: FieldError[];
  touchedFields: Set<string>;
  isValid: boolean;
  getFieldError: (field: string) => string | undefined;
  isFieldTouched: (field: string) => boolean;
  hasFieldError: (field: string) => boolean;
  touchField: (field: string) => void;
  validateField: (field: string, value: unknown) => void;
  validateAll: (data: T) => boolean;
  clearErrors: () => void;
  getErrorSummary: () => FieldError[];
}

/**
 * Generic form validation hook with inline validation support
 */
export function useFormValidation<T extends Record<string, unknown>>(
  schema: z.ZodSchema<T>,
  fieldLabels?: Record<string, string>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<FieldError[]>([]);
  const touchedFieldsRef = useRef<Set<string>>(new Set());
  const [, forceUpdate] = useState({});

  const getFieldError = useCallback(
    (field: string): string | undefined => {
      return errors.find((e) => e.field === field)?.message;
    },
    [errors]
  );

  const isFieldTouched = useCallback((field: string): boolean => {
    return touchedFieldsRef.current.has(field);
  }, []);

  const hasFieldError = useCallback(
    (field: string): boolean => {
      return touchedFieldsRef.current.has(field) && errors.some((e) => e.field === field);
    },
    [errors]
  );

  const touchField = useCallback((field: string) => {
    touchedFieldsRef.current.add(field);
    forceUpdate({});
  }, []);

  const validateField = useCallback(
    (field: string, value: unknown) => {
      // Mark field as touched
      touchedFieldsRef.current.add(field);

      // Get the field schema if possible
      try {
        // Try to validate just this field using safeParse on a partial object
        const partialData = { [field]: value } as unknown as T;
        const result = schema.safeParse(partialData);

        if (!result.success) {
          const fieldError = result.error.issues.find((issue) =>
            issue.path.includes(field)
          );

          if (fieldError) {
            const label = fieldLabels?.[field] || field;
            setErrors((prev) => {
              const filtered = prev.filter((e) => e.field !== field);
              return [...filtered, { field, message: fieldError.message }];
            });
          } else {
            // Field is valid, remove any existing error
            setErrors((prev) => prev.filter((e) => e.field !== field));
          }
        } else {
          setErrors((prev) => prev.filter((e) => e.field !== field));
        }
      } catch {
        // Schema doesn't support partial validation, skip inline validation
      }
      forceUpdate({});
    },
    [schema, fieldLabels]
  );

  const validateAll = useCallback(
    (data: T): boolean => {
      // Mark all fields as touched
      Object.keys(data).forEach((key) => touchedFieldsRef.current.add(key));

      const result = schema.safeParse(data);

      if (!result.success) {
        const newErrors: FieldError[] = result.error.issues.map((issue) => {
          const field = issue.path.join(".");
          const label = fieldLabels?.[field] || field;
          return {
            field,
            message: issue.message,
          };
        });
        setErrors(newErrors);
        forceUpdate({});
        return false;
      }

      setErrors([]);
      forceUpdate({});
      return true;
    },
    [schema, fieldLabels]
  );

  const clearErrors = useCallback(() => {
    setErrors([]);
    touchedFieldsRef.current.clear();
    forceUpdate({});
  }, []);

  const getErrorSummary = useCallback((): FieldError[] => {
    return errors;
  }, [errors]);

  return {
    errors,
    touchedFields: touchedFieldsRef.current,
    isValid: errors.length === 0,
    getFieldError,
    isFieldTouched,
    hasFieldError,
    touchField,
    validateField,
    validateAll,
    clearErrors,
    getErrorSummary,
  };
}

/**
 * Simple field-level validation rules
 */
export const validationRules = {
  required: (value: unknown, fieldName: string = "This field") => {
    if (value === null || value === undefined || value === "") {
      return `${fieldName} is required`;
    }
    return undefined;
  },
  email: (value: string) => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Please enter a valid email address";
    }
    return undefined;
  },
  phone: (value: string) => {
    if (value && !/^[\d\s\-\(\)\+]{7,}$/.test(value)) {
      return "Please enter a valid phone number";
    }
    return undefined;
  },
  minLength: (value: string, min: number, fieldName: string = "This field") => {
    if (value && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return undefined;
  },
};
