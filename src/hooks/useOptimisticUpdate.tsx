import { useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface OptimisticUpdateOptions<T> {
  /** Function to perform the actual mutation */
  mutationFn: () => Promise<T>;
  /** Called immediately with optimistic data */
  onOptimisticUpdate?: () => void;
  /** Called when mutation succeeds */
  onSuccess?: (data: T) => void;
  /** Called when mutation fails, should rollback optimistic changes */
  onRollback?: () => void;
  /** Success message to show */
  successMessage?: string;
  /** Error message to show */
  errorMessage?: string;
}

interface OptimisticState {
  isPending: boolean;
  isOptimistic: boolean;
}

/**
 * Hook for handling optimistic updates with automatic rollback on failure.
 * Provides immediate UI feedback while the actual mutation completes.
 */
export function useOptimisticUpdate<T>() {
  const [state, setState] = useState<OptimisticState>({
    isPending: false,
    isOptimistic: false,
  });
  const { toast } = useToast();
  const rollbackRef = useRef<(() => void) | null>(null);

  const execute = useCallback(
    async (options: OptimisticUpdateOptions<T>): Promise<T | null> => {
      const {
        mutationFn,
        onOptimisticUpdate,
        onSuccess,
        onRollback,
        successMessage,
        errorMessage = "Something went wrong. Changes have been reverted.",
      } = options;

      // Store rollback function
      rollbackRef.current = onRollback || null;

      // Apply optimistic update immediately
      setState({ isPending: true, isOptimistic: true });
      onOptimisticUpdate?.();

      try {
        // Perform actual mutation
        const result = await mutationFn();

        // Success - clear optimistic state
        setState({ isPending: false, isOptimistic: false });
        onSuccess?.(result);

        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage,
          });
        }

        return result;
      } catch (error) {
        // Rollback optimistic changes
        setState({ isPending: false, isOptimistic: false });
        onRollback?.();
        rollbackRef.current = null;

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        console.error("Optimistic update failed:", error);
        return null;
      }
    },
    [toast]
  );

  const rollback = useCallback(() => {
    if (rollbackRef.current) {
      rollbackRef.current();
      rollbackRef.current = null;
      setState({ isPending: false, isOptimistic: false });
    }
  }, []);

  return {
    execute,
    rollback,
    ...state,
  };
}

/**
 * Simplified hook for toggle-style optimistic updates (like/favorite/bookmark).
 */
export function useOptimisticToggle(
  initialValue: boolean,
  onToggle: (newValue: boolean) => Promise<void>
) {
  const [value, setValue] = useState(initialValue);
  const [isOptimistic, setIsOptimistic] = useState(false);
  const { toast } = useToast();

  const toggle = useCallback(async () => {
    const previousValue = value;
    const newValue = !value;

    // Optimistically update
    setValue(newValue);
    setIsOptimistic(true);

    try {
      await onToggle(newValue);
      setIsOptimistic(false);
    } catch (error) {
      // Rollback
      setValue(previousValue);
      setIsOptimistic(false);
      toast({
        title: "Error",
        description: "Failed to update. Please try again.",
        variant: "destructive",
      });
    }
  }, [value, onToggle, toast]);

  return {
    value,
    toggle,
    isOptimistic,
    setValue,
  };
}
