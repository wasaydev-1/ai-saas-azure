"use client";

import { Button } from "@/shared/ui/button";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-3 p-8">
      <h2 className="text-lg font-semibold">Module failed to load</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <Button type="button" variant="secondary" onClick={() => reset()}>
        Retry
      </Button>
    </div>
  );
}
