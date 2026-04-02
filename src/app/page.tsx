// app/page.tsx
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* The Main Headline */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
        Curate your <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Digital Aesthetic.
        </span>
      </h1>
      
      {/* The Subtitle */}
      <p className="text-zinc-400 max-w-xl text-lg md:text-xl leading-relaxed">
        The high-performance portfolio engine for creators. Upload your raw photos, apply Gen-Z filters, and share your aura with the world.
      </p>
      
      {/* The Call to Action */}
      <div className="pt-4 flex gap-4">
        <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform duration-300">
          Start Creating
        </button>
        <button className="bg-zinc-800 text-white px-8 py-3 rounded-full font-semibold hover:bg-zinc-700 transition-colors duration-300">
          View Gallery
        </button>
      </div>
      
    </div>
  );
}