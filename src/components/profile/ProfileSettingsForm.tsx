"use client";

import { useActionState, useEffect } from "react";
import { updateProfileAction } from "@/app/actions/user";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: "linear-gradient(135deg, var(--accent-rose), var(--accent-amber))",
        color: "var(--text-primary)",
      }}
    >
      {pending ? "Saving..." : "Save Changes"}
    </button>
  );
}

interface ProfileSettingsFormProps {
  initialUsername?: string;
  initialBio?: string | null;
}

export default function ProfileSettingsForm({
  initialUsername = "",
  initialBio = "",
}: ProfileSettingsFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, {} as any);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{
            background: "rgba(240, 112, 104, 0.1)",
            border: "1px solid var(--accent-rose)",
            color: "var(--accent-rose)",
          }}
        >
          {state.error}
        </div>
      )}

      {state?.success && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{
            background: "rgba(184, 140, 245, 0.1)",
            border: "1px solid var(--accent-lavender)",
            color: "var(--accent-lavender)",
          }}
        >
          {state.success}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="username"
          className="text-sm font-semibold tracking-wide uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue={initialUsername}
          required
          minLength={3}
          maxLength={30}
          className="w-full px-5 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
            // @ts-expect-error custom prop
            "--tw-ring-color": "rgba(184, 140, 245, 0.3)",
          }}
          placeholder="your_beautiful_username"
        />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Must be at least 3 characters. Only letters, numbers, and underscores allowed.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="text-sm font-semibold tracking-wide uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={initialBio || ""}
          rows={4}
          maxLength={160}
          className="w-full px-5 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 resize-none"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
            // @ts-expect-error custom prop
            "--tw-ring-color": "rgba(184, 140, 245, 0.3)",
          }}
          placeholder="Tell the community about yourself..."
        />
        <p className="text-xs text-right" style={{ color: "var(--text-muted)" }}>
          Max 160 characters
        </p>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <SubmitButton />
      </div>
    </form>
  );
}
