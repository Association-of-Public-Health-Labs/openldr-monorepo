"use client";

import { useSignIn, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { SyncLoader } from "react-spinners";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@repo/design_system/components/ui/card";
import { Input } from "@repo/design_system/components/ui/input";
import { Button } from "@repo/design_system/components/ui/button";
import { GENERIC_SIGN_IN_ERROR, signInErrorMessage } from "@/lib/admin/sign-in-errors";

import { Logo } from "@repo/design_system/app/atoms/images/Logo"
import { Separator } from "@repo/design_system/components/ui/separator"; 

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Add loading states
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

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
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        setError(GENERIC_SIGN_IN_ERROR);
      }
    } catch (err: unknown) {
      const message = signInErrorMessage(err);
      if (message === null) {
        router.push("/");
      } else {
        setError(message);
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

        <CardTitle className="text-center text-2xl font-extrabold text-primary">
          Administração
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
          <Input
            placeholder="Endereço de e-mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full mb-4"
          />
          <Input
            placeholder="Palavra-passe"
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
        
        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
