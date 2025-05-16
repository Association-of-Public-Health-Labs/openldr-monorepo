"use client";

import { SignUpForm } from "@repo/auth-v2";
import { Button } from "../components/ui/button";

export default function ClientSignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUpForm />
      <Button>Click me</Button>
    </div>
  );
}
