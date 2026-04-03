// src/app/dashboard/page.tsx
import Image from 'next/image';

const MOCK_PHOTOS = [
  { id: 1, url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop", caption: "Neon Nights" },
  { id: 2, url: "https://images.unsplash.com/photo-1549317336-206569e8475c?q=80&w=2574&auto=format&fit=crop", caption: "Monochrome Vibe" },
  { id: 3, url: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=2574&auto=format&fit=crop", caption: "Sunset Aura" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Dashboard Header */}
      <div className="flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Aura</h1>
          <p className="text-zinc-400 mt-2">Manage your aesthetic and uploaded media.</p>
        </div>
      </div>

      {/* The Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {MOCK_PHOTOS.map((photo) => (
          <div 
            key={photo.id} 
            className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer"
          >
            {/* Using a standard img tag for our mock data to avoid Next.js domain config errors */}
            <Image 
  src={photo.url} 
  alt={photo.caption} 
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover group-hover:scale-105 transition-transform duration-500"
/>
            
            {/* Dark gradient overlay that appears on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <p className="text-white font-medium text-lg">{photo.caption}</p>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
