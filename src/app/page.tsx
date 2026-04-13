import Link from "next/link";
import { APP_ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-14">
      <header className="flex items-center justify-between">
        <div className="text-lg font-semibold">AI SaaS</div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href={APP_ROUTES.login}>Sign in</Link>
          </Button>
          <Button asChild>
            <Link href={APP_ROUTES.dashboard}>Open dashboard</Link>
          </Button>
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
          <Button asChild>
            <Link href={APP_ROUTES.generate}>Generate</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={APP_ROUTES.upload}>Upload</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={APP_ROUTES.history}>History</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t pt-6 text-sm text-slate-500">
        Azure-ready: Static Web Apps, Functions, Blob Storage, Cosmos DB, OpenAI,
        Logic Apps.
      </footer>
    </div>
  );
}
