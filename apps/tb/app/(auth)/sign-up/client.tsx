"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

import { ChevronsUpDown, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

import { Logo } from "@repo/design_system/atoms/images/Logo"
import { Separator } from "../../../components/ui/separator"; 

const dashboards = [
  {
    name: "Portal de Tuberculose",
    slug: "TB",
    category: "GenXpert",
  },
  {
    name: "Portal de DPI",
    slug: "DPI",
    category: "HIV/SIDA",
  },
  {
    name: "Portal de Carga Viral",
    slug: "CV",
    category: "HIV/SIDA",
  },
]

export default function SignUpPage() {
  const { signUp, isLoaded } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"start" | "verify">("start");
  const [error, setError] = useState<string | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<typeof dashboards[number]>(dashboards[0]);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Google OAuth handler
  function handleGoogleSignUp() {
    if (!isLoaded) return;
    signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/",
      redirectUrlComplete: "/",
    });
  }

  // // Email/password sign up handler
  async function handleSignUp() {
    if (!isLoaded) return;
    setError(null);
    try {
      await signUp.create({
        emailAddress: email,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign up failed");
    }
  }

  // // Email code verification handler
  async function handleVerify() {
    if (!isLoaded) return;
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Verification failed");
    }
  }

  return (
    <Card className="w-full h-auto max-w-lg rounded-4xl shadow-lg border-0 py-8 px-4 md:px-10">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <Logo width={80} />
        </div>
        <CardTitle className="text-center text-xl font-bold text-[#222]">
          Republica de Moçambique
        </CardTitle>
        <CardTitle className="text-center text-xl font-bold text-[#222]">
          Ministério da Saúde
        </CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        {step === "start" && (
          <>
            <form
              className="space-y-4"
              onSubmit={e => {
                e.preventDefault();
                handleSignUp();
              }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full" asChild>
                  <Button
                    ref={triggerRef}
                    size="lg"
                    variant="outline"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-7 rounded-lg"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      {selectedDashboard?.slug}
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {selectedDashboard?.name}
                      </span>
                      <span className="truncate text-xs">
                        {selectedDashboard?.category}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-full min-w-full max-w-full rounded-lg"
                  align="start"
                  // side={isMobile ? "bottom" : "right"}
                  sideOffset={4}
                  style={{
                    width: triggerRef.current?.offsetWidth || "auto",
                  }}
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Portais
                  </DropdownMenuLabel>
                  {dashboards?.map((dashboard, index) => (
                    <DropdownMenuItem
                      key={dashboard.name}
                      onClick={() => setSelectedDashboard(dashboard)}
                      className="gap-2 p-2"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        {dashboard?.slug}
                      </div>
                      {dashboard.name}
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                placeholder="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full mb-4 h-12 rounded-lg"
              />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full mb-4 h-12 rounded-lg"
              />
              <Button
                className="w-full h-12 rounded-lg"
                type="submit"
              >
                Criar uma conta
              </Button>
            </form>
            <div className="flex items-center my-4">
              <Separator className="flex-1" />
              <span className="mx-2 text-xs text-gray-400">ou</span>
              <Separator className="flex-1" />
            </div>
            <div className="flex justify-center gap-3 mb-4">
              <Button
                variant="outline"
                className="w-full h-12 rounded-lg p-2 flex items-center justify-center gap-2"
                onClick={handleGoogleSignUp}
                type="button"
              >
                <FcGoogle size={24} />
                <span>Entrar com uma conta Gmail</span>
              </Button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Ao criar uma conta, você concorda com os{" "}
              <a
                href="/terms"
                className="text-[#3a5a40] underline hover:text-[#8cc84b]"
              >
                Termos de uso
              </a>{" "}
              e{" "}
              <a
                href="/privacy"
                className="text-[#3a5a40] underline hover:text-[#8cc84b]"
              >
                Política de protecção de dados
              </a>
              .
            </p>
            <p className="text-sm text-center mt-4">
              Já tem uma conta?{" "}
              <a
                href="/sign-in"
                className="text-[#7bb661] font-semibold hover:underline"
              >
                Entrar
              </a>
            </p>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </>
        )}

        {step === "verify" && (
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <Input
              placeholder="Verification code"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
            />
            <Button className="w-full bg-[#a3d977] hover:bg-[#8cc84b]" type="submit">
              Verify email
            </Button>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
