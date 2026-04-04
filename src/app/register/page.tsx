// src/app/register/page.tsx
import { registerUserAction } from "./action";


export default async function RegisterPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ error?: string }> 
}) {

  const resolvedSearchParams = await searchParams;
  const isUserExists = resolvedSearchParams?.error === "UserExists";

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-zinc-900 rounded-2xl border border-white/10 shadow-2xl">
      <h1 className="text-3xl font-bold mb-2 text-center">Create Account</h1>
      
      {isUserExists && (
        <div className="bg-amber-500/10 border border-amber-500/50 text-amber-500 p-3 rounded-lg mb-6 text-sm text-center">
          ⚠️ That username or email is already taken.
        </div>
      )}

      <form action={registerUserAction} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-zinc-400">Username</label>
          <input name="username" type="text" required placeholder="aura_king" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white mt-1 focus:border-purple-500 outline-none" />
        </div>
        
        <div>
          <label className="text-sm font-medium text-zinc-400">Email</label>
          <input name="email" type="email" required placeholder="you@example.com" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white mt-1 focus:border-purple-500 outline-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-400">Password</label>
          <input name="password" type="password" required placeholder="••••••••" className="w-full bg-black border border-white/10 rounded-lg p-3 text-white mt-1 focus:border-purple-500 outline-none" />
        </div>

        <button type="submit" className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-colors mt-4">
          Create Account
        </button>
      </form>
    </div>
  );
}