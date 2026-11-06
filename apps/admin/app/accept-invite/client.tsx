"use client";

import { useClerk, useSignUp, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SyncLoader } from "react-spinners";
import { getDashboards } from "@repo/design_system/dashboards";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/design_system/components/ui/card";
import { Input } from "@repo/design_system/components/ui/input";
import { Button } from "@repo/design_system/components/ui/button";
import { Logo } from "@repo/design_system/app/atoms/images/Logo";
import {
  ACCOUNT_CREATED_MESSAGE, FALLBACK_URL, GENERIC_INVITE_ERROR, inviteDestination, inviteErrorMessage,
} from "@/lib/admin/invite";

export default function AcceptInviteClient() {
  const ticket = useSearchParams().get("__clerk_ticket");
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();
  const submitted = useRef(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  /** Where this user belongs; reloads once if their metadata isn't there yet. */
  async function resolveDestination(): Promise<string> {
    const dashboards = getDashboards();
    const first = inviteDestination(clerk.user?.publicMetadata, dashboards);
    if (first) return first;
    try {
      await clerk.user?.reload();
    } catch {
      // fall through to the fallback
    }
    return inviteDestination(clerk.user?.publicMetadata, dashboards) ?? FALLBACK_URL;
  }

  // Someone already signed in has nothing to accept here. Never runs once a submit has started:
  // setActive flips isSignedIn and the submit handler owns the redirect.
  useEffect(() => {
    if (!isSignedIn || !user || submitted.current) return;
    submitted.current = true;
    resolveDestination().then((url) => window.location.assign(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user]);

  async function handleSubmit() {
    if (!isLoaded || !ticket || submitted.current) return;
    submitted.current = true;
    setError(null);
    setLoading(true);
    let signedUp = false;
    try {
      const result = await signUp.create({ strategy: "ticket", ticket, firstName, lastName, password });
      if (result.status !== "complete") {
        setError("Não foi possível concluir o registo. Contacte um administrador.");
        submitted.current = false;
        setLoading(false);
        return;
      }
      signedUp = true;
      await setActive({ session: result.createdSessionId });
      window.location.assign(await resolveDestination());
      // loading stays true until the page unloads
    } catch (err) {
      if (signedUp) {
        // The account exists: retrying the used ticket would fail.
        setCreated(true);
        setLoading(false);
        return;
      }
      const code = (err as { errors?: { code?: unknown }[] } | null)?.errors?.[0]?.code;
      setError(typeof code === "string" ? inviteErrorMessage(code) : GENERIC_INVITE_ERROR);
      submitted.current = false;
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
          {created ? (
            <p role="alert" className="text-sm text-center text-gray-600">
              {ACCOUNT_CREATED_MESSAGE}{" "}
              <a href="/sign-in" className="text-[#3a5a40] underline hover:text-primary">
                Ir para o início de sessão
              </a>
            </p>
          ) : !ticket ? (
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
