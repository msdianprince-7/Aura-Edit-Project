// src/app/feed/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFeedAction } from "@/app/actions/feed";
import FeedClient from "./FeedClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Feed | AuraEdit",
  description:
    "Your personalized feed of photos from creators you follow on AuraEdit.",
};

export default async function FeedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const currentUserId = session.user.id;
  const initialData = await getFeedAction();

  return (
    <FeedClient
      initialPhotos={initialData.photos}
      initialCursor={initialData.nextCursor}
      currentUserId={currentUserId}
    />
  );
}
