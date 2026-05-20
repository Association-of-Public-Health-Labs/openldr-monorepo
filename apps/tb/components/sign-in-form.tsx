"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function SignInForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"start" | "verify">("start");

  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!isLoaded) return;
    try {
      await signIn.create({ identifier: email });
      setStep("verify");
    } catch (err) {
      setError(err.errors?.[0]?.message || "Failed to send code");
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/"; // Or use next/router if preferred
      }
    } catch (err) {
      setError(err.errors?.[0]?.message || "Verification failed");
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">Entrar</h2>

      {step === "start" && (
        <>
          <Input
            placeholder="Seu email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleSignIn}>Enviar código</Button>
        </>
      )}

      {step === "verify" && (
        <>
          <Input
            placeholder="Código de verificação"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button onClick={handleVerify}>Verificar</Button>
        </>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
