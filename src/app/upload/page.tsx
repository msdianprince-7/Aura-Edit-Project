// src/app/upload/page.tsx
import { uploadPhotoAction } from "./action";

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Upload Studio</h1>
        <p className="text-zinc-400">Add a new photo to your Aura gallery.</p>
      </div>

      
      <form action={uploadPhotoAction} className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-white/5">
        
        <div className="space-y-2">
          <label htmlFor="imageUrl" className="text-sm font-medium text-zinc-300">
            Image URL
          </label>
          <input 
            type="url" 
            id="imageUrl" 
            name="imageUrl" 
            placeholder="https://images.unsplash.com/..." 
            required
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="caption" className="text-sm font-medium text-zinc-300">
            Caption
          </label>
          <input 
            type="text" 
            id="caption" 
            name="caption" 
            placeholder="Late night coding vibes..." 
            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-white text-black font-semibold py-3 rounded-lg mt-4 hover:bg-gray-200 transition-colors"
        >
          Publish to Gallery
        </button>

      </form>
    </div>
  );
}