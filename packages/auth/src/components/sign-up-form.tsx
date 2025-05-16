"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";   

export function SignUpForm() {
  const { signUp, isLoaded } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"start" | "verify">("start");
  const [error, setError] = useState<string | null>(null);

  // Google OAuth handler
  function handleGoogleSignUp() {
    if (!isLoaded) return;
    signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/",
      redirectUrlComplete: "/",
    });
  }

  // Email/password sign up handler
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

  // Email code verification handler
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
    <div className="relative min-h-screen w-[300px] flex bg-yellow-500">
      {/* Background Illustration */}
      {/* <div className="absolute inset-0 z-0">
        <Image
          src="/signup-illustration.webp"
          alt="Sign up illustration"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
          priority
        />
      </div> */}

      {/* Right-side Form */}
      <div className="absolute right-0 bottom-0 top-0 z-10 flex min-h-screen h-full w-[480px] items-center justify-center shadow-2xl bg-yellow-400">
        <Card className="w-full max-w-md rounded-2xl shadow-lg border-0 p-8">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-center mb-2">
              <Image src="/logo.svg" alt="Logo" width={36} height={36} className="mr-2" />
              <span className="text-2xl font-bold text-[#3a5a40]">messimo</span>
            </div>
            <CardTitle className="text-center text-3xl font-bold text-[#222]">
              Create account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === "start" && (
              <>
                <form
                  className="space-y-4"
                  onSubmit={e => {
                    e.preventDefault();
                    handleSignUp();
                  }}
                >
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
                  >
                    Criar uma conta
                  </Button>
                </form>
                <div className="flex items-center my-4">
                  <Separator className="flex-1" />
                  <span className="mx-2 text-xs text-gray-400">or sign up with</span>
                  <Separator className="flex-1" />
                </div>
                <div className="flex justify-center gap-3 mb-2">
                  <Button
                    variant="outline"
                    className="rounded-full p-2"
                    onClick={handleGoogleSignUp}
                    type="button"
                  >
                    <Image src="/google.svg" alt="Google" width={24} height={24} />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full p-2"
                    type="button"
                    disabled
                  >
                    <Image src="/microsoft.svg" alt="Microsoft" width={24} height={24} />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full p-2"
                    type="button"
                    disabled
                  >
                    <Image src="/github.svg" alt="GitHub" width={24} height={24} />
                  </Button>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                  By creating an account you agree to Messimo's{" "}
                  <a
                    href="/terms"
                    className="text-[#3a5a40] underline hover:text-[#8cc84b]"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="text-[#3a5a40] underline hover:text-[#8cc84b]"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
                <p className="text-sm text-center mt-4">
                  Have an account?{" "}
                  <a
                    href="/sign-in"
                    className="text-[#7bb661] font-semibold hover:underline"
                  >
                    Log in
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
      </div>
    </div>
  );
}
