"use client";

import { useCallback, useEffect, useState } from "react";

type DashboardKpis = {
  activeEmployees: number;
  openAlerts: number;
  onTimePercent: number;
  journeysToday: number;
};

const MOCK_KPIS: DashboardKpis = {
  activeEmployees: 128,
  openAlerts: 7,
  onTimePercent: 92,
  journeysToday: 34,
};

export function useDashboardKpis() {
  const [data, setData] = useState<DashboardKpis | undefined>(undefined);
  const [isPending, setPending] = useState(true);
  const [isError, setError] = useState(false);
  const [error, setErr] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setPending(true);
    setError(false);
    setErr(null);
    try {
      // Mock-only: keep dashboard usable without any backend/API.
      await new Promise((r) => setTimeout(r, 150));
      setData(MOCK_KPIS);
    } catch (e) {
      setError(true);
      setErr(e instanceof Error ? e : new Error("Failed to load KPIs"));
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isPending, isError, error, refetch: load };
}
