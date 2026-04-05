
import { signIn } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isRedirectError } from "next/dist/client/components/redirect-error";


export default function LoginPage() {

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
    <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-zinc-400 mt-2">Log in to your AuraEdit dashboard</p>
      </div>

      <form action={loginWithEmail} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-400">Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white mt-1 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-400">Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white mt-1 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Sign In
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px bg-white/10 flex-1"></div>
        <span className="text-zinc-500 text-sm">OR</span>
        <div className="h-px bg-white/10 flex-1"></div>
      </div>

      <form action={loginWithGithub}>
        <button
          type="submit"
          className="w-full bg-[#24292F] text-white font-bold py-3 rounded-lg hover:bg-[#24292F]/80 transition-colors flex items-center justify-center gap-2"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          Sign in with GitHub
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-500">
        Dont have an account? <Link href="/register" className="text-purple-400 hover:text-purple-300">Sign up here</Link>
      </div>
    </div>
  );
}