// src/app/dashboard/page.tsx
import Image from 'next/image';
import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function Dashboard() {

  const photos = await prisma.photo.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Aura</h1>
          <p className="text-zinc-400 mt-2">Manage your aesthetic and uploaded media.</p>
        </div>
        <Link 
          href="/upload" 
          className="text-sm font-medium bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          + New Post
        </Link>
      </div>


      {photos.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
          <p className="text-zinc-400 mb-4">No photos in your gallery yet.</p>
          <Link href="/upload" className="text-purple-400 hover:text-purple-300 font-medium">
            Upload your first photo &rarr;
          </Link>
        </div>
      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="group relative aspect-4/5 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer"
            >
              <Image 
                src={photo.imageUrl} 
                alt={photo.caption || "Aura image"} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-medium text-lg">{photo.caption}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
}