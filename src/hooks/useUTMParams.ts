import { useEffect, useState } from "react";

export type UTMParams = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
};

export function useUTMParams(): UTMParams {
  const [utm, setUtm] = useState<UTMParams>({
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    setUtm({
      utm_source: url.searchParams.get("utm_source"),
      utm_medium: url.searchParams.get("utm_medium"),
      utm_campaign: url.searchParams.get("utm_campaign"),
      utm_content: url.searchParams.get("utm_content"),
    });
  }, []);

  return utm;
}
