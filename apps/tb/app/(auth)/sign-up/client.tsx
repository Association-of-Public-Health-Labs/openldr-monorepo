"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { SyncLoader } from "react-spinners"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

import { ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

import { Logo } from "@repo/design_system/app/atoms/images/Logo"
import { Separator } from "../../../components/ui/separator"; 

const dashboards = [
  {
    name: "Portal de Tuberculose",
    slug: "TB",
    category: "GenXpert",
    active: true,
  },
  {
    name: "Portal de DPI",
    slug: "DPI",
    category: "HIV/SIDA",
    active: false,
  },
  {
    name: "Portal de Carga Viral",
    slug: "CV",
    category: "HIV/SIDA",
    active: false,
  },
]

export default function SignUpPage() {
  const { signUp, isLoaded } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"start" | "verify">("start");
  const [error, setError] = useState<string | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<typeof dashboards[number]>(dashboards[0]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Add loading states
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google OAuth handler
  function handleGoogleSignUp() {
    if (!isLoaded) return;
    setIsGoogleLoading(true);
    signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/",
      redirectUrlComplete: "/",
    });
  }

  async function handleSignUp() {
    if (!isLoaded) return;
    setError(null);
    setIsSignUpLoading(true);
    
    // Add validation
    if (!firstName.trim()) {
      setError("First name is required");
      setIsSignUpLoading(false);
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required");
      setIsSignUpLoading(false);
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      setIsSignUpLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      setIsSignUpLoading(false);
      return;
    }
    
    try {
      const signUpResult = await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });
      const verificationResult = await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      
      setStep("verify");
    } catch (err: any) {
      console.log("Sign up error:", err);
      setError(err.errors?.[0]?.message || "Sign up failed");
    } finally {
      setIsSignUpLoading(false);
    }
  }

  // // Email code verification handler
  async function handleVerify() {
    if (!isLoaded) return;
    setError(null);
    setIsVerifyLoading(true);
    
    try {
      console.log("Attempting verification with code:", code);
      const result = await signUp.attemptEmailAddressVerification({ code });
      console.log("Full verification result:", JSON.stringify(result, null, 2));
      
      // Add this to check if account was created
      console.log("Created session ID:", result.createdSessionId);
      console.log("User ID:", result.createdUserId);
      
      switch (result.status) {
        case "complete":
          console.log("Verification successful...");
          window.location.href = "/";
          break;
          
        case "missing_requirements":
          console.log("Missing requirements detected:");
          console.log("- Email verification status:", result.verifications?.emailAddress?.status);
          
          if (result.verifications?.emailAddress?.status === "verified") {
            console.log("Email verified, account created successfully!");
            console.log("User ID:", result.createdUserId);
            window.location.href = "/";
          } else {
            setError("Email verification failed. Please check your code and try again.");
          }
          break;
          
        default:
          console.log("Unexpected status:", result.status);
          setError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.log("Verification error:", err);
      setError(err.errors?.[0]?.message || "Verification failed");
    } finally {
      setIsVerifyLoading(false);
    }
  }

  return (
    <Card className="w-full h-auto min-h-[40%] max-w-lg min-w-[500px] rounded-4xl shadow-lg border-0 py-8 px-4 md:px-10">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <Logo width={75} />
        </div>
        <CardTitle className="text-center text-lg font-bold text-[#222]">
          Republica de Moçambique
        </CardTitle>
        <CardTitle className="text-center text-lg font-bold text-[#222]">
          Ministério da Saúde
        </CardTitle>

        <CardTitle className="text-center text-2xl font-extrabold text-[#00B000]">
          Criar uma conta
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
                      disabled={!dashboard.active}
                    >
                      <div className="flex size-8 items-center justify-center rounded-sm border">
                        {dashboard?.slug}
                      </div>
                      {dashboard.name}
                      <DropdownMenuShortcut>{dashboard.active ? "" : "Em breve"}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                placeholder="Nome"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                className="w-full mb-4 h-12 rounded-lg"
              />
              <Input
                placeholder="Apelido"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                className="w-full mb-4 h-12 rounded-lg"
              />
              <Input
                placeholder="Email"
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
                disabled={isSignUpLoading}
              >
                {isSignUpLoading ? (
                  <SyncLoader color="#ffffff" size={8} />
                ) : (
                  "Criar uma conta"
                )}
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
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <SyncLoader color="#000000" size={8} />
                ) : (
                  <>
                    <FcGoogle size={24} />
                    <span>Entrar com uma conta Gmail</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">
              Ao criar uma conta, você concorda com os{" "}
              <a
                href="/terms"
                className="text-[#3a5a40] underline hover:text-[#00B000]"
              >
                Termos de uso
              </a>{" "}
              e{" "}
              <a
                href="/privacy"
                className="text-[#3a5a40] underline hover:text-[#00B000]"
              >
                Política de protecção de dados
              </a>
              .
            </p>
            <p className="text-sm text-center mt-4">
              Já tem uma conta?{" "}
              <a
                href="/sign-in"
                className="text-[#00B000] font-semibold hover:underline"
              >
                Entrar
              </a>
            </p>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </>
        )}

        {(step === "verify") && (
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <p className="text-sm text-center mt-2">
              Por favor, verifique o seu email para continuar.
            </p>
            <Input
              placeholder="Código de verificação"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
            />
            <Button 
              className="w-full bg-[#00B000] hover:bg-green-900" 
              type="submit"
              disabled={isVerifyLoading}
            >
              {isVerifyLoading ? (
                <SyncLoader color="#ffffff" size={8} />
              ) : (
                "Verificar Email"
              )}
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
