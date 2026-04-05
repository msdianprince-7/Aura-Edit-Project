import { registerUserAction } from "./action";
import AuthBranding from "@/components/auth/AuthBranding";
import PasswordInput from "@/components/ui/PasswordInput";
import AuthInput from "@/components/ui/AuthInput";
import Link from "next/link";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedParams = await searchParams;
  const isUserExists = resolvedParams?.error === "UserExists";

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
              Create your account
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
              Start curating your digital aesthetic today
            </p>
          </div>

          {/* Error banner */}
          {isUserExists && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{
                background: "rgba(240, 196, 100, 0.08)",
                border: "1px solid rgba(240, 196, 100, 0.2)",
                color: "var(--accent-amber)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              That username or email is already taken.
            </div>
          )}

          {/* Form */}
          <form action={registerUserAction} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Username
              </label>
              <AuthInput name="username" placeholder="your_username" prefix="@" />
            </div>

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
              <PasswordInput name="password" showStrength />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg mt-2"
              style={{
                background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
                color: "var(--bg-deep)",
                boxShadow: "0 4px 15px rgba(240, 112, 104, 0.25)",
              }}
            >
              Create Account
            </button>
          </form>

          {/* Terms */}
          <p className="mt-4 text-center text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold transition-colors"
              style={{ color: "var(--accent-lavender)" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}