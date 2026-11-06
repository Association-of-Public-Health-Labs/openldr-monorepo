"use client";

import { Button } from "@repo/design_system/components/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm">Ocorreu um erro ao mostrar esta página.</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
