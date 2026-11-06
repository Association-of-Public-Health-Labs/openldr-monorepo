"use client";

import { useAuth, useClerk, useSignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SyncLoader } from "react-spinners";
import { getDashboards } from "@repo/design_system/dashboards";
import { parseAccess } from "@repo/design_system/lib/access";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design_system/components/ui/card";
import { Input } from "@repo/design_system/components/ui/input";
import { Button } from "@repo/design_system/components/ui/button";
import { Logo } from "@repo/design_system/app/atoms/images/Logo";
import { GENERIC_INVITE_ERROR, inviteErrorMessage, postInviteUrl } from "@/lib/admin/invite";

/** Cross-origin target: the user's first dashboard, or the admin app `/` (its middleware routes them on) if their metadata isn't loaded yet. */
function destination(publicMetadata: unknown): string {
  const access = parseAccess(publicMetadata);
  return access ? postInviteUrl(access, getDashboards()) : "/";
}

export default function AcceptInviteClient() {
  const ticket = useSearchParams().get("__clerk_ticket");
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn } = useAuth();
  const clerk = useClerk();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Someone already signed in has nothing to accept here.
  useEffect(() => {
    if (isSignedIn) window.location.assign("/");
  }, [isSignedIn]);

  async function handleSubmit() {
    if (!isLoaded || !ticket) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signUp.create({ strategy: "ticket", ticket, firstName, lastName, password });
      if (result.status !== "complete") {
        setError("Não foi possível concluir o registo. Contacte um administrador.");
        return;
      }
      await setActive({ session: result.createdSessionId });
      window.location.assign(destination(clerk.user?.publicMetadata));
    } catch (err) {
      const code = (err as { errors?: { code?: unknown }[] } | null)?.errors?.[0]?.code;
      setError(typeof code === "string" ? inviteErrorMessage(code) : GENERIC_INVITE_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md min-w-[300px] rounded-4xl shadow-lg border-0 py-8 px-4 lg:px-6">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <Logo width={75} />
          </div>
          <CardTitle className="text-center text-lg font-bold text-[#222]">Republica de Moçambique</CardTitle>
          <CardTitle className="text-center text-lg font-bold text-[#222]">Ministério da Saúde</CardTitle>
          <CardTitle className="text-center text-2xl font-extrabold text-primary">Aceitar convite</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          {!ticket ? (
            <p className="text-sm text-center text-gray-600">
              Esta ligação de convite não é válida. Abra a ligação enviada no e-mail de convite ou peça um novo
              convite a um administrador.
            </p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <Input
                placeholder="Primeiro nome"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                placeholder="Apelido"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <Input
                placeholder="Palavra-passe"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button className="w-full" type="submit" disabled={loading || !isLoaded}>
                {loading ? <SyncLoader color="#ffffff" size={8} /> : "Criar conta"}
              </Button>
            </form>
          )}
          {error && (
            <p role="alert" className="text-red-500 text-sm text-center mt-2">
              {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
