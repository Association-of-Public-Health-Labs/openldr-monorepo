"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@repo/design_system/components/ui/button";

export default function NoAccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">Sem acesso</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        A sua conta não tem permissão para aceder à administração. Contacte um administrador se precisar de acesso.
      </p>
      <SignOutButton redirectUrl="/sign-in">
        <Button variant="outline">Terminar sessão</Button>
      </SignOutButton>
    </div>
  );
}
