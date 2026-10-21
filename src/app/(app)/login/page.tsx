import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { LoginForm } from "@/components/account/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to EaseMind with an email link or Google. An account is optional.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        eyebrow="Account"
        title={
          <>
            Welcome <span className="italic text-ember">back</span>
          </>
        }
        description="Sign in to keep your progress safe across devices. Totally optional."
      />
      <LoginForm />
    </div>
  );
}
