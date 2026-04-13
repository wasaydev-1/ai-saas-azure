"use client";

import "@/styles/globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background p-8 text-foreground">
        <h1 className="text-xl font-semibold">Application error</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          type="button"
          className="mt-4 rounded-md border border-border px-4 py-2 text-sm"
          onClick={() => reset()}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
