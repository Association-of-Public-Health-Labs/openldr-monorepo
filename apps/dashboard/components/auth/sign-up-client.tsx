"use client";

import { useSignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { SyncLoader } from "react-spinners";
import { ChevronsUpDown } from "lucide-react";
import { AuthShell } from "./auth-shell";

const dashboards = [
  {
    name: "Dashboard Unificada",
    slug: "OL",
    category: "OpenLDR",
    active: true,
  },
  {
    name: "Portal de Tuberculose",
    slug: "TB",
    category: "GenXpert",
    active: true,
  },
  {
    name: "Portal de Carga Viral",
    slug: "CV",
    category: "HIV/SIDA",
    active: false,
  },
  {
    name: "Portal de DPI",
    slug: "DPI",
    category: "HIV/SIDA",
    active: false,
  },
];

const DASHBOARD_HOME = "/summary";

export function SignUpClient() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"start" | "verify">("start");
  const [error, setError] = useState<string | null>(null);
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(dashboards[0]);
  const menuRef = useRef<HTMLDivElement>(null);

  function handleGoogleSignUp() {
    if (!isLoaded) return;
    setIsGoogleLoading(true);
    signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sign-up",
      redirectUrlComplete: DASHBOARD_HOME,
    });
  }

  async function handleSignUp() {
    if (!isLoaded) return;

    setError(null);
    setIsSignUpLoading(true);

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Não foi possível criar a conta.");
    } finally {
      setIsSignUpLoading(false);
    }
  }

  async function handleVerify() {
    if (!isLoaded) return;

    setError(null);
    setIsVerifyLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push(DASHBOARD_HOME);
        return;
      }

      setError("Não foi possível verificar o email. Confirme o código e tente novamente.");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Não foi possível verificar o email.");
    } finally {
      setIsVerifyLoading(false);
    }
  }

  return (
    <AuthShell title="Criar uma conta" subtitle="Dashboard Unificada OpenLDR">
      {step === "start" ? (
        <>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSignUp();
            }}
          >
            <div className="relative" ref={menuRef}>
              <button
                className="flex w-full items-center gap-3 rounded-lg border border-[#e5e5e5] bg-white px-3 py-3 text-left"
                onClick={() => setMenuOpen((open) => !open)}
                type="button"
              >
                <span className="grid size-8 place-items-center rounded-md bg-[#00B000] text-xs font-black text-white">
                  {selectedDashboard.slug}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-[#222]">{selectedDashboard.name}</span>
                  <span className="block truncate text-xs font-semibold text-[#8996a0]">
                    {selectedDashboard.category}
                  </span>
                </span>
                <ChevronsUpDown size={18} />
              </button>
              {menuOpen && (
                <div className="absolute z-20 mt-2 w-full rounded-lg border border-[#e5e5e5] bg-white p-1 shadow-lg">
                  <p className="px-2 py-1 text-xs font-bold text-[#8996a0]">Portais</p>
                  {dashboards.map((dashboard) => (
                    <button
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-semibold text-[#222] disabled:cursor-not-allowed disabled:opacity-45 hover:bg-[#f4f4f4]"
                      disabled={!dashboard.active}
                      key={dashboard.name}
                      onClick={() => {
                        setSelectedDashboard(dashboard);
                        setMenuOpen(false);
                      }}
                      type="button"
                    >
                      <span className="grid size-7 place-items-center rounded border text-xs font-black">
                        {dashboard.slug}
                      </span>
                      <span className="flex-1">{dashboard.name}</span>
                      {!dashboard.active && <span className="text-xs text-[#8996a0]">Em breve</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              className="h-12 w-full rounded-lg border border-[#e5e5e5] px-3 text-sm font-semibold text-[#222] outline-none transition focus:border-[#00B000]"
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Nome"
              required
              type="text"
              value={firstName}
            />
            <input
              className="h-12 w-full rounded-lg border border-[#e5e5e5] px-3 text-sm font-semibold text-[#222] outline-none transition focus:border-[#00B000]"
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Apelido"
              required
              type="text"
              value={lastName}
            />
            <input
              autoComplete="email"
              className="h-12 w-full rounded-lg border border-[#e5e5e5] px-3 text-sm font-semibold text-[#222] outline-none transition focus:border-[#00B000]"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              required
              type="email"
              value={email}
            />
            <input
              autoComplete="new-password"
              className="h-12 w-full rounded-lg border border-[#e5e5e5] px-3 text-sm font-semibold text-[#222] outline-none transition focus:border-[#00B000]"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
            <button
              className="flex h-12 w-full items-center justify-center rounded-lg bg-[#00B000] text-sm font-black text-white transition hover:bg-[#008f00] disabled:cursor-wait disabled:opacity-70"
              disabled={isSignUpLoading}
              type="submit"
            >
              {isSignUpLoading ? <SyncLoader color="#ffffff" size={8} /> : "Criar uma conta"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-[#e5e5e5]" />
            <span className="text-xs font-semibold text-[#8996a0]">ou</span>
            <span className="h-px flex-1 bg-[#e5e5e5]" />
          </div>

          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#e5e5e5] text-sm font-bold text-[#222] transition hover:bg-[#f4f4f4] disabled:cursor-wait disabled:opacity-70"
            disabled={isGoogleLoading}
            onClick={handleGoogleSignUp}
            type="button"
          >
            {isGoogleLoading ? (
              <SyncLoader color="#222222" size={8} />
            ) : (
              <>
                <FcGoogle size={24} />
                <span>Entrar com uma conta Gmail</span>
              </>
            )}
          </button>
        </>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleVerify();
          }}
        >
          <p className="text-center text-sm font-semibold text-[#8996a0]">
            Enviámos um código de verificação para o seu email.
          </p>
          <input
            className="h-12 w-full rounded-lg border border-[#e5e5e5] px-3 text-sm font-semibold text-[#222] outline-none transition focus:border-[#00B000]"
            onChange={(event) => setCode(event.target.value)}
            placeholder="Código de verificação"
            required
            value={code}
          />
          <button
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#00B000] text-sm font-black text-white transition hover:bg-[#008f00] disabled:cursor-wait disabled:opacity-70"
            disabled={isVerifyLoading}
            type="submit"
          >
            {isVerifyLoading ? <SyncLoader color="#ffffff" size={8} /> : "Verificar Email"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-xs text-[#8996a0]">
        Já tem uma conta?{" "}
        <Link className="font-bold text-[#00B000] hover:underline" href="/sign-in">
          Entrar
        </Link>
      </p>
      {error && <p className="mt-3 text-center text-sm font-semibold text-red-600">{error}</p>}
    </AuthShell>
  );
}
