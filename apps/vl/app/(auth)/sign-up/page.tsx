import { AuthBackdrop } from "@repo/design_system/app/organisms/auth/AuthBackdrop";
import SignUpClientPage from "./client";

export default function SignUpPage() {
  return (
    <AuthBackdrop backgroundSrc="/login-bg.jpg">
      <SignUpClientPage />
    </AuthBackdrop>
  );
}
