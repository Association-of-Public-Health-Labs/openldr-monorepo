"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { SyncLoader } from "react-spinners";
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

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<typeof dashboards[number]>(dashboards[0]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Add loading states
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Redirect if already signed in
  if (isSignedIn) {
    window.location.href = "/";
    return null;
  }

  // Google OAuth handler
  function handleGoogleSignIn() {
    if (!isLoaded) return;
    setIsGoogleLoading(true);
    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/",
      redirectUrlComplete: "/",
    });
  }

  // Email/password sign in handler
  async function handleSignIn() {
    if (!isLoaded) return;
    setError(null);
    setIsSignInLoading(true);
    
    try {
      console.log("Attempting sign in with email:", email);
      
      const result = await signIn.create({
        identifier: email,
        password,
      });
      
      console.log("Sign in result:", result);
      
      if (result.status === "complete") {
        console.log("Sign in successful!");
        await setActive({ session: result.createdSessionId });
        window.location.href = "/";
      } else {
        console.log("Sign in status:", result.status);
        setError("Sign in failed");
      }
    } catch (err: any) {
      console.log("Sign in error:", err);
      
      // Handle session already exists error
      if (err.errors?.[0]?.message?.includes("Session already exists")) {
        console.log("Session already exists, redirecting to dashboard");
        window.location.href = "/";
      } else {
        setError(err.errors?.[0]?.message || "Sign in failed");
      }
    } finally {
      setIsSignInLoading(false);
    }
  }

  return (
    <Card className="w-full h-auto min-h-[70%] max-w-md min-w-[300px] rounded-4xl shadow-lg border-0 py-8 px-4 lg:px-6">
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
          Aceder ao Portal
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5">
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            handleSignIn();
          }}
        >
          {/* Dashboard dropdown */}
          <DropdownMenu>
                <DropdownMenuTrigger className="w-full" asChild>
                  <Button
                    ref={triggerRef}
                    size="default"
                    variant="outline"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground py-6 rounded-lg"
                  >
                    <div className="flex aspect-square size-6 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs">
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
            placeholder="Email address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full mb-4"
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button
            className="w-full"
            type="submit"
            disabled={isSignInLoading}
          >
            {isSignInLoading ? (
              <SyncLoader color="#ffffff" size={8} />
            ) : (
              "Aceder a conta"
            )}
          </Button>
        </form>
        
        <div className="flex items-center my-4">
          <Separator className="flex-1" />
          <span className="mx-2 text-xs text-gray-400">ou use um email Google</span>
          <Separator className="flex-1" />
        </div>
        
        <div className="flex justify-center gap-3 mb-2">
          <Button
            variant="outline"
            className="rounded-lg w-full p-2 flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
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
              Não tem uma conta?{" "}
              <a
                href="/sign-up"
                className="text-[#00B000] font-semibold hover:underline"
              >
                Criar uma conta
              </a>
            </p>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
      </CardContent>
    </Card>
  );
}
