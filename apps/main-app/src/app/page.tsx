import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Next.js 15 + Tailwind + shadcn/ui</h1>
        <p className="text-muted-foreground">
          Starter wired up in a Turborepo workspace.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </div>
    </main>
  );
}
