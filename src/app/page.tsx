import Link from "next/link";
import { APP_ROUTES } from "@/shared/constants/routes";
import { cn } from "@/shared/utils/cn";

const linkButtonClassName =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-14">
      <header className="flex items-center justify-between">
        <div className="text-lg font-semibold">AI SaaS</div>
        <div className="flex items-center gap-3">
          <Link
            href={APP_ROUTES.login}
            className={cn(
              linkButtonClassName,
              "border border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            Sign in
          </Link>
          <Link
            href={APP_ROUTES.dashboard}
            className={cn(
              linkButtonClassName,
              "bg-primary text-primary-foreground shadow-sm hover:opacity-90",
            )}
          >
            Open dashboard
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center py-16">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900">
          Generate, upload, and save content — all in one place.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600">
          Generate AI content, upload files, keep a history of everything you
          create, and submit feedback forms.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={APP_ROUTES.generate}
            className={cn(
              linkButtonClassName,
              "bg-primary text-primary-foreground shadow-sm hover:opacity-90",
            )}
          >
            Generate
          </Link>
          <Link
            href={APP_ROUTES.upload}
            className={cn(
              linkButtonClassName,
              "border border-border bg-muted text-foreground hover:bg-muted/80",
            )}
          >
            Upload
          </Link>
          <Link
            href={APP_ROUTES.history}
            className={cn(
              linkButtonClassName,
              "border border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            History
          </Link>
        </div>
      </main>

      <footer className="border-t pt-6 text-sm text-slate-500">
        Azure-ready: Static Web Apps, Functions, Blob Storage, Cosmos DB, OpenAI,
        Logic Apps.
      </footer>
    </div>
  );
}
