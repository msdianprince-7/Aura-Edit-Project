import { signIn } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import AuthBranding from "@/components/auth/AuthBranding";
import PasswordInput from "@/components/ui/PasswordInput";
import AuthInput from "@/components/ui/AuthInput";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const resolvedParams = await searchParams;
  const hasError = resolvedParams?.error === "CredentialsSignin";
  const justRegistered = resolvedParams?.registered === "true";

  const loginWithEmail = async (formData: FormData) => {
    "use server";
    try {
      await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirectTo: "/dashboard",
      });
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      console.error("Login failed");
      return redirect("/login?error=CredentialsSignin");
    }
  };

  const loginWithGithub = async () => {
    "use server";
    await signIn("github", { redirectTo: "/dashboard" });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 -mt-6">
      <div
        className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden"
        style={{ animation: "slide-up 0.6s ease forwards" }}
      >
        {/* Left: Branding panel */}
        <AuthBranding />

        {/* Right: Form panel */}
        <div
          className="flex flex-col justify-center px-8 py-10 lg:px-12 lg:py-12"
          style={{
            background: "var(--bg-surface)",
            borderRight: "1px solid var(--border-subtle)",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="lg:hidden mb-6">
              <span className="text-xl font-bold tracking-tighter" style={{ color: "var(--text-primary)" }}>
                Aura<span style={{ color: "var(--accent-lavender)" }}>Edit</span>
              </span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Welcome back
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Success banner */}
          {justRegistered && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{
                background: "rgba(74, 222, 128, 0.08)",
                border: "1px solid rgba(74, 222, 128, 0.2)",
                color: "#4ade80",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12" />
              </svg>
              Account created! Sign in to get started.
            </div>
          )}

          {/* Error banner */}
          {hasError && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{
                background: "rgba(240, 112, 104, 0.08)",
                border: "1px solid rgba(240, 112, 104, 0.2)",
                color: "var(--accent-rose)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              Invalid email or password. Please try again.
            </div>
          )}

          {/* GitHub button */}
          <form action={loginWithGithub}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Continue with GitHub
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              or
            </span>
            <div className="h-px flex-1" style={{ background: "var(--border-subtle)" }} />
          </div>

          {/* Email form */}
          <form action={loginWithEmail} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Email
              </label>
              <AuthInput name="email" type="email" placeholder="you@example.com" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <PasswordInput name="password" />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
                color: "var(--bg-deep)",
                boxShadow: "0 4px 15px rgba(240, 112, 104, 0.25)",
              }}
            >
              Sign In
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold transition-colors"
              style={{ color: "var(--accent-lavender)" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}