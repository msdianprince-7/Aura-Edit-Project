// src/app/[username]/page.tsx
import prisma from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { buildCssFilter } from "@/lib/filters";


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
        },
        include: {
          appliedEdit: true,
        },
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
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {user.photos.length} photo{user.photos.length !== 1 ? "s" : ""} · {user.photos.filter(p => p.appliedEdit).length} edited
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {user.photos.map((photo) => {
          const edit = photo.appliedEdit;
          const filterString = edit
            ? buildCssFilter({
                brightness: edit.brightness,
                contrast: edit.contrast,
                saturation: (edit as Record<string, unknown>).saturation as number ?? 100,
                hueRotate: (edit as Record<string, unknown>).hueRotate as number ?? 0,
                sepia: (edit as Record<string, unknown>).sepia as number ?? 0,
                grayscale: (edit as Record<string, unknown>).grayscale as number ?? 0,
                blur: (edit as Record<string, unknown>).blur as number ?? 0,
              })
            : "none";

          return (
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
                style={{ filter: filterString }}
              />
              {/* Edit overlay tint */}
              {edit?.overlay && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: edit.overlay }}
                />
              )}
              {/* Filter badge */}
              {edit && edit.filterName !== "None" && (
                <div
                  className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: "rgba(13, 10, 18, 0.7)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--accent-lavender)",
                  }}
                >
                  {edit.filterName}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 pointer-events-none">
                <p className="text-white font-medium text-lg">{photo.caption}</p>
              </div>
            </div>
          );
        })}
      </div>

      {user.photos.length === 0 && (
        <p className="text-center text-zinc-500 py-10">No photos uploaded yet.</p>
      )}

    </div>
  );
}