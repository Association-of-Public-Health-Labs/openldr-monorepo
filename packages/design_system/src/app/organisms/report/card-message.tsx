"use client";

import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";

export function CardMessage({
  tone,
  message,
  onRetry,
}: {
  tone: "error" | "empty";
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border p-6 text-center text-sm",
        tone === "error" ? "border-red-500/20 bg-red-500/10 text-red-500" : "border-dashed text-muted-foreground",
      )}
    >
      <p>{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
