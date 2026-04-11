import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | AuraEdit",
  description: "Manage your AuraEdit profile settings.",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, bio: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div
      className="max-w-2xl mx-auto mt-10 space-y-8"
      style={{ animation: "slide-up 0.6s ease forwards" }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Profile Settings
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          Manage your public identity and how others see you on AuraEdit.
        </p>
      </div>

      <div
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <ProfileSettingsForm
          initialUsername={user.username}
          initialBio={user.bio}
        />
      </div>
    </div>
  );
}
