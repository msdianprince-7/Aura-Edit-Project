// src/app/[username]/page.tsx
import prisma from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";


export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  
  const resolvedParams = await params;
  const username = resolvedParams.username;

  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
    include: {
      photos: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700 mt-10">
      
      <div className="text-center space-y-4">
        <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full mx-auto p-1">
          <div className="w-full h-full bg-zinc-950 rounded-full flex items-center justify-center text-3xl font-bold uppercase">
            {user.username.charAt(0)}
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">@{user.username}</h1>
        <p className="text-zinc-400">Curating the digital aesthetic.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {user.photos.map((photo) => (
          <div 
            key={photo.id} 
            className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-zinc-900 border border-white/5"
          >
            <Image 
              src={photo.imageUrl} 
              alt={photo.caption || "Aura image"} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 pointer-events-none">
              <p className="text-white font-medium text-lg">{photo.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {user.photos.length === 0 && (
        <p className="text-center text-zinc-500 py-10">No photos uploaded yet.</p>
      )}

    </div>
  );
}