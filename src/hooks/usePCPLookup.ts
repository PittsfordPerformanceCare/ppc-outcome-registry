import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PCPLookupResult {
  phone: string;
  fax: string;
  address: string;
  confidence: "high" | "medium" | "low";
  note: string;
}

export function usePCPLookup() {
  const [isLooking, setIsLooking] = useState(false);
  const [lastResult, setLastResult] = useState<PCPLookupResult | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastLookupRef = useRef<string>("");

  const lookupPCP = useCallback(async (
    doctorName: string,
    location?: string
  ): Promise<PCPLookupResult | null> => {
    // Minimum 3 characters to trigger lookup
    if (!doctorName || doctorName.trim().length < 3) {
      return null;
    }

    // Don't re-lookup the same name
    const lookupKey = `${doctorName.trim().toLowerCase()}|${location || ""}`;
    if (lookupKey === lastLookupRef.current) {
      return lastResult;
    }

    setIsLooking(true);

    try {
      const { data, error } = await supabase.functions.invoke("lookup-pcp-contact", {
        body: { doctorName: doctorName.trim(), location },
      });

      if (error) {
        console.error("PCP lookup error:", error);
        return null;
      }

      if (data?.error) {
        console.error("PCP lookup failed:", data.error);
        return null;
      }

      lastLookupRef.current = lookupKey;
      setLastResult(data);
      return data as PCPLookupResult;
    } catch (err) {
      console.error("PCP lookup failed:", err);
      return null;
    } finally {
      setIsLooking(false);
    }
  }, [lastResult]);

  const debouncedLookup = useCallback((
    doctorName: string,
    location?: string,
    onResult?: (result: PCPLookupResult | null) => void
  ) => {
    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only lookup after user stops typing for 800ms
    debounceRef.current = setTimeout(async () => {
      const result = await lookupPCP(doctorName, location);
      if (onResult) {
        onResult(result);
      }
    }, 800);
  }, [lookupPCP]);

  const clearLookup = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    lastLookupRef.current = "";
    setLastResult(null);
  }, []);

  return {
    lookupPCP,
    debouncedLookup,
    clearLookup,
    isLooking,
    lastResult,
  };
}
